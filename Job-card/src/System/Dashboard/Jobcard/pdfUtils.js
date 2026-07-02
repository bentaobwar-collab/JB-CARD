 import { jsPDF } from "jspdf";

const NAVY  = [30, 58, 95];
const SLATE = [248, 250, 252];
const MUTED = [100, 116, 139];
const TEXT  = [30, 41, 59];
const BORDER= [226, 232, 240];

function fmt(name) {
  if (!name) return "—";
  return String(name).split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function val(v) { return v || "—"; }
export function downloadJobCardPdf(job) {
  console.log("jsPDF loaded:", typeof jsPDF);
  console.log("job passed in:", job);
  if (!job) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W   = doc.internal.pageSize.getWidth();
  const pad = 40;
  let y     = 0;

  const checkPage = (needed = 60) => {
    if (y + needed > 800) { doc.addPage(); y = 40; }
  };

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 64, "F");

  doc.setFontSize(16).setFont("helvetica", "bold").setTextColor(255, 255, 255);
  doc.text("Copy Cat Limited", pad, 26);
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(180, 210, 230);
  doc.text("Job Card Management System", pad, 40);

  doc.setFontSize(13).setFont("helvetica", "bold").setTextColor(255, 255, 255);
  doc.text(`Job No: ${val(job.job_number || "#" + job.id)}`, W - pad, 26, { align: "right" });
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(180, 210, 230);
  doc.text(`Created: ${(job.scheduleddate || "").split("T")[0] || "—"}`, W - pad, 40, { align: "right" });

  
  const STATUS_COLORS = {
    pending:     { bg: [250, 238, 218], text: [99, 56, 6],   label: "Pending"     },
    in_progress: { bg: [225, 245, 238], text: [8,  80, 65],  label: "In Progress" },
    completed:   { bg: [225, 245, 238], text: [8,  80, 65],  label: "Completed"   },
    cancelled:   { bg: [252, 235, 235], text: [121,31, 31],  label: "Cancelled"   },
  };
  const sc = STATUS_COLORS[job.status] || STATUS_COLORS.pending;
  doc.setFillColor(...sc.bg);
  doc.roundedRect(W - pad - 74, 46, 74, 14, 3, 3, "F");
  doc.setFontSize(8).setFont("helvetica", "bold").setTextColor(...sc.text);
  doc.text(sc.label, W - pad - 37, 56, { align: "center" });

  y = 80;

  
  const section = (title) => {
    checkPage(30);
    doc.setFillColor(...SLATE);
    doc.rect(pad, y, W - pad * 2, 18, "F");
    doc.setFontSize(8).setFont("helvetica", "bold").setTextColor(...NAVY);
    doc.text(title.toUpperCase(), pad + 6, y + 12);
    y += 22;
  };

  const fieldLabel = (text, x, fy) => {
    doc.setFontSize(7.5).setFont("helvetica", "normal").setTextColor(...MUTED);
    doc.text(text.toUpperCase(), x, fy);
  };
  const fieldValue = (text, x, fy, maxW = 150) => {
    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(...TEXT);
    const lines = doc.splitTextToSize(String(text || "—"), maxW);
    doc.text(lines, x, fy + 11);
    return lines.length;
  };

  const row2 = (l1, v1, l2, v2) => {
    checkPage(30);
    const mid = pad + (W - pad * 2) / 2 + 8;
    fieldLabel(l1, pad, y);
    const n1 = fieldValue(v1, pad, y, mid - pad - 12);
    fieldLabel(l2, mid, y);
    const n2 = fieldValue(v2, mid, y, W - pad - mid);
    y += Math.max(n1, n2) * 13 + 18;
  };

  const row3 = (l1, v1, l2, v2, l3, v3) => {
    checkPage(30);
    const colW = (W - pad * 2) / 3;
    const x2   = pad + colW + 6;
    const x3   = pad + colW * 2 + 12;
    fieldLabel(l1, pad, y); fieldValue(v1, pad, y, colW - 10);
    fieldLabel(l2, x2,  y); fieldValue(v2, x2,  y, colW - 10);
    fieldLabel(l3, x3,  y); fieldValue(v3, x3,  y, colW - 10);
    y += 30;
  };

  const row1 = (label, text) => {
    checkPage(30);
    fieldLabel(label, pad, y);
    const lines = doc.splitTextToSize(String(text || "—"), W - pad * 2);
    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(...TEXT);
    doc.text(lines, pad, y + 11);
    y += lines.length * 13 + 18;
  };

  const divider = () => {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.5);
    doc.line(pad, y, W - pad, y);
    y += 10;
  };

  section("Customer Information");
  row3("Full name",      fmt(job.customer_name),
       "Phone number",   val(job.phone_number),
       "Email address",  val(job.email));
  row1("Location / address", val(job.location));
  divider();

  section("Job Details");
  row2("Job title", val(job.title), "Status", sc.label);
  row1("Description", val(job.description));
  divider();

  section("Assignment");
  row2("Technician", fmt(job.technician_name || job.assignedto),
       "Supervisor",  fmt(job.supervisor_name));
  divider();

  section("Work Details — Filled by Technician");

  const visits = Array.isArray(job.visits) ? job.visits : [];

  if (visits.length > 0) {
    checkPage(40);
    fieldLabel("Site Visits Log", pad, y); y += 14;

    const cols = { no: pad, date: pad+24, start: pad+110, end: pad+175, dur: pad+240, work: pad+305 };
    doc.setFillColor(241, 245, 249);
    doc.rect(pad, y, W - pad * 2, 16, "F");
    doc.setFontSize(7.5).setFont("helvetica", "bold").setTextColor(...MUTED);
    doc.text("NO",       cols.no,    y + 11);
    doc.text("DATE",     cols.date,  y + 11);
    doc.text("START",    cols.start, y + 11);
    doc.text("END",      cols.end,   y + 11);
    doc.text("DURATION", cols.dur,   y + 11);
    doc.text("WORK DONE",cols.work,  y + 11);
    y += 16;

    visits.forEach((v, i) => {
      checkPage(20);
      const dur = (() => {
        if (!v.date || !v.start_time || !v.end_time) return "—";
        const diff = Math.round(
          (new Date(`${v.date}T${v.end_time}`) - new Date(`${v.date}T${v.start_time}`)) / 60000
        );
        if (diff <= 0) return "—";
        const h = Math.floor(diff / 60), m = diff % 60;
        return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();
      })();

      doc.setFillColor(...(i % 2 === 0 ? [255,255,255] : [248,250,252]));
      doc.rect(pad, y, W - pad * 2, 16, "F");
      doc.setDrawColor(...BORDER);
      doc.line(pad, y + 16, W - pad, y + 16);

      doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(...TEXT);
      doc.text(String(i + 1),          cols.no,    y + 11);
      doc.text(val(v.date),            cols.date,  y + 11);
      doc.text(val(v.start_time),      cols.start, y + 11);
      doc.text(val(v.end_time),        cols.end,   y + 11);

      if (dur !== "—") {
        doc.setFillColor(220, 252, 231);
        doc.roundedRect(cols.dur - 2, y + 4, 48, 10, 3, 3, "F");
        doc.setFontSize(8).setTextColor(39, 80, 10);
        doc.text(dur, cols.dur + 22, y + 11, { align: "center" });
      } else {
        doc.setFontSize(9).setTextColor(...MUTED);
        doc.text("—", cols.dur, y + 11);
      }

      doc.setFontSize(9).setTextColor(...TEXT);
      const workLines = doc.splitTextToSize(val(v.work_done), W - cols.work - pad);
      doc.text(workLines[0], cols.work, y + 11);
      y += 16;
    });
    y += 8;
  }

  if (job.work_done) {
    row1("Overall work summary", job.work_done);
  }
  if (job.customer_comments) {
    row1("Customer comments", job.customer_comments);
  }
  divider();

  checkPage(100);
  section("Signatures");
  const sigW  = (W - pad * 2 - 20) / 2;
  const sigX2 = pad + sigW + 20;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.rect(pad,   y, sigW, 52);
  doc.rect(sigX2, y, sigW, 52);

  doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(...MUTED);
  doc.text("Customer signature",   pad   + sigW / 2, y + 30, { align: "center" });
  doc.text("Supervisor signature", sigX2 + sigW / 2, y + 30, { align: "center" });
  y += 60;

  doc.setFontSize(8).setTextColor(...TEXT);
  doc.text("Signature: _______________________", pad,   y);
  doc.text("Date: ________________",             pad + sigW - 110, y);
  doc.text("Signature: _______________________", sigX2, y);
  doc.text("Date: ________________",             sigX2 + sigW - 110, y);

  
  doc.save(`jobcard-${job.job_number || job.id}.pdf`);
}