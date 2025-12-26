import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "./constant";

const AddBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitBlog = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/addblog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content, thumbnail }),
      });

      if (res.ok) {
        navigate("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to add blog");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="overlay"></div>

      <div className="box">
        <h2>Add New Blog</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={submitBlog}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            rows="6"
          />
          <input
            type="text"
            placeholder="Thumbnail image URL (optional)"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Blog"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          background: url("/blog-bg.jpg") center/cover;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
        }
        .box {
          position: relative;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          padding: 30px;
          border-radius: 24px;
          color: white;
          width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        input, textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          font-family: inherit;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
        }
        input::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        input:focus, textarea:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }
        input:disabled, textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        button {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s;
          text-decoration: none !important;
        }
        button:hover:not(:disabled),
        button:focus,
        button:active {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          text-decoration: none !important;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-cancel {
          background: rgba(255,255,255,0.2) !important;
          border: 1px solid rgba(255,255,255,0.3) !important;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.3);
          color: white;
          padding: 10px;
          border-radius: 12px;
          margin-bottom: 15px;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AddBlog;
