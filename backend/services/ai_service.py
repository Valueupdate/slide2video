"""
AI台本生成サービス

Gemini / OpenAI APIを使用して各スライドの台本を生成する。
ユーザーのAPIキーを受け取り、処理後に保持しない。
バッチ生成モード: 複数スライドを1リクエストにまとめてAPIリクエスト数を削減。
"""
import json
import re
import os
import asyncio
import time
from typing import List, Dict, Any, Optional, Callable, Awaitable

from config import GEMINI_MODEL, OPENAI_MODEL, OPENROUTER_MODEL, OPENROUTER_BASE_URL

# バッチ台本生成の設定
DEFAULT_BATCH_SIZE = 10  # デフォルトのバッチサイズ（1リクエストあたりのスライド数）
MAX_BATCH_SIZE = 15      # 最大バッチサイズ

SCRIPT_PROMPT_TEMPLATE = """You are a professional presenter.
Based on the slide content below, write a natural and engaging presentation narration script.

Slide content:
{slide_text}
(If an image is provided and text is unclear, prioritize the image content.)

Requirements:
{duration_instruction}
{language_instruction}
- Write in a conversational tone as if speaking directly to the audience.
- Do NOT repeat the same sentence or phrase.
- Each sentence must be complete and grammatically correct.
- If technical terms appear, briefly explain them in plain language.
- Output the script text ONLY. No JSON, no preamble, no postamble."""

BATCH_PROMPT_TEMPLATE = """You are a professional presenter.
Based on the multiple slide contents below, write a natural and engaging narration script for EACH slide.

{slides_section}

Requirements:
{duration_instruction}
{language_instruction}
- Write in a conversational tone as if speaking directly to the audience.
- Do NOT repeat the same sentence or phrase within or across slides.
- Each sentence must be complete and grammatically correct.
- If technical terms appear, briefly explain them in plain language.
- You MUST separate each slide's script using EXACTLY this format:

---SLIDE_1---
(script for slide 1)
---SLIDE_2---
(script for slide 2)

IMPORTANT: Always include the ---SLIDE_N--- separator. Output script text only. No extra explanation."""


# 出力言語の設定
OUTPUT_LANGUAGES = {
    "auto": {"label": "原文のまま（自動判定）", "instruction": "- スライドの原文と同じ言語で台本を作成してください。"},
    "ja": {"label": "日本語", "instruction": "- 台本は必ず流暢で自然な日本語で作成してください。プロのプレゼンテーションに適した表現を使ってください。スライドが他の言語の場合は日本語に翻訳してください。同じ文や表現を繰り返さず、各文を完結させてください。"},
    "en": {"label": "English", "instruction": "- The script MUST be written in fluent, natural English suitable for a professional presentation. If the slides are in another language, translate the content into English. Avoid repetition and ensure every sentence is complete."},
    "zh-CN": {"label": "中文（简体）", "instruction": "- 台本必须用流畅自然的简体中文撰写，适合专业演示场合。如果幻灯片是其他语言，请翻译成中文。不得重复句子，每句话必须完整。"},
    "ko": {"label": "한국어", "instruction": "- 대본은 반드시 자연스럽고 유창한 한국어로 작성하세요. 전문 발표에 적합한 표현을 사용하세요. 슬라이드가 다른 언어인 경우 한국어로 번역하세요. 문장을 반복하지 말고 각 문장을 완전하게 작성하세요."},
    "fr": {"label": "Français", "instruction": "- Le script DOIT être rédigé en français courant et naturel, adapté à une présentation professionnelle. Si les diapositives sont dans une autre langue, traduisez en français. Ne répétez pas les phrases et assurez-vous que chaque phrase est complète."},
    "es": {"label": "Español", "instruction": "- El guión DEBE estar escrito en español fluido y natural, adecuado para una presentación profesional. Si las diapositivas están en otro idioma, tradúzcalas al español. No repita frases y asegúrese de que cada oración esté completa."},
    "de": {"label": "Deutsch", "instruction": "- Das Skript MUSS auf fließendem, natürlichem Deutsch verfasst werden, das für eine professionelle Präsentation geeignet ist. Falls die Folien in einer anderen Sprache sind, übersetzen Sie ins Deutsche. Wiederholen Sie keine Sätze und stellen Sie sicher, dass jeder Satz vollständig ist."},
    "pt": {"label": "Português", "instruction": "- O roteiro DEVE ser escrito em português fluente e natural, adequado para uma apresentação profissional. Se os slides estiverem em outro idioma, traduza para português. Não repita frases e certifique-se de que cada frase esteja completa."},
}


