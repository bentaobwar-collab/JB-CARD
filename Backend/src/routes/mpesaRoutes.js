const express = require("express");
const router  = express.Router();
const { stkPush, mpesaCallback,checkPaymentStatus  } = require("../controllers/mpesaController");

router.post("/stk",stkPush);
router.post("/callback", mpesaCallback);
router.get("/status/:checkoutRequestId", checkPaymentStatus); 

module.exports = router;