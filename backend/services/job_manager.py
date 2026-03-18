"""
ジョブ管理・進捗追跡モジュール

各ジョブの状態と進捗をメモリ上で管理し、
SSEで配信するためのキューを提供する。
"""
import asyncio
import time
import uuid
import shutil
import os
from typing import Dict, Any, Optional
from config import TEMP_DIR, JOB_EXPIRY_MINUTES


class Job:
    """1つのジョブ（動画生成タスク）を表す"""

    def __init__(self, job_id: str):
        self.job_id = job_id
        self.status = "processing"
        self.progress = 0
        self.step = "queued"
        self.message = "ジョブを開始しています..."
        self.download_url: Optional[str] = None
        self.error: Optional[str] = None
        self.created_at = time.time()
        self.queue: asyncio.Queue = asyncio.Queue()

        # ジョブ専用の一時ディレクトリ
        self.work_dir = os.path.join(TEMP_DIR, job_id)
        os.makedirs(self.work_dir, exist_ok=True)

    async def update(self, step: str, progress: int, message: str):
        """進捗を更新し、SSEキューにイベントを送信する"""
        self.step = step
        self.progress = progress
        self.message = message
        await self.queue.put({
            "step": step,
            "progress": progress,
            "message": message,
        })

    async def complete(self, download_url: str):
        """ジョブを完了状態にする"""
        self.status = "completed"
        self.progress = 100
        self.step = "done"
        self.download_url = download_url
        await self.queue.put({
            "step": "done",
            "progress": 100,
            "download_url": download_url,
        })

    async def fail(self, error_message: str):
        """ジョブをエラー状態にする"""
        self.status = "failed"
        self.step = "error"
        self.error = error_message
        await self.queue.put({
            "step": "error",
            "progress": -1,
            "message": error_message,
        })

    def is_expired(self) -> bool:
        """有効期限切れかどうか"""
        elapsed = time.time() - self.created_at
        return elapsed > JOB_EXPIRY_MINUTES * 60

    def cleanup(self):
        """一時ファイルを削除する"""
        if os.path.exists(self.work_dir):
            shutil.rmtree(self.work_dir, ignore_errors=True)


class JobManager:
    """全ジョブを管理するシングルトン"""

    def __init__(self):
        self._jobs: Dict[str, Job] = {}

    def create_job(self) -> Job:
        """新しいジョブを作成して返す"""
        job_id = uuid.uuid4().hex[:12]
        job = Job(job_id)
        self._jobs[job_id] = job
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        """ジョブIDからジョブを取得する"""
        return self._jobs.get(job_id)

    def cleanup_expired(self):
        """期限切れジョブを削除する"""
        expired_ids = [
            jid for jid, job in self._jobs.items()
            if job.is_expired()
        ]
        for jid in expired_ids:
            job = self._jobs.pop(jid, None)
            if job:
                job.cleanup()
                print(f"[JobManager] Cleaned up expired job: {jid}")


# シングルトンインスタンス
job_manager = JobManager()
