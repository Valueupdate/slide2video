# RunPod Serverless GPU - Qwen3-TTS Worker
FROM nvidia/cuda:13.0.2-cudnn-devel-ubuntu22.04


ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    python3.12 python3.12-venv python3.12-dev git wget ffmpeg curl \
    && curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 \
    && ln -sf /usr/bin/python3.12 /usr/bin/python3 \
    && ln -sf /usr/bin/python3.12 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3.12 /usr/bin/python && \
    ln -sf /usr/bin/python3.12 /usr/bin/python3

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN MAX_JOBS=1 pip install --no-cache-dir flash-attn --no-build-isolation

# モデルを事前ダウンロード（コールドスタート短縮）
RUN python -c "\
from huggingface_hub import snapshot_download; \
snapshot_download('Qwen/Qwen3-TTS-Tokenizer-12Hz', local_dir='/models/Qwen3-TTS-Tokenizer-12Hz'); \
snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-Base', local_dir='/models/Qwen3-TTS-12Hz-1.7B-Base'); \
snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice', local_dir='/models/Qwen3-TTS-12Hz-1.7B-CustomVoice'); \
"

COPY handler.py .
COPY voices/ ./voices/

CMD ["python", "handler.py"]
