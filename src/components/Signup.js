import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SERVER_URL } from "./constant";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch(`${SERVER_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      navigate("/login");
    }
  };

  return (
    <div className="register-page">
     
      <div className="bg-overlay"></div>

      <form className="register-card" onSubmit={handleRegister}>
        <h2>Create Account</h2>
        <p className="subtitle">Start sharing your stories</p>

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

        <button type="submit">Register</button>

        <p className="footer-text">
          Already have an account?
          <span onClick={() => navigate("/login")}> Login</span>
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

        .register-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: url("/blog-bg.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          padding: 40px 15px;
        }

        /* Dark overlay */
        .bg-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
        }

        .register-card {
          position: relative;
          width: 100%;
          max-width: 380px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideUp 0.8s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .register-card h2 {
          text-align: center;
          margin-bottom: 6px;
        }

        .subtitle {
          text-align: center;
          font-size: 14px;
          opacity: 0.85;
          margin-bottom: 25px;
        }

        .register-card input {
          width: 100%;
          padding: 12px 14px;
          margin-bottom: 15px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          font-size: 15px;
          outline: none;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
        }
        .register-card input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        .register-card input:focus {
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
          font-size: 18px;
          color: #111;
        }

        .register-card button {
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
          margin-top: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          text-decoration: none !important;
        }

        .register-card button:hover,
        .register-card button:focus,
        .register-card button:active {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          text-decoration: none !important;
        }

        .footer-text {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.9;
        }

        .footer-text span {
          color: #feffffff;
          font-weight: 600;
          cursor: pointer;
          margin-left: 5px;
          text-decoration: none !important;
        }

        .footer-text span:hover {
          text-decoration: none !important;
        }

        @media (max-width: 420px) {
          .register-card {
            padding: 30px 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
