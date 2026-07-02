import { useState } from "react";
import {FaUser,FaLock,FaEye,FaEyeSlash} from "react-icons/fa";

export default function Settings({ user }) {
   const displayName = user?.username
    ? user.username
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

   const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
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
  };

  const handleSave = () => {
    console.log("Save Profile", profile);

    // API CALL HERE
  };

  const handlePasswordUpdate = () => {
    if (passwords.newPassword !== passwords.confirm) {
      alert("Passwords do not match");
      return;
    }

    console.log(passwords);

    // API CALL HERE
  };

  const getStrength = () => {
    let score = 0;

    if (passwords.newPassword.length >= 8) score++;
    if (/[A-Z]/.test(passwords.newPassword)) score++;
    if (/[0-9]/.test(passwords.newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(passwords.newPassword)) score++;

    return score;
  };

  return (
    <div className="settings-container">

      {/* Profile Header */}

      <div className="profile-summary">

        <div className="profile-avatar">
          {initials}
        </div>

        <div>
          <h2>{profile.fullName}</h2>

          <span className="role-badge">
            {profile.role}
          </span>
        </div>

      </div>

      {/* Personal Information */}

      <div className="settings-card">

        <div className="card-header">
          <FaUser />
          <div>
            <h3>Personal Information</h3>
            <p>Update your account information</p>
          </div>
        </div>

        <div className="card-body">

          <div className="settings-grid">

            <div>
              <label>Full Name</label>
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
              />
            </div>

            <div>
              <label>Phone Number</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
              />
            </div>

            <div>
              <label>Email Address</label>
              <input
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
            </div>

            <div>
              <label>Role</label>
              <input
                value={profile.role}
                disabled
              />
            </div>

          </div>

          <div className="address-field">
            <label>Address</label>

            <input
              name="address"
              value={profile.address}
              onChange={handleProfileChange}
            />
          </div>

          <div className="action-buttons">
            <button
              className="btn-secondary"
              onClick={handleDiscard}
            >
              Discard
            </button>

            <button
              className="btn-primary"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>

        </div>

      </div>

      {/* Password Section */}

      <div className="settings-card">

        <div className="card-header">
          <FaLock />
          <div>
            <h3>Change Password</h3>
          </div>
        </div>

        <div className="card-body">

          <div className="password-group">
            <label>Current Password</label>

            <div className="password-input">

              <input
                type={showCurrent ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    current: e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(!showCurrent)
                }
              >
                {showCurrent ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
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
                    setPasswords({
                      ...passwords,
                      newPassword: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNew(!showNew)
                  }
                >
                  {showNew ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

              <div className="strength-bar">
                <div
                  className={`strength-fill strength-${getStrength()}`}
                />
              </div>

            </div>

            <div>
              <label>Confirm Password</label>

              <div className="password-input">

                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirm: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                >
                  {showConfirm ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>
            </div>

          </div>

          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handlePasswordUpdate}
            >
              Update Password
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}