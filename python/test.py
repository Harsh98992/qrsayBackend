import requests

url = 'http://localhost:8080/api'

body = {
    "phoneNumber": "7428449707",
    "countryCode": "91"

}

response = requests.post(url + '/v1/customer/sendPhoneVerificationCode', json=body)
print(response.status_code)
print(response.text)
print(response.json())
print(response.headers)
