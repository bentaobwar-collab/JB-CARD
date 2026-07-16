import { useState } from "react";
import axios from "axios";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Settings({ user }) {
  const displayName = user?.username
    ? user.username
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "User";

  const [profile, setProfile] = useState({
    fullName: displayName,
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    role: user?.role || "Technician",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);


  const [profileMsg, setProfileMsg]     = useState({ text: "", type: "" });
  const [passwordMsg, setPasswordMsg]   = useState({ text: "", type: "" });
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleDiscard = () => {
    setProfile({
      fullName: displayName,
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      role: user?.role || "Technician",
    });
    setProfileMsg({ text: "", type: "" });
  };

  const handleSave = async () => {
    setProfileMsg({ text: "", type: "" });
    setSavingProfile(true);

    try {
      await axios.put(
        "/api/auth/update-profile",
        {
          fullName: profile.fullName,
          email:    profile.email,
          phone:    profile.phone,
          address:  profile.address,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProfileMsg({ text: "Profile updated successfully.", type: "success", color: "green" });
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.error || "Failed to update profile.",
        type: "error",color: "red"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordMsg({ text: "", type: "" });

    if (!passwords.current) {
      return setPasswordMsg({ text: "Please enter your current password.", type: "error" });
    }
    if (passwords.newPassword.length < 6) {
      return setPasswordMsg({ text: "New password must be at least 6 characters.", type: "error" });
    }
    if (passwords.newPassword !== passwords.confirm) {
      return setPasswordMsg({ text: "New passwords do not match.", type: "error" });
    }

    setSavingPassword(true);

    try {
      const { data } = await axios.put(
        "/api/auth/change-password",
        {
          oldPassword: passwords.current,
          newPassword: passwords.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPasswordMsg({ text: data.message || "Password updated successfully.", type: "success" ,color: "green"});
      setPasswords({ current: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.error || "Failed to update password.",
        type: "error",color: "red"
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const getStrength = () => {
    let score = 0;
    if (passwords.newPassword.length >= 8)          score++;
    if (/[A-Z]/.test(passwords.newPassword))        score++;
    if (/[0-9]/.test(passwords.newPassword))        score++;
    if (/[^A-Za-z0-9]/.test(passwords.newPassword)) score++;
    return score;
  };

  return (
    <div className="settings-container">

      <div className="profile-summary">
        <div className="profile-avatar">{initials}</div>
        <div>
          <h2>{profile.fullName}</h2>
          <span className="role-badge">{profile.role}</span>
        </div>
      </div>

      <div className="settings-card">

        <div className="card-header">
          <FaUser />
          <div>
            <h3>Personal Information</h3>
            <p>Update your account details</p>
          </div>
        </div>

        <div className="card-body">
{profileMsg.text && (
  <p className={`feedback-msg ${profileMsg.type}`}
    style={{ color: profileMsg.type === "success" ? "green" : "red" }}>
    {profileMsg.text}
  </p>
)}
<div className="settings-grid">
<div><label>Full Name</label>
<input
  name="fullName"
 value={profile.fullName}
   onChange={handleProfileChange} />
</div>
 <div><label>Phone Number</label>
 <input
    name="phone"
   value={profile.phone}
   onChange={handleProfileChange}
    />
  </div>
 <div><label>Email Address</label>
 <input
  name="email"
  value={profile.email}
  onChange={handleProfileChange}
   />
   </div>
<div><label>Role</label>
<input value={profile.role} disabled /> </div>
</div>
<div className="address-field"><label>Address</label>
  <input
  name="address"
    value={profile.address}
   onChange={handleProfileChange}/>
          </div>
          <div className="action-buttons">
            <button className="btn-secondary" onClick={handleDiscard}>
              Discard
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>

      <div className="settings-card">

        <div className="card-header">
          <FaLock />
          <div>
            <h3>Change Password</h3>
          </div>
        </div>

        <div className="card-body">
      {passwordMsg.text && (
  <p className={`feedback-msg ${passwordMsg.type}`}
    style={{ color: passwordMsg.type === "success" ? "green" : "red" }} >
    {passwordMsg.text}
  </p>
)}
       <div className="password-group">
            <label>Current Password</label>
            <div className="password-input">
              <input
                type={showCurrent ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="settings-grid">

            <div>
              <label>New Password</label>
              <div className="password-input">
                <input
                  type={showNew ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  placeholder="At least 6 characters"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {passwords.newPassword.length > 0 && (
                <div className="strength-wrapper">
                  <div className="strength-bar">
                    <div className={`strength-fill strength-${getStrength()}`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label>Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="Re-enter new password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {passwords.confirm.length > 0 && (
                <p className={`match-hint ${passwords.newPassword === passwords.confirm ? "match" : "no-match"}`}>
                  {passwords.newPassword === passwords.confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

          </div>

          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handlePasswordUpdate}
              disabled={savingPassword}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}