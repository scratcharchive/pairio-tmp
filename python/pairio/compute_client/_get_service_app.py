from ..common._api_request import _post_api_request
from .PairioServiceApp import PairioServiceApp


def _get_service_app(*,
    service_name: str,
    app_name: str
):
    req = {
        'type': 'getServiceAppRequest',
        'serviceName': service_name,
        'appName': app_name
    }
    resp = _post_api_request(
        url_path='/api/getServiceApp',
        data=req,
        headers={}
    )
    if resp['type'] != 'getServiceAppResponse':
        raise Exception('Unexpected response for getServiceAppRequest')
    app = resp['app']
    app = PairioServiceApp(**app)
    return app


# export type GetServiceAppRequest = {
#   type: 'getServiceAppRequest'
#   serviceName: string
#   appName: string
# }

# export type GetServiceAppResponse = {
#   type: 'getServiceAppResponse'
#   app: PairioServiceApp
# }
