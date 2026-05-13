import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import "../styles/login.css";

export default function LoginPage() {
  const apiUrl = import.meta.env.VITE_MOVIE_API_URL;
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPassswordInput] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async (email, password) => {
    const url = `${apiUrl}/user/login`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || "Login failed");
      }

      localStorage.setItem("token", res.bearerToken.token);
      localStorage.setItem("refreshToken", res.refreshToken.token);

      navigate(`/`);
      window.location.reload();
    } catch (error) {
      console.error("Error during login:", error);
      setError(error.message || "An unexpected error occurred");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login(emailInput, passwordInput);
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-header">
          <h1 id="login-title">Welcome back</h1>
          <p>Log in to save favourites and explore movie ratings.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <div className="login-input-wrap">
              <Mail aria-hidden="true" size={20} />
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <Lock aria-hidden="true" size={20} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPassswordInput(e.target.value)}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="login-icon-button"
                type="button"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="login-message">{error}</p>}

          <button className="login-submit" type="submit">
            Login
          </button>
        </form>

        <p className="login-register-text">
          Don&apos;t have an account? <Link to="/Register">Register</Link>
        </p>
      </section>
    </main>
  );
}
