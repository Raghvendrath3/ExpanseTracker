import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import { firebaseConfig } from "../firebaseConfig"; // Make sure to configure your Firebase project

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [toggle, setToggle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateSignUp = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!acceptPolicy) {
      setError("You must accept the Terms and Privacy Policy");
      return false;
    }

    if (!fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        // Validate sign-up form
        if (!validateSignUp()) return;

        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Update profile with full name
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });

        // Reset form fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setAcceptPolicy(false);
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setEmail("");
        setPassword("");
        navigate("/home");
      }
    } catch (err) {
      let errorMessage = err.message;

      // Improve error messages
      if (errorMessage.includes("auth/email-already-in-use")) {
        errorMessage =
          "This email is already registered. Try signing in instead.";
      } else if (errorMessage.includes("auth/weak-password")) {
        errorMessage = "Password should be at least 6 characters.";
      } else if (errorMessage.includes("auth/invalid-email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (
        errorMessage.includes("auth/user-not-found") ||
        errorMessage.includes("auth/wrong-password")
      ) {
        errorMessage = "Invalid email or password.";
      }

      setError(errorMessage);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setToggle(true);
    setTimeout(() => {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setAcceptPolicy(false);
      setError("");
      setIsSignUp(!isSignUp);
      setToggle(false);
    }, 300);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/home");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="auth-wrapper">
      {/* Decorative elements */}
      <div className="auth-decoration auth-decoration-1"></div>
      <div className="auth-decoration auth-decoration-2"></div>
      <div className="auth-decoration auth-decoration-3"></div>
      <div className="auth-decoration auth-decoration-4"></div>

      <form
        className={`auth-container ${toggle ? "toggle" : ""}`}
        onSubmit={handleAuth}
      >
        <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
        <p className="auth-subtitle">
          {isSignUp
            ? "Sign up to track your expenses efficiently"
            : "Sign in to continue tracking your expenses"}
        </p>

        {isSignUp && (
          <div className="auth-input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="auth-input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="password">Password</label>
          <div className="auth-password-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={handleTogglePassword}
              tabIndex="-1"
            >
              {showPassword ? "👁" : "🔒"}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-password-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={handleToggleConfirmPassword}
                tabIndex="-1"
              >
                {showConfirmPassword ? "👁" : "🔒"}
              </button>
            </div>
          </div>
        )}

        {isSignUp && (
          <div className="auth-policy-checkbox">
            <input
              type="checkbox"
              id="policy"
              checked={acceptPolicy}
              onChange={() => setAcceptPolicy(!acceptPolicy)}
            />
            <label htmlFor="policy">
              I accept the <a href="/terms">Terms</a> and{" "}
              <a href="/privacy">Privacy Policy</a>
            </label>
          </div>
        )}

        {error && <p className="auth-error-message">{error}</p>}

        <button type="submit" className="auth-btn">
          {isSignUp ? "Create Account" : "Sign In"}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          className="auth-btn auth-google-btn"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={toggleAuthMode}
          className="auth-btn auth-toggle-mode-btn"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Auth;
