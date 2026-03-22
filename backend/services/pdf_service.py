"""
PDF解析サービス

PyMuPDFを使用してPDFの各ページからテキストと画像を抽出する。
AI用画像（WebP・軽量）と動画用画像（PNG・高解像度）の2種類を生成する。
"""
import os
import io
import fitz  # PyMuPDF
from PIL import Image
from typing import List, Dict, Any
from collections import Counter

# AI用画像の設定
AI_IMAGE_MAX_WIDTH = 1024
AI_IMAGE_QUALITY = 80  # WebP品質（0-100）


def _is_garbled(text: str) -> bool:
    """テキストが文字化けしているか簡易判定する"""
    if not text or len(text.strip()) < 4:
        return False
    cleaned = text.replace("\n", "").replace(" ", "").replace("\t", "")
    if len(cleaned) < 4:
        return False

    # 制御文字（U+0000〜U+001F、ただし改行・タブ除く）や
    # 私用領域（U+E000〜U+F8FF）の割合が高ければ文字化け
    suspicious = sum(
        1 for c in cleaned
        if ("\u0000" <= c <= "\u001f" and c not in "\n\r\t")
        or "\ue000" <= c <= "\uf8ff"
        or "\ufff0" <= c <= "\uffff"
    )
    if len(cleaned) > 0 and suspicious / len(cleaned) > 0.1:
        return True

    return False


def _convert_to_webp(png_path: str, webp_path: str, max_width: int = AI_IMAGE_MAX_WIDTH, quality: int = AI_IMAGE_QUALITY) -> str:
    """
    PNG画像をWebPに変換し、指定幅にリサイズする。

    Args:
        png_path: 元のPNG画像パス
        webp_path: 出力WebP画像パス
        max_width: 最大幅（ピクセル）
        quality: WebP品質（0-100）

    Returns:
        生成されたWebP画像のパス
    """
    with Image.open(png_path) as img:
        # 幅がmax_widthを超える場合のみリサイズ
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)

        # WebPで保存
        img.save(webp_path, format="WebP", quality=quality)

    return webp_path


def parse_pdf(file_path: str, work_dir: str) -> List[Dict[str, Any]]:
    """
    PDFファイルを解析し、各ページのテキストと画像パスを返す。
    AI用画像（WebP・軽量）と動画用画像（PNG・高解像度）の2種類を生成する。

    Args:
        file_path: PDFファイルのパス
        work_dir: 画像を保存する作業ディレクトリ

    Returns:
        ページ情報のリスト
        [
            {
                "page_number": 1,
                "text": "スライドのテキスト内容",
                "image_path": "/path/to/page_1.png",        # 動画用（高解像度PNG）
                "ai_image_path": "/path/to/page_1_ai.webp"  # AI用（軽量WebP）
            },
            ...
        ]
    """
    doc = fitz.open(file_path)
    pages = []

    for i, page in enumerate(doc):
        page_number = i + 1

        # テキスト抽出
        raw_text = page.get_text().strip()
        if _is_garbled(raw_text):
            print(f"[PDFService] Page {page_number}: garbled text detected, skipping text")
            text = ""
        else:
            text = raw_text

        # 動画用画像: 高解像度PNG（2倍解像度）
        video_image_filename = f"page_{page_number}.png"
        video_image_path = os.path.join(work_dir, video_image_filename)
        matrix = fitz.Matrix(2.0, 2.0)
        pix = page.get_pixmap(matrix=matrix)
        pix.save(video_image_path)

        # AI用画像: 軽量WebP（1024px幅・品質80%）
        ai_image_filename = f"page_{page_number}_ai.webp"
        ai_image_path = os.path.join(work_dir, ai_image_filename)
        _convert_to_webp(video_image_path, ai_image_path)

        # ファイルサイズをログ出力
        png_size = os.path.getsize(video_image_path) / 1024
        webp_size = os.path.getsize(ai_image_path) / 1024
        ratio = webp_size / png_size * 100 if png_size > 0 else 0
        print(f"[PDFService] Page {page_number}/{len(doc)}: PNG={png_size:.0f}KB, WebP={webp_size:.0f}KB ({ratio:.0f}%)")

        pages.append({
            "page_number": page_number,
            "text": text,
            "image_path": video_image_path,      # 動画用（FFmpeg）
            "ai_image_path": ai_image_path,       # AI用（台本生成）
        })

    doc.close()
    return pages
    