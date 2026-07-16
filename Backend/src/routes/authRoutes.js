const express = require("express");
const router = express.Router();

const { login, updateProfile,changePassword,forgotPassword,resetPassword,validateResetToken, } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware"); 

router.post("/login", login);
router.put("/update-profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/reset-password/:token", validateResetToken);


module.exports = router;
