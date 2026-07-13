const PDFDocument = require("pdfkit");
const conn = require("../config/db");

const generateJobCardPdf = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await conn.query(
      "SELECT * FROM jobcards WHERE id = $1",
      [id]
    );
    const job = result.rows[0];
    if (!job) return res.status(404).json({ error: "Job card not found" });

    const histResult = await conn.query(
      "SELECT * FROM jobcard_history WHERE jobcard_id = $1",
      [id]
    );
    const history = histResult.rows[0] || {};
    const visits = Array.isArray(history.visits) ? history.visits : [];

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=JobCard-${job.job_number || job.id}.pdf`
    );
doc.on("error", (err) => {
  console.error("PDF stream error:", err.message);
  if (!res.destroyed) res.destroy();
});

res.on("error", (err) => {
  console.error("Response stream error:", err.message);
});
    doc.pipe(res);

    
    doc.fontSize(18).font("Helvetica-Bold")
       .text("COPY CAT LIMITED", { align: "center" });
    doc.fontSize(11).font("Helvetica")
       .text("Job Card Management System", { align: "center" });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

   
    doc.fontSize(13).font("Helvetica-Bold")
       .text(`Job Card: ${job.job_number || `#${job.id}`}`);
    doc.fontSize(10).font("Helvetica").fillColor("#666")
       .text(`Status: ${job.status?.toUpperCase() || "PENDING"}`)
       .text(`Date: ${job.scheduleddate ? new Date(job.scheduleddate).toISOString().split("T")[0] : "—"}`)
    doc.fillColor("#000").moveDown(0.8);

   
    doc.fontSize(11).font("Helvetica-Bold").text("CUSTOMER INFORMATION");
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica")
       .text(`Full Name:   ${job.customer_name || "—"}`)
       .text(`Phone:       ${job.phone_number  || "—"}`)
       .text(`Email:       ${job.email         || "—"}`)
       .text(`Location:    ${job.location      || "—"}`);
    doc.moveDown(0.8);

    doc.fontSize(11).font("Helvetica-Bold").text("JOB DETAILS");
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica")
       .text(`Title:       ${job.title      || "—"}`)
       .text(`Assigned To: ${job.assignedto || "—"}`)
       .text("Description:");
    doc.text(job.description || "—", { indent: 20 });
    doc.moveDown(0.8);

    doc.fontSize(11).font("Helvetica-Bold").text("SITE VISITS LOG");
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);

    if (visits.length > 0) {
      visits.forEach((v, i) => {
        doc.fontSize(9).font("Helvetica")
           .text(
             `${i + 1}. Date: ${v.date || "—"}  |  Start: ${v.start_time || "—"}  |  End: ${v.end_time || "—"}  |  Work: ${v.work_done || "—"}`
           );
        doc.moveDown(0.3);
      });
    } else {
      doc.fontSize(10).font("Helvetica").text("No visits logged.");
    }
    doc.moveDown(0.8);
    doc.fontSize(11).font("Helvetica-Bold").text("OVERALL WORK SUMMARY");
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica")
       .text(history.work_done || "—", { indent: 10 });
    doc.moveDown(0.8);

    doc.fontSize(11).font("Helvetica-Bold").text("CUSTOMER COMMENTS");
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica")
       .text(history.customer_comments || "—", { indent: 10 });
    doc.moveDown(2);

    doc.fontSize(10).font("Helvetica")
       .text("Customer Signature: _______________________        Date: _______________");
    doc.moveDown(1.5);
    doc.text("Supervisor Signature: _____________________        Date: _______________");

    doc.end();

  } catch (err) {
    console.error("PDF generation error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
};
module.exports = { generateJobCardPdf };