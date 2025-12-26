import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SERVER_URL } from "./constant";

const SavedBlogs = () => {
  const navigate = useNavigate();
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedBlogs();
  }, []);

  const fetchSavedBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/blogs/saved`, {
        credentials: "include",
      });
      if (res.ok) {
        const blogs = await res.json();
        setSavedBlogs(blogs);
      } else if (res.status === 401) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching saved blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (blogId) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/${blogId}/save`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        setSavedBlogs(savedBlogs.filter((blog) => blog._id !== blogId));
      }
    } catch (error) {
      console.error("Error unsaving blog:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f5f7fb;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(102, 126, 234, 0.3);
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="saved-page">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            💗 LYRA
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/add">Add Blog</Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="saved-content">
        <div className="saved-header">
          <h1>💾 Saved Blogs</h1>
          <p>Your saved blogs appear here</p>
        </div>

        {savedBlogs.length === 0 ? (
          <div className="empty-state">
            <p>You haven't saved any blogs yet.</p>
            <Link to="/" className="btn primary">
              Explore Blogs
            </Link>
          </div>
        ) : (
          <div className="blogs-grid">
            {savedBlogs.map((blog) => (
              <div key={blog._id} className="blog-card">
                <div className="blog-image">
                  <img
                    src={
                      blog.thumbnail ||
                      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600"
                    }
                    alt={blog.title}
                  />
                </div>
                <div className="blog-body">
                  <h3>{blog.title}</h3>
                  <p>{blog.content.slice(0, 120)}...</p>
                  <div className="blog-meta">
                    <span>❤️ {blog.likes?.length || 0}</span>
                    <span>💬 {blog.comments?.length || 0}</span>
                    <span>By {blog.authorId?.email || "Unknown"}</span>
                  </div>
                  <div className="blog-actions">
                    <Link
                      to={`/blog/${blog._id}`}
                      className="btn primary small"
                    >
                      Read More
                    </Link>
                    <button
                      onClick={() => handleUnsave(blog._id)}
                      className="btn outline small"
                    >
                      Unsave
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .saved-page {
          min-height: 100vh;
          background: #f5f7fb;
        }

        .navbar {
          background: rgba(102, 126, 234, 0.85);
          backdrop-filter: blur(20px);
          padding: 14px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .logo {
          font-size: 22px;
          font-weight: 700;
          color: white;
          text-decoration: none !important;
        }

        .logo:hover {
          text-decoration: none !important;
        }

        .nav-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .nav-links a {
          color: white;
          text-decoration: none !important;
          font-weight: 500;
        }

        .nav-links a:hover,
        .nav-links a:focus,
        .nav-links a:active {
          text-decoration: none !important;
        }

        .saved-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .saved-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .saved-header h1 {
          font-size: 36px;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .saved-header p {
          color: #6b7280;
          font-size: 16px;
        }

        .empty-state {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          padding: 60px 24px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 20px;
          font-size: 16px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          text-decoration: none !important;
          display: inline-block;
          font-size: 14px;
        }

        .btn:hover,
        .btn:focus,
        .btn:active {
          text-decoration: none !important;
        }

        .btn.primary {
          background: #667eea;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn.primary:hover {
          transform: translateY(-2px);
        }

        .btn.outline {
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
        }

        .btn.outline:hover {
          background: #667eea;
          color: white;
        }

        .btn.small {
          padding: 8px 16px;
          font-size: 12px;
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          align-items: stretch;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .nav-links {
            width: 100%;
            justify-content: center;
          }
          .blogs-grid {
            grid-template-columns: 1fr;
          }
        }

        .blog-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 12px rgba(0,0,0,0.15);
        }

        .blog-image {
          position: relative;
          overflow: hidden;
        }

        .blog-image img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }

        .blog-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .blog-body h3 {
          font-size: 20px;
          color: #1f2937;
          margin-bottom: 10px;
          line-height: 1.3;
          word-wrap: break-word;
        }

        .blog-body p {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 12px;
          line-height: 1.5;
          flex: 1;
        }

        .blog-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #9ca3af;
        }

        .blog-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
};

export default SavedBlogs;
