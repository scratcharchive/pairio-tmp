import os
import time
from .common import _process_is_alive
from ..common._api_request import _post_api_request


def job_status_monitor(parent_pid: str):
    """
    Monitor job status to see if the job was canceled.
    """
    job_id = os.environ.get('JOB_ID', None)
    if job_id is None:
        raise KeyError('JOB_ID is not set')
    job_private_key = os.environ.get('JOB_PRIVATE_KEY', None)
    if job_private_key is None:
        raise KeyError('JOB_PRIVATE_KEY is not set')
    cancel_out_file = os.environ.get('CANCEL_OUT_FILE', None)
    if cancel_out_file is None:
        raise KeyError('CANCEL_OUT_FILE is not set')

    last_check_timestamp = 0
    overall_timer = time.time()

    while True:
        if not _process_is_alive(parent_pid):
            print(f'Parent process {parent_pid} is no longer alive. Exiting.')
            break

        elapsed_since_check = time.time() - last_check_timestamp
        overall_elapsed = time.time() - overall_timer
        if overall_elapsed < 60:
            interval = 10
        elif overall_elapsed < 60 * 5:
            interval = 30
        elif overall_elapsed < 60 * 20:
            interval = 60
        else:
            interval = 120
        if elapsed_since_check >= interval:
            last_check_timestamp = time.time()
            try:
                status = _get_job_status(job_id=job_id, job_private_key=job_private_key)
                if status != 'running':
                    print(f'Job status is {status}. Canceling.')
                    with open(cancel_out_file, 'w') as f:
                        if isinstance(status, str):
                            f.write(status)
                        else:
                            f.write('0')
                    break
                else:
                    print('Job status is running')
            except: # noqa
                # maybe there was a network error
                print('Error getting job status')

        time.sleep(1)

# // getJob
# export type GetJobRequest = {
#   type: 'getJobRequest'
#   jobId: string
#   includePrivateKey: boolean
#   computeClientId?: string
# }
#
# export type GetJobResponse = {
#   type: 'getJobResponse'
#   job: PairioJob
# }

def _get_job_status(*, job_id: str, job_private_key: str) -> str:
    """Get a job status from the dendro API"""
    url_path = '/api/getJob'
    headers = {
        'Authorization': f'Bearer {job_private_key}'
    }
    req = {
        'type': 'getJobRequest',
        'jobId': job_id,
        'includePrivateKey': False
    }
    res = _post_api_request(
        url_path=url_path,
        data=req,
        headers=headers
    )
    return res['status']
