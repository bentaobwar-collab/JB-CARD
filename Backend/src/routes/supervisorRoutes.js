const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const { requireRole } = require("../middleware/roleMiddleware.js");
const {
  addTechnician, getMyTechnicians, deleteTechnician,
  addCustomer, getMyCustomers, deleteCustomer,
} = require("../controllers/supervisorController.js");

const router = express.Router();

router.post("/technicians", authMiddleware, requireRole("supervisor"), addTechnician);
router.get("/technicians", authMiddleware, requireRole("supervisor"), getMyTechnicians);
router.delete("/technicians/:id", authMiddleware, requireRole("supervisor"), deleteTechnician);

router.post("/customers", authMiddleware, requireRole("supervisor"), addCustomer);
router.get("/customers", authMiddleware, requireRole("supervisor"), getMyCustomers);
router.delete("/customers/:id", authMiddleware, requireRole("supervisor"), deleteCustomer);

module.exports = router;