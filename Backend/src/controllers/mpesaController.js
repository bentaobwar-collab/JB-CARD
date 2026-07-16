const axios = require("axios");
const paymentStore = {};
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
  console.log("STK Push request body:", req.body);
  const { phone: rawPhone, amount, jobNumber, jobId } = req.body;

  const cleaned = rawPhone.replace(/\s+/g, "");
  const phone   = cleaned.startsWith("0") ? "254" + cleaned.slice(1) : cleaned;

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

    if (data.ResponseCode === "0") {
      paymentStore[data.CheckoutRequestID] = {
        status:      "pending",
        amount,
        phone,
        mpesa_code:  null,
        result_desc: null,
      };
    }

    return res.json(data);
  } catch (err) {
    console.error("STK Push error:", err.response?.data || err.message);
    return res.status(500).json({
      error: err.response?.data?.errorMessage || "STK Push failed"
    });
  }
};

const mpesaCallback = async (req, res) => {
  const callbackData = req.body.Body?.stkCallback;
  if (!callbackData) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

  if (ResultCode === 0) {
    const meta      = CallbackMetadata.Item;
    const amount    = meta.find(i => i.Name === "Amount")?.Value;
    const mpesaCode = meta.find(i => i.Name === "MpesaReceiptNumber")?.Value;
    const phone     = meta.find(i => i.Name === "PhoneNumber")?.Value;

    console.log("Payment received:", { amount, mpesaCode, phone });

    paymentStore[CheckoutRequestID] = {
      status:      "success",
      amount,
      phone,
      mpesa_code:  mpesaCode,
      result_desc: ResultDesc,
    };
  } else {
    console.log("Payment failed:", ResultDesc);

    paymentStore[CheckoutRequestID] = {
      status:      "failed",
      mpesa_code:  null,
      result_desc: ResultDesc,
    };
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
};

const checkPaymentStatus = async (req, res) => {
  const { checkoutRequestId } = req.params;
  const record = paymentStore[checkoutRequestId];

  if (!record) return res.json({ status: "pending" });

  res.json(record);
};

module.exports = { stkPush, mpesaCallback, checkPaymentStatus };