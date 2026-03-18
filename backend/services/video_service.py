"""
動画生成サービス

FFmpegを直接呼び出してスライド画像+音声からMP4動画を生成する。
"""
import os
import subprocess
import asyncio
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor

_executor = ThreadPoolExecutor(max_workers=2)


def _run_ffmpeg(cmd: list[str]) -> tuple[int, str]:
    """FFmpegコマンドを同期的に実行し、戻り値とstderrを返す"""
    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    stderr_text = result.stderr.decode("utf-8", errors="replace")
    return result.returncode, stderr_text


async def generate_video(
    pages: List[Dict[str, Any]],
    output_path: str,
) -> str:
    """
    スライド画像と音声を合成してMP4動画を生成する。

    Args:
        pages: 各ページに image_path, audio_path が含まれるリスト
        output_path: 出力MP4ファイルのパス

    Returns:
        生成された動画ファイルのパス
    """
    loop = asyncio.get_event_loop()
    work_dir = os.path.dirname(output_path)
    concat_list_path = os.path.join(work_dir, "concat_list.txt")
    segment_paths = []

    # 各スライドをFFmpegで個別の動画セグメントにする
    for i, page in enumerate(pages):
        image_path = page.get("image_path")
        audio_path = page.get("audio_path")

        if not image_path or not os.path.exists(image_path):
            print(f"[VideoService] Skipping page {i + 1}: no image")
            continue
        if not audio_path or not os.path.exists(audio_path):
            print(f"[VideoService] Skipping page {i + 1}: no audio")
            continue

        segment_path = os.path.join(work_dir, f"segment_{i:03d}.mp4")

        cmd = [
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", image_path,
            "-i", audio_path,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black",
            "-shortest",
            segment_path,
        ]

        returncode, stderr_text = await loop.run_in_executor(_executor, _run_ffmpeg, cmd)

        if returncode != 0:
            print(f"[VideoService] FFmpeg error on page {i + 1}: {stderr_text[-500:]}")
            continue

        segment_paths.append(segment_path)
        print(f"[VideoService] Created segment {i + 1}/{len(pages)}")

    if not segment_paths:
        raise Exception("有効な動画セグメントが1つも生成できませんでした")

    # concat用リストファイルを作成
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for seg in segment_paths:
            safe_path = seg.replace("\\", "/").replace("'", "'\\''")
            f.write(f"file '{safe_path}'\n")

    # 全セグメントを結合
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        output_path,
    ]

    returncode, stderr_text = await loop.run_in_executor(_executor, _run_ffmpeg, concat_cmd)

    if returncode != 0:
        raise Exception(f"動画結合に失敗しました: {stderr_text[-500:]}")

    print(f"[VideoService] Final video created: {output_path}")
    return output_path
