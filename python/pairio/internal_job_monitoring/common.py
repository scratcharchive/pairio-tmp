from typing import Union, Literal
import os
from ..common._api_request import _post_api_request


# // getSignedUploadUrl
# export type GetSignedUploadUrlRequest = {
#   type: 'getSignedUploadUrlRequest'
#   jobId: string
#   uploadType: 'output' | 'consoleOutput' | 'resourceUtilizationLog' | 'other'
#   outputName?: string
#   otherName?: string
#   size: number
# }
#
# export type GetSignedUploadUrlResponse = {
#   type: 'getSignedUploadUrlResponse'
#   signedUrl: string
# }

def _get_upload_url(*,
    job_id: str,
    job_private_key: str,
    upload_type: Literal['output', 'consoleOutput', 'resourceUtilizationLog', 'other'],
    output_name: Union[str, None],
    other_name: Union[str, None],
    size: int
) -> str:
    """Get a signed upload URL for the output (console or resource log) of a job"""
    url_path = '/api/getSignedUploadUrl'
    req = {
        'type': 'getSignedUploadUrlRequest',
        'jobId': job_id,
        'uploadType': upload_type,
        'outputName': output_name,
        'size': size
    }
    if output_name is not None:
        req['outputName'] = output_name
    if other_name is not None:
        req['otherName'] = other_name
    headers = {
        'Authorization': f'Bearer {job_private_key}'
    }
    res = _post_api_request(
        url_path=url_path,
        data=req,
        headers=headers
    )
    return res['signedUrl']

def _process_is_alive(pid: str) -> bool:
    """
    Check if a process is alive.
    """
    try:
        os.kill(int(pid), 0)
        return True
    except OSError:
        return False