def _build_language_instruction(output_language: str) -> str:
    """出力言語に応じたプロンプト指示文を生成する"""
    lang_info = OUTPUT_LANGUAGES.get(output_language)
    if lang_info:
        return lang_info["instruction"]
    return OUTPUT_LANGUAGES["ja"]["instruction"]


def _build_duration_instruction(target_duration: int) -> str:
    """目標秒数に応じた台本分量の指示文を生成する"""
    if target_duration <= 0:
        return "- 1スライドあたり5〜10文程度で、しっかりと内容を説明してください。"

    chars = target_duration * 6
    sentences = max(2, target_duration // 6)
    return (
        f"- 各スライドの読み上げ時間が約{target_duration}秒になるよう、{chars}文字前後（{sentences}文程度）で台本を作成してください。\n"
        f"- 短すぎず長すぎず、{target_duration}秒に収まる分量を厳守してください。"
    )


def _get_ai_image_path(page: Dict[str, Any]) -> Optional[str]:
    """ページ情報からAI用画像パスを取得する（WebP優先、フォールバックでPNG）"""
    ai_path = page.get("ai_image_path")
    if ai_path and os.path.exists(ai_path):
        return ai_path
    img_path = page.get("image_path")
    if img_path and os.path.exists(img_path):
        return img_path
    return None


def _get_image_mime_type(image_path: str) -> str:
    """画像パスからMIMEタイプを判定する"""
    ext = os.path.splitext(image_path)[1].lower()
    mime_types = {
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
    }
    return mime_types.get(ext, "image/png")


def _parse_batch_response(response_text: str, expected_count: int) -> List[str]:
    """
    バッチレスポンスを ---SLIDE_N--- 区切りでパースする。

    Args:
        response_text: AIからのレスポンステキスト
        expected_count: 期待するスライド数

    Returns:
        各スライドの台本テキストのリスト
    """
    # ---SLIDE_N--- パターンで分割（大文字小文字・スペース揺れに対応）
    pattern = r"-{2,}SLIDE_\d+-{2,}"
    parts = re.split(pattern, response_text, flags=re.IGNORECASE)

    # 最初の空要素（区切りの前のテキスト）を除去
    scripts = [part.strip() for part in parts if part.strip()]

    # 期待数と一致した場合はそのまま返す
    if len(scripts) == expected_count:
        return scripts

    print(f"[AIService] Batch parse: expected {expected_count}, got {len(scripts)}")

    # フォールバック1: ダブル改行で分割
    alt_scripts = [s.strip() for s in response_text.split("\n\n\n") if s.strip()]
    if len(alt_scripts) == expected_count:
        print(f"[AIService] Batch parse: fallback to triple-newline split")
        return alt_scripts

    # フォールバック2: ダブル改行（2つ）で分割
    alt_scripts2 = [s.strip() for s in response_text.split("\n\n") if s.strip()]
    if len(alt_scripts2) == expected_count:
        print(f"[AIService] Batch parse: fallback to double-newline split")
        return alt_scripts2

    # フォールバック3: 期待数より多い場合は先頭からN個取る
    if len(scripts) > expected_count:
        print(f"[AIService] Batch parse: trimming to expected count")
        return scripts[:expected_count]

    # それでも一致しない場合はそのまま返す（呼び出し元でフォールバック）
    return scripts


def _create_batch_groups(pages: List[Dict[str, Any]], batch_size: int) -> List[List[Dict[str, Any]]]:
    """ページをバッチサイズごとにグループ化する"""
    groups = []
    for i in range(0, len(pages), batch_size):
        groups.append(pages[i:i + batch_size])
    return groups


async def generate_scripts(
    pages: List[Dict[str, Any]],
    ai_provider: str,
    api_key: str,
    progress_callback: Optional[Callable[[int, str], Awaitable[None]]] = None,
    ai_model: Optional[str] = None,
    target_duration: int = 0,
    batch_size: int = DEFAULT_BATCH_SIZE,
    output_language: str = "ja",
) -> List[Dict[str, Any]]:
    """
    全ページの台本を生成する。バッチモードで複数スライドを1リクエストにまとめる。

    Args:
        pages: pdf_service.parse_pdf の戻り値
        ai_provider: "gemini" or "openai" or "openrouter"
        api_key: ユーザーのAPIキー
        progress_callback: async def callback(progress_percent, message)
        ai_model: OpenRouter使用時のモデル名
        target_duration: 1スライドあたりの目標秒数（0=自動）
        batch_size: 1リクエストあたりのスライド数（デフォルト3）
        output_language: 出力言語コード（"ja", "en", "auto" 等）

    Returns:
        各ページに "script" フィールドを追加したリスト
    """
    total = len(pages)
    batch_size = min(batch_size, MAX_BATCH_SIZE)

    # 1枚の場合はバッチ不要
    if total <= 1:
        batch_size = 1

    if batch_size <= 1:
        # 従来の1枚ずつ生成
        return await _generate_scripts_single(
            pages, ai_provider, api_key, progress_callback, ai_model, target_duration, output_language
        )

    # バッチ生成
    groups = _create_batch_groups(pages, batch_size)
    total_groups = len(groups)
    processed_pages = 0

    print(f"[AIService] Batch mode: {total} pages in {total_groups} batches (size={batch_size}), language={output_language}")

    for group_idx, group in enumerate(groups):
        if progress_callback:
            pct = 10 + int((processed_pages / total) * 40)
            page_range = f"{group[0]['page_number']}-{group[-1]['page_number']}"
            if output_language in ("ja", "auto"):
                await progress_callback(pct, f"スライド {page_range}/{total} の台本生成中（バッチ {group_idx + 1}/{total_groups}）...")
            elif output_language == "zh-CN":
                await progress_callback(pct, f"正在生成幻灯片 {page_range}/{total} 的脚本（批次 {group_idx + 1}/{total_groups}）...")
            elif output_language == "ko":
                await progress_callback(pct, f"슬라이드 {page_range}/{total} 스크립트 생성 중（배치 {group_idx + 1}/{total_groups}）...")
            else:
                await progress_callback(pct, f"Generating script for slides {page_range}/{total} (batch {group_idx + 1}/{total_groups})...")

        # Gemini無料枠のレート制限対策
        if group_idx > 0 and ai_provider == "gemini":
            await asyncio.sleep(4)

        # バッチ生成を試行
        try:
            scripts = await _generate_batch(group, ai_provider, api_key, ai_model, target_duration, output_language)

            if len(scripts) == len(group):
                # バッチ成功: 各ページに台本を割り当て
                for page, script in zip(group, scripts):
                    page["script"] = script
                    print(f"[AIService] Batch script for page {page['page_number']}/{total} ({len(script)} chars): {script[:100]}")
                processed_pages += len(group)
                continue

        except Exception as e:
            print(f"[AIService] Batch failed for group {group_idx + 1}: {e}")

        # バッチ失敗: 1枚ずつフォールバック
        print(f"[AIService] Falling back to single mode for group {group_idx + 1}")
        for page in group:
            if progress_callback:
                pct = 10 + int((processed_pages / total) * 40)
                if output_language in ("ja", "auto"):
                    await progress_callback(pct, f"スライド {page['page_number']}/{total} の台本生成中（個別）...")
                elif output_language == "zh-CN":
                    await progress_callback(pct, f"正在生成幻灯片 {page['page_number']}/{total} 的脚本（单独）...")
                elif output_language == "ko":
                    await progress_callback(pct, f"슬라이드 {page['page_number']}/{total} 스크립트 생성 중（개별）...")
                else:
                    await progress_callback(pct, f"Generating script for slide {page['page_number']}/{total} (individual)...")

            if processed_pages > 0 and ai_provider == "gemini":
                await asyncio.sleep(4)

            ai_image = _get_ai_image_path(page)
            duration_instruction = _build_duration_instruction(target_duration)
            language_instruction = _build_language_instruction(output_language)
            prompt = SCRIPT_PROMPT_TEMPLATE.format(
                slide_text=page["text"] or "(テキストなし — 画像を参照)",
                duration_instruction=duration_instruction,
                language_instruction=language_instruction,
            )

            try:
                if ai_provider == "gemini":
                    script = await _generate_with_gemini(prompt, ai_image, api_key)
                elif ai_provider == "openai":
                    script = await _generate_with_openai(prompt, ai_image, api_key)
                elif ai_provider == "openrouter":
                    model = ai_model or OPENROUTER_MODEL
                    script = await _generate_with_openrouter(prompt, ai_image, api_key, model)
                else:
                    raise ValueError(f"未対応のAIプロバイダ: {ai_provider}")
                page["script"] = script
            except Exception as fallback_err:
                page["script"] = "(台本の生成に失敗しました)"
                print(f"[AIService] Fallback also failed for page {page['page_number']}: {fallback_err}")

            processed_pages += 1

    return pages


async def _generate_batch(
    group: List[Dict[str, Any]],
    ai_provider: str,
    api_key: str,
    ai_model: Optional[str],
    target_duration: int,
    output_language: str = "ja",
) -> List[str]:
    """
    バッチ（複数スライド）の台本を1リクエストで生成する。

    Returns:
        各スライドの台本テキストのリスト
    """
    # スライドセクションを構築
    slides_section_parts = []
    for i, page in enumerate(group):
        text = page["text"] or "(テキストなし — 画像を参照)"
        slides_section_parts.append(f"【スライド{i + 1}（ページ{page['page_number']}）】\n{text}")

    slides_section = "\n\n".join(slides_section_parts)
    duration_instruction = _build_duration_instruction(target_duration)
    language_instruction = _build_language_instruction(output_language)

    prompt = BATCH_PROMPT_TEMPLATE.format(
        slides_section=slides_section,
        duration_instruction=duration_instruction,
        language_instruction=language_instruction,
    )

    print(f"[AIService] Batch prompt language instruction: {language_instruction}")

    # 全スライドの画像を収集
    images = []
    for page in group:
        ai_image = _get_ai_image_path(page)
        if ai_image:
            images.append(ai_image)

    # プロバイダー別にバッチリクエスト
    if ai_provider == "gemini":
        response_text = await _generate_with_gemini_batch(prompt, images, api_key)
    elif ai_provider == "openai":
        response_text = await _generate_with_openai_batch(prompt, images, api_key)
    elif ai_provider == "openrouter":
        model = ai_model or OPENROUTER_MODEL
        response_text = await _generate_with_openrouter_batch(prompt, images, api_key, model)
    else:
        raise ValueError(f"未対応のAIプロバイダ: {ai_provider}")

    # レスポンスをパース
    return _parse_batch_response(response_text, len(group))


async def _generate_scripts_single(
    pages: List[Dict[str, Any]],
    ai_provider: str,
    api_key: str,
    progress_callback: Optional[Callable[[int, str], Awaitable[None]]] = None,
    ai_model: Optional[str] = None,
    target_duration: int = 0,
    output_language: str = "ja",
) -> List[Dict[str, Any]]:
    """従来の1枚ずつ台本生成（フォールバック用）"""
    total = len(pages)

    for i, page in enumerate(pages):
        page_num = page["page_number"]
        if progress_callback:
            pct = 10 + int((i / total) * 40)
            if output_language in ("ja", "auto"):
                await progress_callback(pct, f"スライド {page_num}/{total} の台本生成中...")
            elif output_language == "zh-CN":
                await progress_callback(pct, f"正在生成幻灯片 {page_num}/{total} 的脚本...")
            elif output_language == "ko":
                await progress_callback(pct, f"슬라이드 {page_num}/{total} 스크립트 생성 중...")
            else:
                await progress_callback(pct, f"Generating script for slide {page_num}/{total}...")

        if i > 0 and ai_provider == "gemini":
            await asyncio.sleep(4)

        duration_instruction = _build_duration_instruction(target_duration)
        language_instruction = _build_language_instruction(output_language)
        prompt = SCRIPT_PROMPT_TEMPLATE.format(
            slide_text=page["text"] or "(テキストなし — 画像を参照)",
            duration_instruction=duration_instruction,
            language_instruction=language_instruction,
        )

        ai_image = _get_ai_image_path(page)

        if ai_provider == "gemini":
            script = await _generate_with_gemini(prompt, ai_image, api_key)
        elif ai_provider == "openai":
            script = await _generate_with_openai(prompt, ai_image, api_key)
        elif ai_provider == "openrouter":
            model = ai_model or OPENROUTER_MODEL
            script = await _generate_with_openrouter(prompt, ai_image, api_key, model)
        else:
            raise ValueError(f"未対応のAIプロバイダ: {ai_provider}")

        page["script"] = script
        print(f"[AIService] Generated script for page {page_num}/{total} ({len(script)} chars)")

    return pages


# ─── 単体リクエスト（1スライド用） ────────────────────

async def _generate_with_gemini(prompt: str, image_path: Optional[str], api_key: str) -> str:
    """Gemini APIで台本を生成する（1スライド）"""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    parts = [types.Part.from_text(text=prompt)]

    if image_path and os.path.exists(image_path):
        try:
            mime_type = _get_image_mime_type(image_path)
            with open(image_path, "rb") as f:
                image_bytes = f.read()
            parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
        except Exception as e:
            print(f"[AIService] Failed to load image for Gemini: {e}")

    max_retries = 5
    retry_delay = 15.0

    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=GEMINI_MODEL,
                contents=parts,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=2500,
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
            )
            text = (response.text or "").strip()
            if not text:
                try:
                    answer_parts = [
                        p.text for p in response.candidates[0].content.parts
                        if hasattr(p, "text") and p.text and not getattr(p, "thought", False)
                    ]
                    text = "".join(answer_parts).strip()
                except Exception:
                    pass
            return text or "(台本を生成できませんでした)"

        except Exception as e:
            err_str = str(e)
            is_rate_limit = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str
            if is_rate_limit and attempt < max_retries - 1:
                wait_time = retry_delay
                import re as _re
                retry_match = _re.search(r"retry in ([\d.]+)s", err_str, _re.IGNORECASE)
                if retry_match:
                    wait_time = float(retry_match.group(1)) + 2.0
                print(f"[AIService] Gemini 429, waiting {wait_time:.0f}s... (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
            raise Exception(f"Gemini API エラー: {err_str}")


async def _generate_with_openai(prompt: str, image_path: Optional[str], api_key: str) -> str:
    """OpenAI APIで台本を生成する（1スライド）"""
    import base64
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    messages_content = [{"type": "text", "text": prompt}]

    if image_path and os.path.exists(image_path):
        try:
            mime_type = _get_image_mime_type(image_path)
            with open(image_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            messages_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime_type};base64,{b64}"},
            })
        except Exception as e:
            print(f"[AIService] Failed to load image for OpenAI: {e}")

    max_retries = 3
    retry_delay = 10.0

    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                lambda: client.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "あなたはプロの台本ライターです。指示に従い、台本テキストのみを出力してください。"},
                        {"role": "user", "content": messages_content},
                    ],
                    max_tokens=2500,
                    temperature=0.7,
                )
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            err_str = str(e)
            is_rate_limit = "429" in err_str or "rate_limit" in err_str.lower()
            if is_rate_limit and attempt < max_retries - 1:
                print(f"[AIService] OpenAI 429, waiting {retry_delay}s... (attempt {attempt + 1})")
                await asyncio.sleep(retry_delay)
                retry_delay *= 1.5
                continue
            raise Exception(f"OpenAI API エラー: {err_str}")


