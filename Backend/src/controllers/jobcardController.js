const conn = require("../config/db");
const { sendMail } = require("../services/emailService");
 
const createJobcard = async (req, res) => {
  try {
    const {
      job_number,
      customer_id,
      technician_id,
      supervisor_id,
      supervisor_name,
      title,
      customer_name,
      assignedto,
      description,
      location,
      scheduleddate,
    } = req.body;
    const result = await conn.query(
      `INSERT INTO jobcards
      (job_number, customer_id, technician_id,title,customer_name, assignedto,description,supervisor_id,supervisor_name, location, scheduleddate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10, $11)
      RETURNING *`,
      [
        job_number,
        customer_id,
        technician_id,
        title,
        customer_name,
        assignedto,
        description,
        supervisor_id,
        supervisor_name,
        location,
        scheduleddate,
      ]
    );
 
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create job card"
    });
  }
};
 
 
const getJobcards = async (req, res) => {
  try {
    const result = await conn.query(`
      SELECT
        jc.*,
        COALESCE(jh.status, jc.status, 'Pending') AS status
      FROM jobcards jc
      LEFT JOIN jobcard_history jh
        ON jh.id = (
          SELECT id
          FROM jobcard_history
          WHERE jobcard_id = jc.id
          ORDER BY created_at DESC
          LIMIT 1
        )
      ORDER BY jc.created_at DESC
    `);
 
    res.status(200).json(result.rows);
 
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch job cards"
    });
  }
};
const updateJobcard = async (req, res) => {
  try {
    const { id } = req.params;
 
    const {
      job_number,
      customer_id,
      technician_id,
      title,
      customer_name,
      assignedto,
      description,
      location,
      scheduleddate,
      supervisor_id,
      supervisor_name,
      status
    } = req.body;
 
    const result = await conn.query(
      `UPDATE jobcards
       SET job_number      = COALESCE($1, job_number),
           customer_id     = COALESCE($2, customer_id),
           technician_id   = COALESCE($3, technician_id),
           title           = COALESCE($4, title),
           customer_name   = COALESCE($5, customer_name),
           assignedto      = COALESCE($6, assignedto),
           description     = COALESCE($7, description),
           location        = COALESCE($8, location),
           scheduleddate   = COALESCE($9, scheduleddate),
           supervisor_id   = COALESCE($10, supervisor_id),
           supervisor_name = COALESCE($11, supervisor_name),
           status          = COALESCE($12, status)
       WHERE id = $13
       RETURNING *`,
      [
        job_number,
        customer_id,
        technician_id,
        title,
        customer_name,
        assignedto,
        description,
        location,
        scheduleddate,
        supervisor_id,
        supervisor_name,
        status,
        id
      ]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job card not found"
      });
    }
 
    res.status(200).json(result.rows[0]);
 
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update job card"
    });
  }
};
 
const getJobCardById = async (req, res) => {
  try {
 
    const result = await conn.query(
      `SELECT
         jc.id,
         jc.job_number,
         jc.scheduleddate,
         jc.customer_id,
         jc.customer_name,
         jc.location,
         jc.title,
         jc.description,
         jc.technician_id,
         jc.assignedto,
         jc.supervisor_id,
         jc.supervisor_name,
         jc.status,
         TO_CHAR(jc.scheduleddate, 'DD Mon YYYY') AS scheduleddate_formatted,
         jh.id               AS history_id,
         jh.work_done,
         jh.visits,
         jh.customer_comments,
         jh.start_time,
         jh.end_time,
         jh.duration,
         jh.payment_phone,
         jh.technician_name,
         jh.phone_number,
         jh.email,
         jh.amount
       FROM jobcards jc
       LEFT JOIN jobcard_history jh
         ON jh.jobcard_id = jc.id
         AND jh.id = (
           SELECT id FROM jobcard_history
           WHERE jobcard_id = jc.id
           ORDER BY created_at DESC
           LIMIT 1
         )
       WHERE jc.id = $1`,
      [req.params.id]
    );
 
 
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Job card not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("getJobCardById:", err);
    res.status(500).json({ message: err.message });
  }
};
 
