const PDFDocument = require("pdfkit");
const conn = require("../config/db");
const path = require("path");
const fs = require("fs");
const LOGO_PATH = path.join( __dirname, "../assets/CopyCatGroup_Logo.png");
const GREY   = "#64748B";
const BORDER = "#E2E8F0";
const fmtDate = (val) =>
  val ? new Date(val).toISOString().split("T")[0] : "—";

const fmtName = (name) =>
  name ? name.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "—";

const statusColor = (s = "") => {
  const m = { pending: "#BA7517", in_progress: GREEN, completed: GREEN, cancelled: "#A32D2D" };
  return m[s] || GREY;
};

const statusLabel = (s = "") => {
  const m = { pending: "Pending", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" };
  return m[s] || s.toUpperCase();
};
const rule = (doc, y,color = BORDER) => {
  doc.moveTo(50, y).lineTo(545, y).strokeColor(color).lineWidth(0.5).stroke().strokeColor("#000").lineWidth(1);
};
const sectionHead = (doc, label, x=50) => {
  doc.moveDown(0.6);
    doc.fontSize(10)
     .font("Helvetica-Bold")
     .fillColor("#000")
     .text(label,x);
  doc.moveTo(50, doc.y + 3)
     .lineTo(545, doc.y + 3)
     .strokeColor("#CFCFCF")
     .stroke();
  doc.moveDown(0.4);
};
const row2 = (doc, label, value, x = 50, y = null) => {
  const ry = y !== null ? y : doc.y;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(GREY)
     .text(label, x, ry, { width: 100 });
  doc.fontSize(8.5).font("Helvetica").fillColor("#000")
     .text(value || "—", x + 105, ry, { width: 140 });
};

const generateJobCardPdf = async (req, res) => {
  const { id } = req.params;

  try {
    const [jobRes, histRes] = await Promise.all([
      conn.query("SELECT * FROM jobcards          WHERE id          = $1", [id]),
      conn.query("SELECT * FROM jobcard_history   WHERE jobcard_id  = $1 ORDER BY created_at DESC LIMIT 1", [id]),
    ]);

    const job     = jobRes.rows[0];
    if (!job) return res.status(404).json({ error: "Job card not found" });

    const history = histRes.rows[0] || {};
    const visits  = Array.isArray(history.visits) ? history.visits : [];

    const doc = new PDFDocument({ margin: 0, size: "A4", bufferPages: true });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=JobCard-${job.job_number || job.id}.pdf`
    );

    doc.on("error", (err) => {
      console.error("PDF stream error:", err.message);
      if (!res.destroyed) res.destroy();
    });
    res.on("error", (err) => console.error("Response stream error:", err.message));

    doc.pipe(res);
try {
  doc.image(LOGO_PATH, 50, 25, { width: 90 });
} catch (err) {
  console.log("Logo not found:", err.message);
}

doc.fontSize(15)
   .font("Helvetica-Bold")
   .fillColor("#000")
   .text("COPY CAT GROUP", 160, 30);
doc.fontSize(8)
  .text("Encee Place, Muguga Green Lane Westlands, Nairobi, Kenya", 160, 48)
   .text("email:helpdesk@copycatgroup.com", 160, 60)
   .text("Direct Line: 0709 873 000", 160, 72)
   .text("General Office: +254 20 397 0000", 160, 84)
   .text("Website: www.copycatgroup.com", 160, 96);

doc.fontSize(15)
   .font("Helvetica-Bold")
   .text(`Job Number: ${job.job_number || job.id}`, 450, 48);
   

rule(doc, 120);
doc.y = 135;
    doc.moveDown(0.5);
    sectionHead(doc, "Customer Information");
    doc.moveDown(0.3);

    const ciY = doc.y;
   
    row2(doc, "Full Name:",   fmtName(job.customer_name), 50, ciY);
    row2(doc, "Phone:", history.phone_number || "—",50, ciY + 14);
    row2(doc, "Email:",  history.email || "—",  50, ciY + 28);
    row2(doc, "Location:",  job.location || "—", 298, ciY);
    row2(doc, "Scheduled:",   fmtDate(job.scheduleddate),  298, ciY + 14);

    doc.y = ciY + 46;
    doc.moveDown(0.5);

    sectionHead(doc, "Job Details");
    doc.moveDown(0.3);

    const jdY = doc.y;
    row2(doc, "Job Title:",   job.title       || "—", 50,  jdY);
    row2(doc, "Assigned To:", fmtName(job.assignedto), 50, jdY + 14);
    row2(doc, "Supervisor:",  fmtName(history.supervisor_name), 298, jdY);

    doc.y = jdY + 30;
    doc.moveDown(0.4);

    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(GREY).text("Description:", 50);
    doc.fontSize(8.5).font("Helvetica").fillColor("#000")
       .text(job.description || "—", 50, doc.y, { width: 495, indent: 10 });
    doc.moveDown(0.6);

    sectionHead(doc, "Site visits log");
    doc.moveDown(0.3);

    if (visits.length > 0) {
      
      const thY = doc.y;
      doc.rect(50, thY, 495, 16).fill("#E2E8F0").fillColor("black");
      doc.text("No",         54,  thY + 4, { width: 20 });
      doc.text("Date",       78,  thY + 4, { width: 75 });
      doc.text("Start",      158, thY + 4, { width: 60 });
      doc.text("End",        222, thY + 4, { width: 60 });
      doc.text("Duration",   286, thY + 4, { width: 65 });
      doc.text("Work Done",  355, thY + 4, { width: 185 });
      doc.y = thY + 20;

      visits.forEach((v, i) => {
        const rowY = doc.y;
        if (i % 2 === 0) doc.rect(50, rowY, 495, 14).fill("#F8FAFC");

        let dur = "—";
        if (v.start_time && v.end_time && v.date) {
          const diff = Math.round(
            (new Date(`${v.date}T${v.end_time}`) - new Date(`${v.date}T${v.start_time}`)) / 60000
          );
          if (diff > 0) {
            const h = Math.floor(diff / 60), m = diff % 60;
            dur = `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();
          }
        }

        doc.fontSize(8).font("Helvetica").fillColor("#000");
        doc.text(String(i + 1),      54,  rowY + 3, { width: 20 });
        doc.text(v.date        || "—", 78,  rowY + 3, { width: 75 });
        doc.text(v.start_time  || "—", 158, rowY + 3, { width: 60 });
        doc.text(v.end_time    || "—", 222, rowY + 3, { width: 60 });
        doc.text(dur,                  286, rowY + 3, { width: 65 });
        doc.text(v.work_done   || "—", 355, rowY + 3, { width: 185 });
        doc.y = rowY + 16;
      });


    } else {
      doc.fontSize(9).font("Helvetica").fillColor(GREY)
         .text("No visits logged yet.", 50, doc.y, { indent: 10 });
    }
    doc.moveDown(0.6);

    sectionHead(doc, "Overall work Summary");
    doc.moveDown(0.3);
    doc.fontSize(8.5).font("Helvetica").fillColor("#000")
       .text(history.work_done || "—", 50, doc.y, { width: 495, indent: 10 });
    doc.moveDown(0.6);

    sectionHead(doc, "Customer Comments");
    doc.moveDown(0.3);
    doc.fontSize(8.5).font("Helvetica").fillColor("#000")
       .text(history.customer_comments || "—", 50, doc.y, { width: 495, indent: 10 });
    doc.moveDown(1);

    sectionHead(doc, "Approvals");
    doc.moveDown(0.6);

    const sigY = doc.y;
    doc.rect(50, sigY, 220, 50).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica-Bold").fillColor(GREY)
       .text("Customer Signature", 54, sigY + 4);
    doc.fontSize(8).font("Helvetica").fillColor(GREY)
       .text("Date: _______________", 54, sigY + 38);

    doc.rect(325, sigY, 220, 50).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica-Bold").fillColor(GREY)
       .text("Supervisor Signature", 329, sigY + 4);
    doc.fontSize(8).font("Helvetica").fillColor(GREY)
       .text("Date: _______________", 329, sigY + 38);

    doc.y = sigY + 60;
    doc.moveDown(0.5);

    const footerY = doc.page.height - 35;
    rule(doc, footerY - 5);
    doc.fontSize(7).font("Helvetica").fillColor(GREY)
       .text(
         `Generated on ${new Date().toLocaleDateString("en-KE", { dateStyle: "long" })}  |  Copy Cat Limited  |`,
         50, footerY,
         { width: 495, align: "center" }
       );

    doc.end();

  } catch (err) {
    console.error("PDF generation error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
};
const generateJobCardPdfFile = async (jobId) => {
  const [jobRes, histRes] = await Promise.all([
    conn.query(
      "SELECT * FROM jobcards WHERE id = $1",
      [jobId]
    ),
    conn.query(
      `SELECT * FROM jobcard_history
       WHERE jobcard_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [jobId]
    ),
  ]);

  const job = jobRes.rows[0];

  if (!job) {
    throw new Error("Job card not found");
  }
const history = histRes.rows[0] || {};
const visits = Array.isArray(history.visits)
  ? history.visits
  : [];
  const pdfDir = path.join(__dirname, "../uploads/jobcards" );
   if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  const pdfPath = path.join(
    pdfDir,
    `JobCard-${job.job_number}.pdf`
  );

  const doc = new PDFDocument({
    margin: 0,
    size: "A4",
    bufferPages: true,
  });
const writeStream = fs.createWriteStream(pdfPath);

doc.pipe(writeStream);

try {
  doc.image(LOGO_PATH, 50, 25, { width: 90 });
} catch (err) {
  console.log("Logo not found:", err.message);
}

doc.fontSize(15)
   .font("Helvetica-Bold")
   .fillColor("#000")
   .text("COPY CAT GROUP", 160, 30);
doc.fontSize(8)
  .text("Encee Place, Muguga Green Lane Westlands, Nairobi, Kenya", 160, 48)
   .text("email:helpdesk@copycatgroup.com", 160, 60)
   .text("Direct Line: 0709 873 000", 160, 72)
   .text("General Office: +254 20 397 0000", 160, 84)
   .text("Website: www.copycatgroup.com", 160, 96);

doc.fontSize(15)
   .font("Helvetica-Bold")
   .text(`Job Number: ${job.job_number || job.id}`, 450, 48);
   

rule(doc, 120);
doc.y = 135;
    doc.moveDown(0.5);
    sectionHead(doc, "Customer Information");
    doc.moveDown(0.3);

    const ciY = doc.y;
   
    row2(doc, "Full Name:",   fmtName(job.customer_name), 50, ciY);
    row2(doc, "Phone:", history.phone_number || "—",50, ciY + 14);
    row2(doc, "Email:",  history.email || "—",  50, ciY + 28);
    row2(doc, "Location:",  job.location || "—", 298, ciY);
    row2(doc, "Scheduled:",   fmtDate(job.scheduleddate),  298, ciY + 14);

    doc.y = ciY + 46;
    doc.moveDown(0.5);

    sectionHead(doc, "Job Details");
    doc.moveDown(0.3);

    const jdY = doc.y;
    row2(doc, "Job Title:",   job.title       || "—", 50,  jdY);
    row2(doc, "Assigned To:", fmtName(job.assignedto), 50, jdY + 14);
    row2(doc, "Supervisor:",  fmtName(history.supervisor_name), 298, jdY);

    doc.y = jdY + 30;
    doc.moveDown(0.4);

    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(GREY).text("Description:", 50);
    doc.fontSize(8.5).font("Helvetica").fillColor("#000")
       .text(job.description || "—", 50, doc.y, { width: 495, indent: 10 });
    doc.moveDown(0.6);

    sectionHead(doc, "Site visits log");
    doc.moveDown(0.3);

    if (visits.length > 0) {
      
      const thY = doc.y;
      doc.rect(50, thY, 495, 16).fill("#E2E8F0").fillColor("black");
      doc.text("No",         54,  thY + 4, { width: 20 });
      doc.text("Date",       78,  thY + 4, { width: 75 });
      doc.text("Start",      158, thY + 4, { width: 60 });
      doc.text("End",        222, thY + 4, { width: 60 });
      doc.text("Duration",   286, thY + 4, { width: 65 });
      doc.text("Work Done",  355, thY + 4, { width: 185 });
      doc.y = thY + 20;

      visits.forEach((v, i) => {
        const rowY = doc.y;
        if (i % 2 === 0) doc.rect(50, rowY, 495, 14).fill("#F8FAFC");

        let dur = "—";
        if (v.start_time && v.end_time && v.date) {
          const diff = Math.round(
            (new Date(`${v.date}T${v.end_time}`) - new Date(`${v.date}T${v.start_time}`)) / 60000
          );
          if (diff > 0) {
            const h = Math.floor(diff / 60), m = diff % 60;
            dur = `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();
          }
        }

        doc.fontSize(8).font("Helvetica").fillColor("#000");
        doc.text(String(i + 1),      54,  rowY + 3, { width: 20 });
        doc.text(v.date        || "—", 78,  rowY + 3, { width: 75 });
        doc.text(v.start_time  || "—", 158, rowY + 3, { width: 60 });
        doc.text(v.end_time    || "—", 222, rowY + 3, { width: 60 });
        doc.text(dur,                  286, rowY + 3, { width: 65 });
        doc.text(v.work_done   || "—", 355, rowY + 3, { width: 185 });
        doc.y = rowY + 16;
      });


    } else {
      doc.fontSize(9).font("Helvetica").fillColor(GREY)
         .text("No visits logged yet.", 50, doc.y, { indent: 10 });
    }
    doc.moveDown(0.6);

    sectionHead(doc, "Overall work Summary");
    doc.moveDown(0.3);
    doc.fontSize(8.5).font("Helvetica").fillColor("#000")
       .text(history.work_done || "—", 50, doc.y, { width: 495, indent: 10 });
    doc.moveDown(0.6);

    sectionHead(doc, "Customer Comments");
    doc.moveDown(0.3);
    doc.fontSize(8.5).font("Helvetica").fillColor("#000")
       .text(history.customer_comments || "—", 50, doc.y, { width: 495, indent: 10 });
    doc.moveDown(1);

    sectionHead(doc, "Approvals");
    doc.moveDown(0.6);

    const sigY = doc.y;
    doc.rect(50, sigY, 220, 50).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica-Bold").fillColor(GREY)
       .text("Customer Signature", 54, sigY + 4);
    doc.fontSize(8).font("Helvetica").fillColor(GREY)
       .text("Date: _______________", 54, sigY + 38);

    doc.rect(325, sigY, 220, 50).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica-Bold").fillColor(GREY)
       .text("Supervisor Signature", 329, sigY + 4);
    doc.fontSize(8).font("Helvetica").fillColor(GREY)
       .text("Date: _______________", 329, sigY + 38);

    doc.y = sigY + 60;
    doc.moveDown(0.5);

    const footerY = doc.page.height - 35;
    rule(doc, footerY - 5);
    doc.fontSize(7).font("Helvetica").fillColor(GREY)
       .text(
         `Generated on ${new Date().toLocaleDateString("en-KE", { dateStyle: "long" })}  |  Copy Cat Limited  |`,
         50, footerY,
         { width: 495, align: "center" }
       );


doc.end();

await new Promise((resolve, reject) => {
  writeStream.on("finish", resolve);
  writeStream.on("error", reject);
});

return pdfPath;
};

module.exports = {
  generateJobCardPdf,
  generateJobCardPdfFile,
};
