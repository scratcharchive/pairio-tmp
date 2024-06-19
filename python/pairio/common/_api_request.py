import os
import requests

pairio_url = os.getenv('PAIRIO_URL', 'https://pairio.vercel.app')

def _get_api_request(*,
    url_path: str,
    headers: dict
):
    assert url_path.startswith('/api')
    url = f'{pairio_url}{url_path}'
    try:
        resp = requests.get(url, headers=headers, timeout=60)
        resp.raise_for_status()
    except Exception as e:
        print(f'Error in compute resource get api request for {url}; {e}')
        raise
    return resp.json()

def _post_api_request(*,
    url_path: str,
    data: dict,
    headers: dict
):
    assert url_path.startswith('/api')
    url = f'{pairio_url}{url_path}'
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=60)
        resp.raise_for_status()
    except Exception as e:
        print(f'Error in client post api request for {url}; {e}')
        raise
    return resp.json()
