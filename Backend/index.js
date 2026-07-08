const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const jobcardRoutes = require("./src/routes/jobcardRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Copycat Jobcard API is running" });
});

app.use("/api/jobcards", jobcardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mpesa", require("./src/routes/mpesaRoutes"));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const server = process.env.SSL_KEY && process.env.SSL_CERT
  ? https.createServer({ key: fs.readFileSync(process.env.SSL_KEY), cert: fs.readFileSync(process.env.SSL_CERT) }, app)
  : require("http").createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`${process.env.SSL_KEY && process.env.SSL_CERT ? "HTTPS" : "HTTP"} Server running on port ${process.env.PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${process.env.PORT} is already in use.`);
    process.exit(1);
  }
  console.error("Server error:", err);
});