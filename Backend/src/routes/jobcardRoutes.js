const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); 
const { generateJobCardPdf } = require("../controllers/pdfController");
const {
  createJobcard,
  getJobcards,
  getJobCardHistory,
  getJobCardById,
  updateJobcard,
  updateJobCard,
  updateJobCardStatus,
  deleteJobCard,
  getJobcardsByTechnician,
  getJobcardsByCustomer,
  technicianUpdateJobCard,
  sendJobcardEmail,
  sendAssignmentEmail
} = require("../controllers/jobcardController");

router.post("/",createJobcard);
router.get("/",getJobcards);
router.get("/my-jobs", authMiddleware,getJobcardsByTechnician);
router.get ("/my-customer-jobs", authMiddleware, getJobcardsByCustomer);
router.get ("/:id/history",getJobCardHistory);
router.patch ("/:id/status",updateJobCardStatus);
router.patch ("/:id/technician-update", authMiddleware,technicianUpdateJobCard);
router.post("/:id/send-email",authMiddleware,sendJobcardEmail);
router.post("/:id/send-assignment-email", authMiddleware, sendAssignmentEmail);
router.get ("/:id",getJobCardById);
router.patch("/:id",updateJobCard);
router.put("/:id",updateJobcard);
router.delete("/:id",deleteJobCard);
router.get("/:id/pdf", generateJobCardPdf);
module.exports = router;
