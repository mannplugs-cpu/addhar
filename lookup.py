from faker import Faker
import requests
import random
import string
import json

fake = Faker()

def gen_pass():
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for _ in range(12))

def create_session():
    session = requests.Session()
    session.headers.update({
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://darkosint.in",
        "referer": "https://darkosint.in/",
        "user-agent": "Mozilla/5.0"
    })
    return session

def signup_user(session):
    name = fake.first_name()
    email = fake.first_name().lower() + str(random.randint(1000,9999)) + "@gmail.com"
    password = gen_pass()
    payload = {"action": "signup", "name": name, "email": email, "password": password}
    session.post("https://darkosint.in/api/auth.php", data=payload)

def extract_clean(resp):
    try:
        parsed = resp.json()
        results = parsed["data"]["result"]["result"]
    except:
        return {"error": "No records found"}

    if not results:
        return {"error": "No records found"}

    row = results[0]

    return {
        "name": row.get("name"),
        "father_name": row.get("father_name"),
        "address": row.get("address", "").replace("!", ", "),
        "mobile": row.get("mobile"),
        "aadhaar": row.get("id_number"),
        "email": row.get("email"),
    }

def perform_lookup(session, lookup_type, query):
    payload = {"type": lookup_type, "query": query}
    resp = session.post("https://darkosint.in/api/lookup.php", data=payload)
    return extract_clean(resp)

def handler(request):
    query = request.get("query", {})

    if "number" in query:
        session = create_session()
        signup_user(session)
        return perform_lookup(session, "mobile", query["number"])

    if "aadhar" in query:
        session = create_session()
        signup_user(session)
        return perform_lookup(session, "aadhaar", query["aadhar"])

    return {"error": "Invalid request"}
