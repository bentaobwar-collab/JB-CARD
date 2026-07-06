const nodemailer = require("nodemailer");
require("dotenv").config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("APP_PASSWORD:", process.env.APP_PASSWORD ? "Loaded" : "Missing");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

const formatCustomerName = (name = "") => {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const mailOptions = (job) => ({
  from: process.env.EMAIL_USER,
  to: job.email,
  subject: "Job Card",
  html: `
   <h2>Dear <strong>${formatCustomerName(job.customer_name)}</strong>,</h2>

     <p>Your service Jobsheet has been completed.</p>
     <p><strong>Job Number:</strong> ${job.job_number}</p>
    <p><strong>Job Title:</strong> ${job.title}</p>

   
    <p>Thank you for choosing us.</p>
  `,
});

const sendMail = async (job) => {
  const options = mailOptions(job);

  const info = await transporter.sendMail(options);

  console.log("Email sent:", info.messageId);

  return info;
};

module.exports = { sendMail };

