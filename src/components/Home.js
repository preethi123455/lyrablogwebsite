import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SERVER_URL } from "./constant";

const carouselImages = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600",
];

export default function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [slide, setSlide] = useState(0);
  const [search, setSearch] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      setUser(null);
    }
  };

  const getBlogs = async () => {
    const res = await fetch(`${SERVER_URL}/api/blogs/getblog`);
    const data = await res.json();
    setBlogs(data);
  };

  useEffect(() => {
    fetchUser();
    getBlogs();
  }, []);

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.content.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % carouselImages.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${SERVER_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="app-root">
     
      <header className="navbar">
        <div className="nav-container">
          <div className="logo">💗 LYRA</div>

          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
          </nav>

          <div className="nav-actions">
            {user ? (
              <>
                <span className="user">👋 {user.email}</span>
                <a href="/add" className="btn primary">
                  Add Blog
                </a>
                <a href="/dashboard" className="btn outline">
                  Dashboard
                </a>
                <button className="btn outline" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn outline">
                  Login
                </a>
                <a href="/register" className="btn primary">
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </header>

     
      <section className="hero" id="home">
        {carouselImages.map((img, i) => (
          <img
            key={i}
            src={img}
            className={`hero-img ${i === slide ? "active" : ""}`}
            alt=""
          />
        ))}
        <div className="hero-overlay">
          <h1>Share Your Stories</h1>
          <p>Read, write, and connect with writers worldwide</p>
        </div>
      </section>

      
      <main className="content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search blogs by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <h2 className="section-title">Latest Blogs</h2>
        <div className="blog-grid">
          {filteredBlogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog._id}`}
              className="blog-card-link"
            >
              <div className="blog-card">
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      
      <section className="about" id="about">
        <h2>About Chronicle</h2>
        <p className="about-text">
          Chronicle is a modern blogging platform where writers share ideas,
          stories, and experiences with a global audience.
        </p>

        <div className="features">
          <div className="feature-card">✍️ Creative Writing</div>
          <div className="feature-card">🌍 Global Readers</div>
          <div className="feature-card">💬 Meaningful Engagement</div>
          <div className="feature-card">🔒 Secure Platform</div>
        </div>
      </section>

      
      <footer className="footer">
        © 2025 💗LYRA · Where Stories Find Their Rhythm ❤️
      </footer>

      
      <style>{`
      /* SEARCH BAR */
.search-bar {
  max-width: 420px;
  margin: 0 auto 40px;
}

.search-bar input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

.search-bar input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.25);
}

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        body {
          background: #f5f7fb;
          color: #1f2937;
        }

        /* NAVBAR */
        .navbar {
          position: sticky;
          top: 0;
          backdrop-filter: blur(20px);
          background: rgba(102, 126, 234, 0.85);
          z-index: 100;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nav-container {
          max-width: 1200px;
          margin: auto;
          padding: 14px 24px;
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
        }

        .nav-links {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
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

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .user {
          color: white;
          font-size: 14px;
          margin-right: 8px;
        }

        .btn {
          padding: 8px 18px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.25s ease;
          text-decoration: none !important;
        }

        .btn:hover,
        .btn:focus,
        .btn:active {
          text-decoration: none !important;
        }

        .btn.primary {
          background: white;
          color: #667eea;
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.4);
        }

        .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.5);
        }

        .btn.outline {
          background: transparent;
          border: 2px solid white;
          color: white;
        }

        /* HERO */
        .hero {
          height: 420px;
          position: relative;
          overflow: hidden;
        }

        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1s ease;
        }

        .hero-img.active {
          opacity: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.45),
            rgba(0,0,0,0.65)
          );
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
        }

        .hero-overlay h1 {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .hero-overlay p {
          font-size: 18px;
          opacity: 0.9;
        }

        /* CONTENT */
        .content {
          max-width: 1200px;
          margin: auto;
          padding: 70px 24px;
        }

        .section-title {
          text-align: center;
          font-size: 32px;
          margin-bottom: 40px;
          color: #1f2937;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 26px;
          align-items: stretch;
        }

        .blog-card-link {
          text-decoration: none !important;
          color: inherit;
        }

        .blog-card-link:hover,
        .blog-card-link:focus,
        .blog-card-link:active {
          text-decoration: none !important;
        }

        .blog-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
        }

        .blog-meta {
          display: flex;
          gap: 12px;
          margin-top: 12px;
          font-size: 13px;
          color: #9ca3af;
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
          padding: 18px;
          display: flex;
          flex-direction: column;
          min-height: 120px;
        }

        .blog-body h3 {
          font-size: 18px;
          margin-bottom: 8px;
          color: #1f2937;
          line-height: 1.3;
          word-wrap: break-word;
        }

        .blog-body p {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
          flex: 1;
        }

        /* ABOUT */
        .about {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          padding: 80px 24px;
          text-align: center;
        }

        .about-text {
          max-width: 700px;
          margin: 16px auto 40px;
          color: #6b7280;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 22px;
          max-width: 900px;
          margin: auto;
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
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .features {
            grid-template-columns: 1fr;
          }
          .hero-overlay h1 {
            font-size: 32px;
          }
          .hero-overlay p {
            font-size: 16px;
          }
        }

        .feature-card {
          padding: 26px;
          border-radius: 18px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          font-weight: 600;
          transition: transform 0.3s;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .feature-card:hover {
          transform: translateY(-6px);
        }

        /* CONTACT */
        .contact {
          padding: 80px 24px;
          text-align: center;
        }

        .contact-sub {
          color: #6b7280;
          margin-bottom: 30px;
        }

        .contact-box {
          max-width: 500px;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .contact-box input,
        .contact-box textarea {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }

        /* FOOTER */
        .footer {
          background: #1f2937;
          color: #9ca3af;
          text-align: center;
          padding: 20px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
