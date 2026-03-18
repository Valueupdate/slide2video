"""
PDF解析サービス

PyMuPDFを使用してPDFの各ページからテキストと画像を抽出する。
"""
import os
import fitz  # PyMuPDF
from typing import List, Dict, Any
from collections import Counter


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


def parse_pdf(file_path: str, work_dir: str) -> List[Dict[str, Any]]:
    """
    PDFファイルを解析し、各ページのテキストと画像パスを返す。

    Args:
        file_path: PDFファイルのパス
        work_dir: 画像を保存する作業ディレクトリ

    Returns:
        ページ情報のリスト
        [
            {
                "page_number": 1,
                "text": "スライドのテキスト内容",
                "image_path": "/path/to/page_1.png"
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

        # ページ画像をPNGとして保存（2倍解像度）
        image_filename = f"page_{page_number}.png"
        image_path = os.path.join(work_dir, image_filename)
        matrix = fitz.Matrix(2.0, 2.0)
        pix = page.get_pixmap(matrix=matrix)
        pix.save(image_path)

        pages.append({
            "page_number": page_number,
            "text": text,
            "image_path": image_path,
        })

        print(f"[PDFService] Parsed page {page_number}/{len(doc)}")

    doc.close()
    return pages
