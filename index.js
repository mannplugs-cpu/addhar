
import express from "express";
import fetch from "node-fetch";
import faker from "faker";
import cors from "cors";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

function genPass() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function createSessionHeaders() {
  return {
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/x-www-form-urlencoded",
    "origin": "https://darkosint.in",
    "referer": "https://darkosint.in/",
    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) Chrome/137.0.0.0 Mobile Safari/537.36"
  };
}

async function signupUser() {
  const name = faker.name.firstName();
  const email = faker.name.firstName().toLowerCase() + Math.floor(Math.random() * 9000 + 1000) + "@gmail.com";
  const password = genPass();

  const body = new URLSearchParams({
    action: "signup",
    name,
    email,
    password
  });

  await fetch("https://darkosint.in/api/auth.php", {
    method: "POST",
    headers: createSessionHeaders(),
    body
  });
}

function extractClean(raw) {
  const parsed = raw;

  try {
    const results = parsed.data.result.result;

    if (!results || results.length === 0) {
      return { error: "No records found", Developer: "Basic Coders | @SajagOG" };
    }

    const row = results[0];

    return {
      name: row.name,
      father_name: row.father_name,
      address: row.address ? row.address.replace("!", ", ") : "",
      mobile: row.mobile,
      aadhaar: row.id_number,
      email: row.email,
      Developer: "Basic Coders | @SajagOG"
    };
  } catch {
    return { error: "No records found", Developer: "Basic Coders | @SajagOG" };
  }
}

async function performLookup(type, query) {
  const body = new URLSearchParams({ type, query });

  const resp = await fetch("https://darkosint.in/api/lookup.php", {
    method: "POST",
    headers: createSessionHeaders(),
    body
  });

  const data = await resp.json();
  return extractClean(data);
}

app.get("/num", async (req, res) => {
  const number = req.query.number;

  if (!number) {
    return res.json({ error: "missing ?number", Developer: "Basic Coders | @SajagOG" });
  }

  await signupUser();
  return res.json(await performLookup("mobile", number));
});

app.get("/aadhar", async (req, res) => {
  const aadhar = req.query.aadhar;

  if (!aadhar) {
    return res.json({ error: "missing ?aadhar", Developer: "Basic Coders | @SajagOG" });
  }

  await signupUser();
  return res.json(await performLookup("aadhaar", aadhar));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