const getJobCardHistory = async (req, res) => {
  try {
    const result = await conn.query(
      `SELECT
         h.*,
         TO_CHAR(h.start_time, 'DD Mon YYYY HH24:MI') AS start_formatted,
         TO_CHAR(h.end_time,   'DD Mon YYYY HH24:MI') AS end_formatted,
         TO_CHAR(h.created_at, 'DD Mon YYYY HH24:MI') AS created_formatted,
         EXTRACT(EPOCH FROM h.duration) / 60            AS duration_minutes
       FROM jobcard_history h
       WHERE h.jobcard_id = $1
       ORDER BY h.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getJobCardHistory:", err);
    res.status(500).json({ message: err.message });
  }
};
const updateJobCard = async (req, res) => {
  const {
    title,
    description,
    location,
    customer_name,
    supervisor_name,
    assignedto,
    email,
    phone_number,
  } = req.body;
 
  const technician_id = req.body.technician_id ? parseInt(req.body.technician_id) : null;
  const supervisor_id = req.body.supervisor_id ? parseInt(req.body.supervisor_id) : null;
 
  try {
    const result = await conn.query(
      `UPDATE jobcards
       SET title           = COALESCE($1, title),
           description     = COALESCE($2, description),
           location        = COALESCE($3, location),
           customer_name   = COALESCE($4, customer_name),
           technician_id   = COALESCE($5, technician_id),
           supervisor_id   = COALESCE($6, supervisor_id),
           supervisor_name = COALESCE($7, supervisor_name),
           assignedto      = COALESCE($8, assignedto)
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description,
        location,
        customer_name,
        technician_id,
        supervisor_id,
        supervisor_name,
        assignedto,
        req.params.id
      ]
    );
 
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Job card not found" });
    }
 
    const jc = result.rows[0];
    if (email !== undefined || phone_number !== undefined) {
      const existing = await conn.query(
        `SELECT id FROM jobcard_history
         WHERE jobcard_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [req.params.id]
      );
 
      if (existing.rows.length > 0) {
        await conn.query(
          `UPDATE jobcard_history
           SET email        = COALESCE($1, email),
               phone_number = COALESCE($2, phone_number)
           WHERE id = $3`,
          [email, phone_number, existing.rows[0].id]
        );
      } else {
        await conn.query(
          `INSERT INTO jobcard_history (
             jobcard_id,
             technician_id,  technician_name,
             customer_id,    customer_name,
             supervisor_id,  supervisor_name,
             status,         description,
             email,          phone_number
           ) VALUES (
             $1,  $2,  $3,
             $4,  $5,
             $6,  $7,
             $8,  $9,
             $10, $11
           )`,
          [
            req.params.id,
            jc.technician_id, jc.assignedto,
            jc.customer_id, jc.customer_name,
            jc.supervisor_id, jc.supervisor_name,
            jc.status || "in_progress",
            jc.description,
            email, phone_number
          ]
        );
      }
    }
    const merged = await conn.query(
      `SELECT jc.*, jh.email, jh.phone_number
       FROM jobcards jc
       LEFT JOIN jobcard_history jh
         ON jh.jobcard_id = jc.id
         AND jh.id = (
           SELECT id FROM jobcard_history
           WHERE jobcard_id = jc.id
           ORDER BY created_at DESC
           LIMIT 1
         )
       WHERE jc.id = $1`,
      [req.params.id]
    );
 
    res.json(merged.rows[0]);
  } catch (err) {
    console.error("updateJobCard:", err.message);
    res.status(500).json({ message: err.message });
  }
};
 
const updateJobCardStatus = async (req, res) => {
  const { status } = req.body || {};
  const jobId = req.params.id;
 
  try {
    const result = await conn.query(
      `UPDATE jobcard_history
       SET status = $1
       WHERE id = (
         SELECT id FROM jobcard_history
         WHERE jobcard_id = $2
         ORDER BY created_at DESC
         LIMIT 1
       )
       RETURNING *`,
      [status, jobId]
    );
 
    if (result.rowCount === 0) {
      const jc = await conn.query(
        "SELECT * FROM jobcards WHERE id = $1", [jobId]
      );
 
      if (!jc.rows[0]) {
        return res.status(404).json({ message: "Job card not found" });
      }
      const j = jc.rows[0];
      await conn.query(
        `INSERT INTO jobcard_history
           (jobcard_id, technician_id, customer_id, supervisor_id,
            technician_name, customer_name, supervisor_name, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          jobId,
          j.technician_id, j.customer_id, j.supervisor_id,
          j.assignedto, j.customer_name, j.supervisor_name,
          status
        ]
      );
    }
    await conn.query(
      `UPDATE jobcards
       SET status = $1
       WHERE id = $2`,
      [status, jobId]
    );
 
 
    const merged = await conn.query(
      `SELECT jc.*, jh.status, jh.work_done, jh.visits,
              jh.customer_comments, jh.start_time, jh.end_time,
              jh.payment_phone, jh.amount
       FROM jobcards jc
       LEFT JOIN jobcard_history jh
         ON jh.jobcard_id = jc.id
         AND jh.id = (
           SELECT id FROM jobcard_history
           WHERE jobcard_id = jc.id
           ORDER BY created_at DESC LIMIT 1
         )
       WHERE jc.id = $1`,
      [jobId]
    );
    res.json(merged.rows[0]);
  } catch (err) {
    console.error("updateJobCardStatus:", err);
    res.status(500).json({ message: err.message });
  }
};
 const sendJobcardEmail = async (req, res) => {
  if (!req.user || req.user.role !== "technician") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const jobId = req.params.id;

  try {
    const jobResult = await conn.query(
      `
      SELECT
        h.email,
        h.customer_name,
        j.job_number,
        j.title
      FROM jobcard_history h
      INNER JOIN jobcards j
        ON h.jobcard_id = j.id
      WHERE h.jobcard_id = $1
      ORDER BY h.id DESC
      LIMIT 1
      `,
      [jobId]
    );

    const job = jobResult.rows[0];

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.email) {
      return res.status(400).json({ message: "Customer email is missing" });
    }
const info = await sendMail(job);
    
console.log("Email sent:", info);

    res.json({
      success: true,
      message: `Email sent successfully to ${job.email}`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to send email",
    });
  }
};
const technicianUpdateJobCard = async (req, res) => {
  const jobId = req.params.id;
  const {
    visits, work_done, customer_comments,
    status, payment_phone, amount
  } = req.body;
 
  try {
    const jcResult = await conn.query(
      "SELECT * FROM jobcards WHERE id = $1", [jobId]
    );
    const jc = jcResult.rows[0];
    if (!jc) return res.status(404).json({ message: "Job not found" });
    const latestVisit = (visits || [])
      .filter(v => v.date && v.start_time && v.end_time)
      .slice(-1)[0];
 
    const startTs = latestVisit
      ? `${latestVisit.date}T${latestVisit.start_time}` : null;
    const endTs = latestVisit
      ? `${latestVisit.date}T${latestVisit.end_time}` : null;
 
    const existing = await conn.query(
      `SELECT id FROM jobcard_history
       WHERE jobcard_id = $1
         AND status != 'completed'
       ORDER BY created_at DESC
       LIMIT 1`,
      [jobId]
    );
 
    let historyId;
 
    if (existing.rows.length > 0) {
      const updated = await conn.query(
        `UPDATE jobcard_history
         SET visits            = COALESCE($1,  visits),
             work_done         = COALESCE($2,  work_done),
             customer_comments = COALESCE($3,  customer_comments),
             status            = COALESCE($4,  status),
             start_time        = COALESCE($5,  start_time),
             end_time          = COALESCE($6,  end_time),
             duration          = CASE
               WHEN $5 IS NOT NULL AND $6 IS NOT NULL
               THEN $6::timestamp - $5::timestamp
               ELSE duration END,
             payment_phone     = COALESCE($7,  payment_phone),
             amount            = COALESCE($8,  amount)
         WHERE id = $9
         RETURNING id`,
        [
          visits ? JSON.stringify(visits) : null,
          work_done, customer_comments, status,
          startTs, endTs,
          payment_phone, amount,
          existing.rows[0].id
        ]
      );
      historyId = updated.rows[0].id;
    } else {
      const inserted = await conn.query(
        `INSERT INTO jobcard_history (
           jobcard_id,
           technician_id,  technician_name,
           customer_id,    customer_name,
           supervisor_id,  supervisor_name,
           status,         description,
           work_done,      visits,
           start_time,     end_time,
           duration,
           customer_comments,
           payment_phone,  amount
         ) VALUES (
           $1,  $2,  $3,
           $4,  $5,
           $6,  $7,
           $8,  $9,
           $10, $11,
           $12, $13,
           CASE WHEN $12 IS NOT NULL AND $13 IS NOT NULL
                THEN $13::timestamp - $12::timestamp
                ELSE NULL END,
           $14, $15, $16
         ) RETURNING id`,
        [
          jobId,
          jc.technician_id, jc.assignedto,
          jc.customer_id, jc.customer_name,
          jc.supervisor_id, jc.supervisor_name,

          status || "in_progress",
          jc.description,
          work_done,
          visits ? JSON.stringify(visits) : null,
          startTs, endTs,
          customer_comments,
          payment_phone, amount
        ]
      );
      historyId = inserted.rows[0].id;
    }
    if (status) {
      await conn.query(
        `UPDATE jobcards
         SET status = $1
         WHERE id = $2`,
        [status, jobId]
      );
    }
 
    const merged = await conn.query(
      `SELECT jc.*,
              jh.status, jh.work_done, jh.visits,
              jh.customer_comments, jh.start_time, jh.end_time,
              jh.payment_phone, jh.amount,
              jh.id AS history_id
       FROM jobcards jc
       LEFT JOIN jobcard_history jh ON jh.id = $2
       WHERE jc.id = $1`,
      [jobId, historyId]
    );
    res.json(merged.rows[0]);
  } catch (err) {
    console.error("technicianUpdateJobCard ERROR:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Request body:", req.body);
    console.error("Job ID:", req.params.id);
    res.status(500).json({ message: err.message, details: err.detail || "See server logs" });
  }
};
 
