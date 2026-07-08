const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const pool = require("../config/db");
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
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
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
      `UPDATE users 
       SET username = $1, email = $2, phone_number = $3, address = $4 
       WHERE id = $5`,
      [fullName, email, phone, address, userId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: "Server error" });
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
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await conn.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ message: "Password changed successfully" });


  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { login,updateProfile,changePassword };