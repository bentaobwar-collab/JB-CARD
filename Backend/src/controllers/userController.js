const conn = require("../config/db");

const getTechnicians = async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT id, username FROM users WHERE role = 'technician'"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT id, username FROM users WHERE role = 'customer'"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
 const getSupervisors = async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT id, username FROM users WHERE role = 'supervisor'"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTechnicians,
  getCustomers,
  getSupervisors
};