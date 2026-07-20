const { Pool } = require("pg");
require("dotenv").config();

const conn = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
conn.query("SELECT NOW()")
  .then(res => {
    console.log("✅ PostgreSQL Connected");
    console.log("Database Time:", res.rows[0].now);
  })
  .catch(err => {
    console.error("❌ Database Connection Failed");
    console.error(err.message);
  });
module.exports = conn;



