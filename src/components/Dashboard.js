import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SERVER_URL } from "./constant";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState({
    totalBlogs: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    fetchUser();
    fetchMyBlogs();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/blogs/myblogs`, {
        credentials: "include",
      });
      if (res.ok) {
        const blogs = await res.json();
        setMyBlogs(blogs);

       
        let totalLikes = 0;
        let totalComments = 0;
        blogs.forEach((blog) => {
          totalLikes += blog.likes?.length || 0;
          totalComments += blog.comments?.length || 0;
        });

        setActivities({
          totalBlogs: blogs.length,
          totalLikes,
          totalComments,
        });
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${SERVER_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDelete = async (blogId) => {
    

    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/${blogId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setMyBlogs(myBlogs.filter((blog) => blog._id !== blogId));
        setActivities({
          ...activities,
          totalBlogs: activities.totalBlogs - 1,
        });
      } else {
        alert("Failed to delete blog");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting blog");
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
    <div className="dashboard">
     
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            💗 LYRA
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/add">Add Blog</Link>
            <Link to="/saved">Saved</Link>
          </nav>
          <div className="nav-actions">
            <span className="user">👋 {user?.email}</span>
            <button className="btn outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

     
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Your Dashboard</h1>
          <p>Manage your blogs and track your activity</p>
        </div>

       
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>{activities.totalBlogs}</h3>
              <p>Total Blogs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>{activities.totalLikes}</h3>
              <p>Total Likes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>{activities.totalComments}</h3>
              <p>Total Comments</p>
            </div>
          </div>
        </div>

       
        <div className="blogs-section">
          <div className="section-header">
            <h2>My Blogs</h2>
            <Link to="/add" className="btn primary">
              + Add New Blog
            </Link>
          </div>

          {myBlogs.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any blogs yet.</p>
              <Link to="/add" className="btn primary">
                Create Your First Blog
              </Link>
            </div>
          ) : (
            <div className="blogs-grid">
              {myBlogs.map((blog) => (
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
                      <span>
                        📅 {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="blog-actions">
                      <Link
                        to={`/blog/${blog._id}`}
                        className="btn outline small"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="btn danger small"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

     
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard {
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
          transition: opacity 0.3s;
        }

        .nav-links a:hover,
        .nav-links a:focus,
        .nav-links a:active {
          opacity: 0.8;
          text-decoration: none !important;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .user {
          color: white;
          font-size: 14px;
        }

        .btn {
          padding: 8px 18px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          text-decoration: none !important;
          display: inline-block;
          transition: all 0.25s ease;
          font-size: 14px;
        }

        .btn:hover,
        .btn:focus,
        .btn:active {
          text-decoration: none !important;
        }

        .btn.primary {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
        }

        .btn.primary:hover {
          transform: translateY(-2px);
        }

        .btn.outline {
          background: transparent;
          border: 2px solid white;
          color: white;
        }

        .btn.danger {
          background: #ef4444;
          color: white;
        }

        .btn.danger:hover {
          background: #dc2626;
        }

        .btn.small {
          padding: 6px 14px;
          font-size: 12px;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .dashboard-header h1 {
          font-size: 36px;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .dashboard-header p {
          color: #6b7280;
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 50px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          font-size: 40px;
        }

        .stat-info h3 {
          font-size: 28px;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-info p {
          color: #6b7280;
          font-size: 14px;
        }

        .blogs-section {
          margin-top: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .section-header h2 {
          font-size: 28px;
          color: #1f2937;
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
          .nav-actions {
            width: 100%;
            justify-content: center;
          }
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .section-header h2 {
            margin-bottom: 12px;
          }
          .blogs-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
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
          gap: 16px;
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

        .btn.outline.small {
          border-color: #667eea;
          color: #667eea;
        }

        .btn.outline.small:hover {
          background: #667eea;
          color: white;
        }

        .btn.danger.small:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}