async def _generate_with_openrouter(prompt: str, image_path: Optional[str], api_key: str, model: str = OPENROUTER_MODEL) -> str:
    """OpenRouter APIで台本を生成する（1スライド）"""
    import base64
    from openai import OpenAI

    client = OpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)
    messages_content = [{"type": "text", "text": prompt}]

    if image_path and os.path.exists(image_path):
        try:
            mime_type = _get_image_mime_type(image_path)
            with open(image_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            messages_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime_type};base64,{b64}"},
            })
        except Exception as e:
            print(f"[AIService] Failed to load image for OpenRouter: {e}")

    max_retries = 3
    retry_delay = 10.0

    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                lambda: client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "あなたはプロの台本ライターです。指示に従い、台本テキストのみを出力してください。"},
                        {"role": "user", "content": messages_content},
                    ],
                    max_tokens=2500,
                    temperature=0.7,
                )
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            err_str = str(e)
            is_rate_limit = "429" in err_str or "rate_limit" in err_str.lower()
            if is_rate_limit and attempt < max_retries - 1:
                print(f"[AIService] OpenRouter 429, waiting {retry_delay}s... (attempt {attempt + 1})")
                await asyncio.sleep(retry_delay)
                retry_delay *= 1.5
                continue
            raise Exception(f"OpenRouter API エラー: {err_str}")


