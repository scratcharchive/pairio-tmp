
from typing import Union
from ..common._api_request import _post_api_request


# export type SetJobStatusRequest = {
#   type: 'setJobStatusRequest'
#   jobId: string
#   computeClientId: string
#   status: PairioJobStatus
#   error?: string
# }

def _set_job_status(
    *,
    job_id: str,
    job_private_key: str,
    compute_client_id: str,
    status: str,
    error: Union[str, None]
):
    req = {
        'type': 'setJobStatusRequest',
        'jobId': job_id,
        'computeClientId': compute_client_id,
        'status': status
    }
    if error is not None:
        req['error'] = error
    headers = {
        'Authorization': f'Bearer: {job_private_key}'
    }
    resp = _post_api_request(
        url_path='/api/setJobStatus',
        data=req,
        headers=headers
    )
    if resp['type'] != 'setJobStatusResponse':
        raise Exception('Unexpected response for setJobStatusRequest')
