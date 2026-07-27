import { useState } from "react";
import ManageTechnicians from "./Manage/ManageTechnicians.jsx";
import ManageCustomers from "./Manage/ManageCustomers.jsx";

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState("technicians");

  return (
    <div className="manage-page">
      <h1>User Management</h1>
      <div className="tab-buttons">
        <button className={activeTab === "technicians" ? "tab active" : "tab"}
          onClick={() => setActiveTab("technicians")}>Technicians</button>
        <button className={activeTab === "customers" ? "tab active" : "tab"}
          onClick={() => setActiveTab("customers")}>Customers</button>
      </div>
      <div className="tab-content">
        {activeTab === "technicians" ? <ManageTechnicians /> : <ManageCustomers />}
      </div>
    </div>
  );
}