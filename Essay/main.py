import requests

URL = "http://172.10.9.95/lab05/prob2/ajax_update.php"
payload = {"id": "admin", "hash": "e3ffcafc75c68be76c374c0a33a78c0c", "passwd": "random", "robot": 1}

resp = requests.get(URL, params=payload)  # Use 'params' for GET request
print(resp.text)