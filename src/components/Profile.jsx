"use client";

import { useState, useEffect, useRef } from "react";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import "../Css/Profile.css";

const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    photoURL: "",
    currency: "USD",
    language: "en",
    darkMode: false,
    notifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showReauthForm, setShowReauthForm] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        setProfileData({
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          currency: userData.currency || "USD",
          language: userData.language || "en",
          darkMode: userData.darkMode || false,
          notifications:
            userData.notifications !== undefined
              ? userData.notifications
              : true,
        });
      } else {
        // If user document doesn't exist, initialize with default values
        setProfileData({
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          currency: "USD",
          language: "en",
          darkMode: false,
          notifications: true,
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `profile_photos/${user.uid}`);
      await uploadBytes(storageRef, file);

      // Get download URL
      const photoURL = await getDownloadURL(storageRef);

      // Update user profile
      await updateProfile(user, { photoURL });

      // Update state
      setProfileData({
        ...profileData,
        photoURL,
      });

      setSuccess("Profile photo updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating profile photo:", err);
      setError("Failed to update profile photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError(null);

      // Check if email has changed
      const emailChanged = user.email !== profileData.email;

      if (emailChanged) {
        setShowReauthForm(true);
        setSaving(false);
        return;
      }

      // Update display name
      if (user.displayName !== profileData.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName,
        });
      }

      // Save preferences to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          currency: profileData.currency,
          language: profileData.language,
          darkMode: profileData.darkMode,
          notifications: profileData.notifications,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReauthenticate = async () => {
    try {
      setSaving(true);
      setError(null);

      // Create credential
      const credential = EmailAuthProvider.credential(
        user.email,
        reauthPassword
      );

      // Reauthenticate
      await reauthenticateWithCredential(user, credential);

      // Update email if changed
      if (user.email !== profileData.email) {
        await updateEmail(user, profileData.email);
      }

      // Update display name if changed
      if (user.displayName !== profileData.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName,
        });
      }

      // Save preferences to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          currency: profileData.currency,
          language: profileData.language,
          darkMode: profileData.darkMode,
          notifications: profileData.notifications,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setShowReauthForm(false);
      setReauthPassword("");

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error during reauthentication:", err);
      setError(
        "Authentication failed. Please check your password and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateUserPassword = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match.");
        setSaving(false);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        setSaving(false);
        return;
      }

      // Create credential for reauthentication
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );

      // Reauthenticate
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);

      setSuccess("Password updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating password:", err);
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect. Please try again.");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <h2>Not Logged In</h2>
          <p>Please log in to view and edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Profile Settings</h2>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-photo-section">
          <div className="profile-photo" onClick={handleProfilePhotoClick}>
            {profileData.photoURL ? (
              <img
                src={profileData.photoURL || "/placeholder.svg"}
                alt="Profile"
              />
            ) : (
              <div className="photo-placeholder">
                <User size={40} />
              </div>
            )}
            <div className="photo-overlay">
              <Camera size={20} />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <p className="photo-hint">Click to change profile photo</p>
        </div>

        <div className="profile-form">
          <div className="form-section">
            <h3>Account Information</h3>

            <div className="form-group">
              <label htmlFor="displayName">
                <User size={16} />
                <span>Display Name</span>
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={profileData.displayName}
                onChange={handleProfileChange}
                placeholder="Your Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} />
                <span>Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="your.email@example.com"
              />
            </div>

            <button
              className="change-password-btn"
              onClick={() => setShowPasswordForm(true)}
            >
              <Lock size={16} />
              <span>Change Password</span>
            </button>
          </div>

          <div className="form-section">
            <h3>Preferences</h3>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={profileData.currency}
                onChange={handleProfileChange}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={profileData.language}
                onChange={handleProfileChange}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="darkMode">
                <input
                  type="checkbox"
                  id="darkMode"
                  name="darkMode"
                  checked={profileData.darkMode}
                  onChange={handleProfileChange}
                />
                <span>Dark Mode</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="notifications">
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={profileData.notifications}
                  onChange={handleProfileChange}
                />
                <span>Enable Notifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button
          className="save-profile-btn"
          onClick={saveProfile}
          disabled={saving || loading}
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {showPasswordForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button
                className="close-btn"
                onClick={() => setShowPasswordForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={updateUserPassword}
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReauthForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Your Password</h3>
              <button
                className="close-btn"
                onClick={() => setShowReauthForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Please enter your current password to confirm these changes.
              </p>
              <div className="form-group">
                <label htmlFor="reauthPassword">Current Password</label>
                <input
                  type="password"
                  id="reauthPassword"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowReauthForm(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleReauthenticate}
                disabled={saving || !reauthPassword}
              >
                {saving ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
