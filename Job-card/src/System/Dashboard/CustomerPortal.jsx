import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const formatName = (value) => {
  if (!value) return "Customer";
  return String(value)
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const getCustomerMatches = (job, user) => {
  const username = user?.username || user?.name || user?.email || "";
  const normalizedUser = username.toLowerCase();
  const customerId = user?.id || user?.customer_id || user?.userId;
  const customerName = (job.customer_name || job.customer || "").toLowerCase();
  const technicianName = (job.technician || "").toLowerCase();
  const ticketId = String(job.customer_id || "").toLowerCase();

  return (
    customerName.includes(normalizedUser) ||
    normalizedUser.includes(customerName) ||
    (customerId && String(customerId).toLowerCase() === ticketId) ||
    technicianName.includes(normalizedUser)
  );
};

const formatDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const summarize = (text, length = 100) => {
  if (!text) return "No additional details provided.";
  return text.length <= length ? text : `${text.slice(0, length).trim()}...`;
};

const statusClass = (status) => {
  const normalized = (status || "").toLowerCase().replace(/\s+/g, "-");
  return `customer-status-badge ${normalized}`;
};

export default function CustomerPortal({ user, jobs = [] }) {
  const navigate = useNavigate();
  const [portalJobs, setPortalJobs] = useState(jobs || []);
  const [loading, setLoading] = useState(false);
  const [showJobCards, setShowJobCards] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setPortalJobs(jobs || []);
      return;
    }

    let cancelled = false;
    const loadCustomerJobs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setPortalJobs(jobs || []);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API}/jobcards/my-customer-jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load job cards");
        }

        if (!cancelled) {
          setPortalJobs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setPortalJobs(jobs || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomerJobs();

    return () => {
      cancelled = true;
    };
  }, [jobs, user]);

  const customerJobs = useMemo(() => {
    return (portalJobs || []).filter((job) => getCustomerMatches(job, user));
  }, [portalJobs, user]);

  const stats = useMemo(() => {
    return {
      total: customerJobs.length,
      pending: customerJobs.filter((job) => (job.status || "Pending").toLowerCase() === "pending").length,
      inProgress: customerJobs.filter((job) => (job.status || "In Progress").toLowerCase().includes("progress") || (job.status || "").toLowerCase() === "in progress").length,
      completed: customerJobs.filter((job) => (job.status || "Completed").toLowerCase() === "completed").length,
    };
  }, [customerJobs]);

  const userName = user?.username
    ? formatName(user.username)
    : user?.name
      ? formatName(user.name)
      : "Customer";

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Customer";

  return (
    <div className="main-content customer-portal">
      <div className="page-header">
        <div>
          <h1>Job Cards</h1>
        </div>
        <span className={`role-pill ${user?.role || "customer"}`}>{roleLabel}</span>
      </div>

      <div className="dashboard-container">
        <div className="card1">
          <h3>{stats.total}</h3>
          <p>Total Requests</p>
        </div>
        <div className="card2">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="card3">
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </div>
        <div className="card4">
          <h3>{stats.completed}</h3>
          <p>Completed</p>
        </div>
      </div>

      <div className="customer-portal-panel">
        <div className="customer-panel-header">
          <div>
            <h2>Job Card Overview</h2>
            <p>Assigned job cards are summarized below for quick review.</p>
          </div>
          <button className="customer-view-btn" onClick={() => setShowJobCards((value) => !value)}>
            {showJobCards ? "Hide Job Cards" : "View My Job Cards"}
          </button>
        </div>



        {showJobCards && (
          loading ? (
            <div className="customer-empty-state">
              <h3>Loading your job cards…</h3>
              <p>Please wait while we pull your assigned work.</p>
            </div>
          ) : customerJobs.length === 0 ? (
            <div className="customer-empty-state">
              <h3>No job cards found</h3>
              <p>You do not have any job cards linked to your account yet.</p>
            </div>
          ) : (
            <div className="customer-job-list">
              {customerJobs.map((job) => (
                <article className="customer-job-card" key={job.id || job._id || job.title}>
                  <div className="customer-job-card-simple">
                    <h3>{job.title || "Job Card"}</h3>
                    <button className="customer-details-btn" onClick={() => navigate(`/customer/job/${job.id}`)}>
                      View details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
