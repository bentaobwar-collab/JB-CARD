const bcrypt = require("bcrypt");
const conn = require("../config/db.js"); 
const addTechnician = async (req, res) => {
  try {
    const { username, email, phone_number, address, password } = req.body;
    const supervisorId = req.user.id;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await conn.query(
      `INSERT INTO users (username, email, phone_number, address, password, role, supervisor_id)
       VALUES ($1, $2, $3, $4, $5, 'technician', $6)
       RETURNING id, username, email, phone_number`,
      [username, email, phone_number, address, hashedPassword, supervisorId]
    );

    res.status(201).json({ message: "Technician added successfully", technician: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ message: "Email already in use" });
    res.status(500).json({ message: "Failed to add technician" });
  }
};

const getMyTechnicians = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const result = await conn.query(
      `SELECT id, username, email, phone_number, created_at FROM users
       WHERE role = 'technician' AND supervisor_id = $1
       ORDER BY created_at DESC`,
      [supervisorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch technicians" });
  }
};

const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const supervisorId = req.user.id;

    const result = await conn.query(
      `DELETE FROM users WHERE id = $1 AND supervisor_id = $2 AND role = 'technician'`,
      [id, supervisorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Technician not found or not yours to delete" });
    }
    res.json({ message: "Technician deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete technician" });
  }
};

const addCustomer = async (req, res) => {
  try {
    const { username, email, phone_number, address, password } = req.body;
    const supervisorId = req.user.id;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await conn.query(
      `INSERT INTO users (username, email, phone_number, address, password, role, supervisor_id)
       VALUES ($1, $2, $3, $4, $5, 'customer', $6)
       RETURNING id, username, email, phone_number`,
      [username, email, phone_number, address, hashedPassword, supervisorId]
    );

    res.status(201).json({ message: "Customer added successfully", customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ message: "Email already in use" });
    res.status(500).json({ message: "Failed to add customer" });
  }
};

const getMyCustomers = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const result = await conn.query(
      `SELECT id, username, email, phone_number, created_at FROM users
       WHERE role = 'customer' AND supervisor_id = $1
       ORDER BY created_at DESC`,
      [supervisorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const supervisorId = req.user.id;

    const result = await conn.query(
      `DELETE FROM users WHERE id = $1 AND supervisor_id = $2 AND role = 'customer'`,
      [id, supervisorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found or not yours to delete" });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
};

module.exports = {
  addTechnician, getMyTechnicians, deleteTechnician,
  addCustomer, getMyCustomers, deleteCustomer,
};