const deleteJobCard = async (req, res) => {
  try {
    await conn.query("DELETE FROM jobcards WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteJobCard:", err);
    res.status(500).json({ message: err.message });
  }
};
const getJobcardsByTechnician = async (req, res) => {
  console.log("req.user:", req.user);        
  console.log("technicianId:", req.user?.id)
  try {
     const technicianId = parseInt(req.user.id); 

    if (!technicianId) {
      return res.status(400).json({ message: "Invalid technician ID" });
    }
    const result = await conn.query(`
      SELECT
        jc.*,
        COALESCE(jh.status, jc.status, 'Pending') AS status
      FROM jobcards jc
      LEFT JOIN jobcard_history jh
        ON jh.id = (
          SELECT id FROM jobcard_history
          WHERE jobcard_id = jc.id
          ORDER BY created_at DESC
          LIMIT 1
        )
      WHERE jc.technician_id = $1
      ORDER BY jc.created_at DESC
    `, [technicianId]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getJobcardsByTechnician:", err);
    res.status(500).json({ message: "Failed to fetch technician job cards" });
  }
};

const getJobcardsByCustomer = async (req, res) => {
  try {
    const customerId = parseInt(req.user?.id);

    if (!customerId) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const result = await conn.query(`
      SELECT
        jc.*,
        COALESCE(jh.status, jc.status, 'Pending') AS status
      FROM jobcards jc
      LEFT JOIN jobcard_history jh
        ON jh.id = (
          SELECT id FROM jobcard_history
          WHERE jobcard_id = jc.id
          ORDER BY created_at DESC
          LIMIT 1
        )
      WHERE jc.customer_id = $1
      ORDER BY jc.created_at DESC
    `, [customerId]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getJobcardsByCustomer:", err);
    res.status(500).json({ message: "Failed to fetch customer job cards" });
  }
};
 
module.exports = {
  createJobcard,
  getJobcards,
  getJobCardById,
  getJobCardHistory,
  updateJobcard,
  updateJobCard,
  updateJobCardStatus,
  getJobcardsByTechnician,
  getJobcardsByCustomer,
  technicianUpdateJobCard,
  sendJobcardEmail,
  deleteJobCard
};