# ─── バッチリクエスト（複数スライド用） ─────────────────

async def _generate_with_gemini_batch(prompt: str, image_paths: List[str], api_key: str) -> str:
    """Gemini APIでバッチ台本を生成する（複数スライド）"""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    parts = [types.Part.from_text(text=prompt)]

    for image_path in image_paths:
        if image_path and os.path.exists(image_path):
            try:
                mime_type = _get_image_mime_type(image_path)
                with open(image_path, "rb") as f:
                    image_bytes = f.read()
                parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
            except Exception as e:
                print(f"[AIService] Failed to load image for Gemini batch: {e}")

    max_retries = 5
    retry_delay = 15.0

    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=GEMINI_MODEL,
                contents=parts,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=8000,
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
            )
            text = (response.text or "").strip()
            if not text:
                try:
                    answer_parts = [
                        p.text for p in response.candidates[0].content.parts
                        if hasattr(p, "text") and p.text and not getattr(p, "thought", False)
                    ]
                    text = "".join(answer_parts).strip()
                except Exception:
                    pass
            return text or "(台本を生成できませんでした)"
        except Exception as e:
            err_str = str(e)
            is_rate_limit = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str
            if is_rate_limit and attempt < max_retries - 1:
                wait_time = retry_delay
                import re as _re
                retry_match = _re.search(r"retry in ([\d.]+)s", err_str, _re.IGNORECASE)
                if retry_match:
                    wait_time = float(retry_match.group(1)) + 2.0
                print(f"[AIService] Gemini batch 429, waiting {wait_time:.0f}s... (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
            raise Exception(f"Gemini API エラー: {err_str}")


async def _generate_with_openai_batch(prompt: str, image_paths: List[str], api_key: str) -> str:
    """OpenAI APIでバッチ台本を生成する（複数スライド）"""
    import base64
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    messages_content = [{"type": "text", "text": prompt}]

    for image_path in image_paths:
        if image_path and os.path.exists(image_path):
            try:
                mime_type = _get_image_mime_type(image_path)
                with open(image_path, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode("utf-8")
                messages_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{b64}"},
                })
            except Exception as e:
                print(f"[AIService] Failed to load image for OpenAI batch: {e}")

    max_retries = 3
    retry_delay = 10.0

    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                lambda: client.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "あなたはプロの台本ライターです。指示に従い、指定された形式で台本テキストのみを出力してください。"},
                        {"role": "user", "content": messages_content},
                    ],
                    max_tokens=8000,
                    temperature=0.7,
                )
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            err_str = str(e)
            is_rate_limit = "429" in err_str or "rate_limit" in err_str.lower()
            if is_rate_limit and attempt < max_retries - 1:
                print(f"[AIService] OpenAI batch 429, waiting {retry_delay}s... (attempt {attempt + 1})")
                await asyncio.sleep(retry_delay)
                retry_delay *= 1.5
                continue
            raise Exception(f"OpenAI API エラー: {err_str}")


