const express = require("express");
const router = express.Router();
const {
  getSupervisors,
  getTechnicians,
  getCustomers
  
} = require("../controllers/userController");
const conn = require("../config/db");
router.get("/supervisors", getSupervisors);
router.get("/technicians", getTechnicians);
router.get("/customers", getCustomers);
router.get("/:id",async (req, res) => {
  try {
    const result = await conn.query(
      `SELECT id, username, role
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;