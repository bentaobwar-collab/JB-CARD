const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const conn = require("../config/db");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await conn.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
const updateProfile = async (req, res) => {
  const { fullName, email, phone, address } = req.body;
  const userId = req.user.id;

  try {
    await conn.query(
      `
      UPDATE users
      SET username = $1,
          email = $2,
          phone_number = $3,
          address = $4
      WHERE id = $5
      `,
      [fullName, email, phone, address, userId]
    );

    res.json({
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({
      error: "Server Error",
    });
  }
};
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const result = await conn.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await conn.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({
      error: "Server Error",
    });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await conn.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No account found with that email",
      });
    }

    const user = result.rows[0];

    const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
       .digest("hex");
      
const expiry = new Date(
  Date.now() + 5 * 60 * 1000
);
    await conn.query(
      `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires = $2
      WHERE id = $3
      `,
      [resetToken, expiry, user.id]
    );

    const resetLink =
      `http://localhost:5174/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Job card system" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${user.username || "User"},</h2>
        <p>Your request has been received to reset your password.</p>
         <p> Click the button below to create a new password:</p>
           <p>
            <a
              href="${resetLink}"
              style="
                background:#2563eb;
                color:white;
                padding:12px 20px;
                text-decoration:none;
                border-radius:6px;
                align-content:center;
              "
            >
              Reset Password
            </a>
          </p>
          <p>This link will expire in 5 minutes.</p>
          <p>If you did not request this reset,please ignore this email.  </p>
          <hr />
          <p>Job Card</p>
        </div>
      `,
    });

    res.json({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const result = await conn.query(
      `
      SELECT *
      FROM users
      WHERE reset_token = $1
      AND reset_token_expires > NOW()
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const user = result.rows[0];

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await conn.query(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = $2
      `,
      [hashedPassword, user.id]
    );

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};

