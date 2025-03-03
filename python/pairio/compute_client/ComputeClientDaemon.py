from typing import Optional
import os
import time
import shutil
import multiprocessing
from pathlib import Path
from .JobManager import JobManager
from ..common.api_requests import get_jobs, get_pubsub_subscription


class ComputeClientDaemon:
    def __init__(
        self, *,
        dir: str,
        compute_client_id: str,
        compute_client_private_key: str
    ) -> None:
        self._dir = dir
        self._compute_client_id = compute_client_id
        self._compute_client_private_key = compute_client_private_key

        self._job_manager = JobManager(
            compute_client_id=compute_client_id,
            compute_client_private_key=compute_client_private_key
        )

    def start(self, cleanup_old_jobs=True, timeout: Optional[float] = None):
        timer_handle_jobs = 0

        print('Getting pubsub info')
        pubsub_subscription = get_pubsub_subscription(
            compute_client_id=self._compute_client_id,
            compute_client_private_key=self._compute_client_private_key
        )
        pubnub_subscribe_key = pubsub_subscription['pubnubSubscribeKey']
        from .PubsubClient import PubsubClient
        pubsub_client = PubsubClient(
            pubnub_subscribe_key=pubnub_subscribe_key,
            pubnub_channel=pubsub_subscription['pubnubChannel'],
            pubnub_user=pubsub_subscription['pubnubUser'],
            compute_client_id=self._compute_client_id
        )

        # Create file cache directory if needed
        file_cache_dir = os.path.join(os.getcwd(), 'file_cache')
        if not os.path.exists(file_cache_dir):
            os.makedirs(file_cache_dir)

        # Start cleaning up old job directories
        # It's important to do this in a separate process
        # because it can take a long time to delete all the files in the tmp directories (remfile is the culprit)
        # and we don't want to block the main process from handling jobs
        if cleanup_old_jobs:
            cleanup_old_jobs_process = multiprocessing.Process(target=_cleanup_old_job_working_directories, args=(os.getcwd() + '/jobs',))
            cleanup_old_jobs_process.start()
        else:
            cleanup_old_jobs_process = None

        try:
            print('Starting compute client')
            reported_that_compute_client_is_running = False
            overall_timer = time.time()
            while True:
                elapsed_handle_jobs = time.time() - timer_handle_jobs
                # normally we will get pubsub messages for updates, but if we don't, we should check every 10 minutes
                time_to_handle_jobs = elapsed_handle_jobs > 60 * 10
                messages = pubsub_client.take_messages() if pubsub_client is not None else []
                jobs_have_changed = False
                for msg in messages:
                    if msg['type'] == 'newPendingJob':
                        jobs_have_changed = True
                    if msg['type'] == 'jobStatusChanged':
                        jobs_have_changed = True

                if time_to_handle_jobs or jobs_have_changed:
                    # if time_to_handle_jobs:
                    #     print('Checking for new jobs') # this pollutes the logs too much
                    timer_handle_jobs = time.time()
                    self._handle_jobs()

                self._job_manager.do_work()

                if not reported_that_compute_client_is_running:
                    print(f'Compute client is running: {self._compute_client_id}')
                    reported_that_compute_client_is_running = True

                overall_elapsed = time.time() - overall_timer
                if timeout is not None and overall_elapsed > timeout:
                    print(f'Compute client timed out after {timeout} seconds')
                    return
                if overall_elapsed < 5:
                    time.sleep(0.01) # for the first few seconds we can sleep for a short time (useful for testing)
                else:
                    time.sleep(2)
        finally:
            if cleanup_old_jobs_process is not None:
                cleanup_old_jobs_process.terminate()
            if pubsub_client is not None:
                pubsub_client.close() # unfortunately this doesn't actually stop the thread - it's a pubnub/python issue

    def _handle_jobs(self):
        jobs = get_jobs(
            compute_client_id=self._compute_client_id,
            compute_client_private_key=self._compute_client_private_key
        )
        if len(jobs) > 0:
            self._job_manager.handle_jobs(jobs)


def _cleanup_old_job_working_directories(dir: str):
    """Delete working dirs that are more than 24 hours old"""
    jobs_dir = Path(dir)
    while True:
        if not jobs_dir.exists():
            continue
        for job_dir in jobs_dir.iterdir():
            if job_dir.is_dir():
                elapsed = time.time() - job_dir.stat().st_mtime
                if elapsed > 24 * 60 * 60:
                    print(f'Removing old working dir {job_dir}')
                    shutil.rmtree(job_dir)
        time.sleep(60)
