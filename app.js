const express = require('express');
const bodyParser = require('body-parser'); // Assuming you're using body-parser
const request = require('request-promise'); // Import request-promise

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable

app.use(bodyParser.json()); // Parse incoming JSON requests

// Replace these values with your actual token and secret keys
const TOKEN = "962416910cd8f4";
const SECRET_KEYS = ["0]ZI%m:4W0FS>M>", "baf<xm%`K;yk=Gs", "uoih%[ST]9XT?]4"];

function isValidIP(ip) {
  const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
  return ipRegex.test(ip.trim());
}

app.post("/getifnative", async (req, res) => {
  // Ensure request is sent with JSON data
  if (!req.is('json')) {
    return res.status(400).json({ error: "Missing secret key in request body" });
  }

  // Try to get the JSON data
  let data;
  try {
    data = req.body;
  } catch (err) {
    console.error("Error parsing request body:", err);
    return res.status(400).json({ error: "Missing secret key in request body" });
  }

  // Check if 'secret_key' key exists in the JSON
  if (!data.hasOwnProperty('secret_key')) {
    return res.status(401).json({ error: "Missing secret key in request body" });
  }

  // Get the secret key from the request body
  const secretKey = data.secret_key;

  // Validate the secret key against the list
  if (!SECRET_KEYS.includes(secretKey)) {
    return res.status(401).json({ error: "Invalid secret key" });
  }

  // Assuming the proxy server sets a header named 'X-Forwarded-For'
  let userIp = req.headers['x-forwarded-for'];
  
  // Extract the first valid IP address
  if (userIp) {
    const ipList = userIp.split(',');
    userIp = ipList.find(ip => isValidIP(ip)); // Use isValidIP function to check validity
  } else {
    userIp = req.socket.remoteAddress;
  }

  // Construct the IP info URL
  const url = `https://ipinfo.io/${userIp}/json?token=${TOKEN}`;

  try {
    const response = await request.get(url, { json: true }); // Use JSON response
    return res.json({ country_code: response.country });
  } catch (error) {
    console.error("Error fetching IP info:", error);
    return res.status(500).json({ error: "Lỗi khi truy cập API ipinfo.io" });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