async def _generate_with_openrouter_batch(prompt: str, image_paths: List[str], api_key: str, model: str = OPENROUTER_MODEL) -> str:
    """OpenRouter APIでバッチ台本を生成する（複数スライド）"""
    import base64
    from openai import OpenAI

    client = OpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)
    messages_content = [{"type": "text", "text": prompt}]

    for image_path in image_paths:
        if image_path and os.path.exists(image_path):
            try:
                mime_type = _get_image_mime_type(image_path)
                with open(image_path, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode("utf-8")
                messages_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{b64}"},
                })
            except Exception as e:
                print(f"[AIService] Failed to load image for OpenRouter batch: {e}")

    max_retries = 3
    retry_delay = 10.0

    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                lambda: client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "あなたはプロの台本ライターです。指示に従い、指定された形式で台本テキストのみを出力してください。"},
                        {"role": "user", "content": messages_content},
                    ],
                    max_tokens=8000,
                    temperature=0.7,
                )
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            err_str = str(e)
            is_rate_limit = "429" in err_str or "rate_limit" in err_str.lower()
            if is_rate_limit and attempt < max_retries - 1:
                print(f"[AIService] OpenRouter batch 429, waiting {retry_delay}s... (attempt {attempt + 1})")
                await asyncio.sleep(retry_delay)
                retry_delay *= 1.5
                continue
            raise Exception(f"OpenRouter API エラー: {err_str}")
