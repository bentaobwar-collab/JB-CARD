const axios = require("axios");
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const { data } = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return data.access_token;
};

const stkPush = async (req, res) => {
  const { phone: rawPhone, amount, jobNumber } = req.body;
  const phone = rawPhone.startsWith("0")
    ? "254" + rawPhone.slice(1)
    : rawPhone;

  const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passKey   = process.env.MPESA_PASS_KEY;

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

  const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

  console.log("STK Push payload:", { phone, amount, shortCode, timestamp });

  try {
    const token = await getAccessToken();

    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   "CustomerPayBillOnline",
        Amount:            amount,
        PartyA:            phone,
        PartyB:            shortCode,
        PhoneNumber:       phone,
        CallBackURL:       process.env.MPESA_CALLBACK_URL,
        AccountReference:  jobNumber || "CopyCatLimited",
        TransactionDesc:   "Job Card Payment - Copy Cat Limited",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log("Safaricom response:", JSON.stringify(data, null, 2));
 return res.json(data);
   } catch (err) {
  console.error("STK Push error:", JSON.stringify(err.response?.data, null, 2) || err.message);
  res.status(500).json({ error: err.response?.data?.errorMessage || "STK Push failed" });
}
};

const mpesaCallback = async (req, res) => {
  const callbackData = req.body.Body?.stkCallback;

  if (!callbackData) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  if (callbackData.ResultCode === 0) {
    const meta      = callbackData.CallbackMetadata.Item;
    const amount    = meta.find(i => i.Name === "Amount")?.Value;
    const mpesaCode = meta.find(i => i.Name === "MpesaReceiptNumber")?.Value;
    const phone     = meta.find(i => i.Name === "PhoneNumber")?.Value;

    console.log("✅ Payment received:", { amount, mpesaCode, phone });
  } else {
    console.log("❌ Payment failed:", callbackData.ResultDesc);
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
};

module.exports = { stkPush, mpesaCallback };