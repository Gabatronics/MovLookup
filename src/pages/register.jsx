import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import "../styles/register.css";

export default function RegisterPage() {
  const apiUrl = import.meta.env.VITE_MOVIE_API_URL;

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPassswordInput] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const confirm = (pass, pass2) => {
    if (pass === pass2) {
      return true;
    }

    setError("Passwords do not match");
    return false;
  };

  const register = (email, password) => {
    const url = `${apiUrl}/user/register`;

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((res) => res.json())
      .then((data) => {
        setError(data.message);
      })
      .catch((error) => {
        setError(error.message || "Registration failed");
        console.error("Error:", error);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (confirm(passwordInput, confirmation)) {
      register(emailInput, passwordInput);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card" aria-labelledby="register-title">
        <div className="register-card-header">
          <h1 id="register-title">Create your account</h1>
          <p>Save your favourite movies and explore ratings.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label htmlFor="register-email">Email</label>
            <div className="register-input-wrap">
              <Mail aria-hidden="true" size={20} />
              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-password">Password</label>
            <div className="register-input-wrap">
              <Lock aria-hidden="true" size={20} />
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPassswordInput(e.target.value)}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="register-icon-button"
                type="button"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <div className="register-input-wrap">
              <Lock aria-hidden="true" size={20} />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmation ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
              <button
                aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}
                className="register-icon-button"
                type="button"
                onClick={() => setShowConfirmation((isVisible) => !isVisible)}
              >
                {showConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="register-message">{error}</p>}

          <button className="register-submit" type="submit">
            Create account
          </button>
        </form>

        <p className="register-login-text">
          Already have an account? <Link to="/Login">Login</Link>
        </p>
      </section>
    </main>
  );
}
