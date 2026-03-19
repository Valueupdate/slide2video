"""
AI台本生成サービス

Gemini / OpenAI APIを使用して各スライドの台本を生成する。
ユーザーのAPIキーを受け取り、処理後に保持しない。
"""
import json
import re
import os
import asyncio
import time
from typing import List, Dict, Any, Optional, Callable, Awaitable

from config import GEMINI_MODEL, OPENAI_MODEL, OPENROUTER_MODEL, OPENROUTER_BASE_URL


SCRIPT_PROMPT_TEMPLATE = """あなたはプロのプレゼンターです。
以下のスライド内容に基づいて、自然で説得力のあるプレゼンテーションの台本を作成してください。

スライド内容:
{slide_text}
（※画像が提供されている場合、テキストが読めなければ画像を優先して内容を把握してください）

制約事項:
- 1スライドあたり5〜10文程度で、しっかりと内容を説明してください。
- 聴衆に語りかけるような自然な表現にしてください。
- 専門用語があれば簡潔に解説を加えてください。
- 出力は台本テキストのみを返してください。JSON不要です。余分な前置き・後書き不要です。"""


async def generate_scripts(
    pages: List[Dict[str, Any]],
    ai_provider: str,
    api_key: str,
    progress_callback: Optional[Callable[[int, str], Awaitable[None]]] = None,
    ai_model: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    全ページの台本を生成する。

    Args:
        pages: pdf_service.parse_pdf の戻り値
        ai_provider: "gemini" or "openai"
        api_key: ユーザーのAPIキー
        progress_callback: async def callback(progress_percent, message)

    Returns:
        各ページに "script" フィールドを追加したリスト
    """
    total = len(pages)

    for i, page in enumerate(pages):
        page_num = page["page_number"]
        if progress_callback:
            pct = 10 + int((i / total) * 40)
            await progress_callback(pct, f"スライド {page_num}/{total} の台本生成中...")

        prompt = SCRIPT_PROMPT_TEMPLATE.format(slide_text=page["text"] or "(テキストなし — 画像を参照)")

        if ai_provider == "gemini":
            script = await _generate_with_gemini(prompt, page["image_path"], api_key)
        elif ai_provider == "openai":
            script = await _generate_with_openai(prompt, page["image_path"], api_key)
        elif ai_provider == "openrouter":
            model = ai_model or OPENROUTER_MODEL
            script = await _generate_with_openrouter(prompt, page["image_path"], api_key, model)
        else:
            raise ValueError(f"未対応のAIプロバイダ: {ai_provider}")

        page["script"] = script
        print(f"[AIService] Generated script for page {page_num}/{total} ({len(script)} chars)")

    return pages


async def _generate_with_gemini(prompt: str, image_path: str, api_key: str) -> str:
    """Gemini APIで台本を生成する"""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    parts = [types.Part.from_text(text=prompt)]

    # 画像を添付
    if image_path and os.path.exists(image_path):
        try:
            with open(image_path, "rb") as f:
                image_bytes = f.read()
            parts.append(types.Part.from_bytes(data=image_bytes, mime_type="image/png"))
        except Exception as e:
            print(f"[AIService] Failed to load image for Gemini: {e}")

    max_retries = 3
    retry_delay = 10.0

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
                # partsから取得を試みる
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
                print(f"[AIService] Gemini 429, waiting {retry_delay}s... (attempt {attempt + 1})")
                await asyncio.sleep(retry_delay)
                retry_delay *= 1.5
                continue
            raise Exception(f"Gemini API エラー: {err_str}")


async def _generate_with_openai(prompt: str, image_path: str, api_key: str) -> str:
    """OpenAI APIで台本を生成する"""
    import base64
    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    messages_content = [{"type": "text", "text": prompt}]

    # 画像を添付
    if image_path and os.path.exists(image_path):
        try:
            with open(image_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            messages_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{b64}"},
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


async def _generate_with_openrouter(prompt: str, image_path: str, api_key: str, model: str = OPENROUTER_MODEL) -> str:
    """OpenRouter APIで台本を生成する（OpenAI互換）"""
    import base64
    from openai import OpenAI

    client = OpenAI(
        api_key=api_key,
        base_url=OPENROUTER_BASE_URL,
    )

    messages_content = [{"type": "text", "text": prompt}]

    if image_path and os.path.exists(image_path):
        try:
            with open(image_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            messages_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{b64}"},
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
