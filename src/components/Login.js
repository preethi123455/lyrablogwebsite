import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SERVER_URL } from "./constant";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginRes = await fetch(`${SERVER_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setLoading(false);
        return;
      }

      const verifyRes = await fetch(`${SERVER_URL}/api/users/me`, {
        credentials: "include",
      });

      if (verifyRes.ok) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-overlay"></div>

      <form className="login-card" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Continue your blogging journey</p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="footer-text">
          New here?
          <span onClick={() => navigate("/register")}> Create account</span>
        </p>
      </form>

      
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        body {
          margin: 0;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: url("/blog-bg.jpg");
          background-size: cover;
          background-position: center;
          position: relative;
          padding: 40px 15px;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          pointer-events: none;
        }

        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 380px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-card input {
          width: 100%;
          padding: 12px 14px;
          margin-bottom: 15px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
        }
        .login-card input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        .login-card input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .password-box {
          position: relative;
        }

        .password-box span {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #111;
        }

        .login-card button {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s;
          text-decoration: none !important;
        }
        .login-card button:hover:not(:disabled),
        .login-card button:focus,
        .login-card button:active {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          text-decoration: none !important;
        }

        .login-card button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
        }

        .footer-text span {
          color: #f2efef;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none !important;
        }

        .footer-text span:hover {
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
