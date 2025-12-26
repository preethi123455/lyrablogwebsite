import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SERVER_URL } from "./constant";
import ChatBox from "./Chatbot";

export default function BlogDetail() {
  const [joinedChat, setJoinedChat] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [editBlogData, setEditBlogData] = useState({
    title: "",
    content: "",
    thumbnail: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    blog: false,
    comment: null,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  
  useEffect(() => {
    if (blog && user) {
      const userIdStr = user._id?.toString();
      setIsLiked(
        blog.likes?.some((likeId) => {
          return likeId.toString() === userIdStr;
        }) || false
      );
      setIsSaved(
        blog.savedBy?.some((savedId) => {
          return savedId.toString() === userIdStr;
        }) || false
      );
    } else if (blog && !user) {
      setIsLiked(false);
      setIsSaved(false);
    }
  }, [blog, user]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/blogs/${id}`);
      if (res.ok) {
        const blogData = await res.json();
        setBlog(blogData);
        setLikesCount(blogData.likes?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/${id}/like`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
        fetchBlog();
      }
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/${id}/save`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        setIsSaved(!isSaved);
        fetchBlog();
      }
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: commentText }),
      });

      if (res.ok) {
        setCommentText("");
        fetchBlog();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        navigate("/dashboard");
      } else {
        const data = await res.json();
        setMessage({
          text: data.message || "Failed to delete blog",
          type: "error",
        });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      setMessage({ text: "Error deleting blog", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleEditBlog = () => {
    setIsEditingBlog(true);
    setEditBlogData({
      title: blog.title,
      content: blog.content,
      thumbnail: blog.thumbnail || "",
    });
  };

  const handleSaveBlogEdit = async (e) => {
    e.preventDefault();

    if (!editBlogData.title || !editBlogData.content) {
      setMessage({ text: "Title and content are required", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/blogs/${id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editBlogData),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          await fetchBlog(); 
          setIsEditingBlog(false);
          setMessage({ text: "Blog updated successfully!", type: "success" });
          setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        } else {
          await fetchBlog();
          setIsEditingBlog(false);
          setMessage({ text: "Blog updated successfully!", type: "success" });
          setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
      } else {
        const contentType = res.headers.get("content-type");
        let errorMessage = "Failed to update blog";
        if (contentType && contentType.includes("application/json")) {
          try {
            const data = await res.json();
            errorMessage = data.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${res.status} ${res.statusText}`;
          }
        } else {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setMessage({ text: errorMessage, type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      setMessage({
        text: `Error updating blog: ${error.message}`,
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleCancelBlogEdit = () => {
    setIsEditingBlog(false);
    setEditBlogData({ title: "", content: "", thumbnail: "" });
  };

  const handleEditComment = (comment) => {
    const commentId = comment._id || comment.id;
    if (commentId) {
      setEditingCommentId(commentId.toString());
      setEditingCommentText(comment.message);
    }
  };

  const handleSaveCommentEdit = async (commentId) => {
    if (!editingCommentText.trim()) {
      setMessage({ text: "Comment cannot be empty", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    if (!commentId) {
      setMessage({ text: "Comment ID is missing", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    try {
      const res = await fetch(
        `${SERVER_URL}/api/blogs/${id}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: editingCommentText }),
        }
      );

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          await fetchBlog(); 
          setEditingCommentId(null);
          setEditingCommentText("");
          setMessage({ text: "Comment updated!", type: "success" });
          setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        } else {
          await fetchBlog();
          setEditingCommentId(null);
          setEditingCommentText("");
          setMessage({ text: "Comment updated!", type: "success" });
          setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
      } else {
        const contentType = res.headers.get("content-type");
        let errorMessage = "Failed to update comment";
        if (contentType && contentType.includes("application/json")) {
          try {
            const data = await res.json();
            errorMessage = data.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${res.status} ${res.statusText}`;
          }
        }
        setMessage({ text: errorMessage, type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      setMessage({
        text: `Error updating comment: ${error.message}`,
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      setMessage({ text: "Comment ID is missing", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    try {
      const res = await fetch(
        `${SERVER_URL}/api/blogs/${id}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        await fetchBlog(); 
        setMessage({ text: "Comment deleted", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        const contentType = res.headers.get("content-type");
        let errorMessage = "Failed to delete comment";
        if (contentType && contentType.includes("application/json")) {
          try {
            const data = await res.json();
            errorMessage = data.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${res.status} ${res.statusText}`;
          }
        } else {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setMessage({ text: errorMessage, type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setMessage({
        text: `Error deleting comment: ${error.message}`,
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
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

  if (!blog) {
    return (
      <div className="error-container">
        <h2>Blog not found</h2>
        <Link to="/" className="btn primary">
          Go Home
        </Link>
        <style>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
          }
          .btn {
            padding: 12px 24px;
            background: white;
            color: #ffffffff;
            text-decoration: none !important;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
          }

          .btn:hover,
          .btn:focus,
          .btn:active {
            text-decoration: none !important;
          }
        `}</style>
      </div>
    );
  }

  const isOwner =
    user && blog.authorId?._id?.toString() === user._id?.toString();

  return (
    <div className="blog-detail">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            💗 LYRA
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            {user && <Link to="/dashboard">Dashboard</Link>}
            {user && <Link to="/saved">Saved</Link>}
          </nav>
          
        </div>
      </header>

      {/* MESSAGE NOTIFICATION */}
      {message.text && (
        <div className={`message-notification ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* BLOG CONTENT */}
      <main className="blog-main">
        <div className="blog-container">
          {/* BLOG HEADER */}
          <div className="blog-header">
            {isEditingBlog ? (
              <form onSubmit={handleSaveBlogEdit} className="edit-blog-form">
                <input
                  type="text"
                  value={editBlogData.title}
                  onChange={(e) =>
                    setEditBlogData({ ...editBlogData, title: e.target.value })
                  }
                  placeholder="Blog Title"
                  required
                  className="edit-input"
                />
                <textarea
                  value={editBlogData.content}
                  onChange={(e) =>
                    setEditBlogData({
                      ...editBlogData,
                      content: e.target.value,
                    })
                  }
                  placeholder="Blog Content"
                  required
                  rows="10"
                  className="edit-textarea"
                />
                <input
                  type="text"
                  value={editBlogData.thumbnail}
                  onChange={(e) =>
                    setEditBlogData({
                      ...editBlogData,
                      thumbnail: e.target.value,
                    })
                  }
                  placeholder="Thumbnail URL (optional)"
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button type="submit" className="btn primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelBlogEdit}
                    className="btn outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1>{blog.title}</h1>
                <div className="blog-meta">
                  <span>By {blog.authorId?.email || "Unknown"}</span>
                  <span>•</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>

        
          {blog.thumbnail && (
            <div className="blog-image">
              <img src={blog.thumbnail} alt={blog.title} />
            </div>
          )}

         
          <div className="blog-actions-bar">
            <button
              onClick={handleLike}
              className={`action-btn ${isLiked ? "liked" : ""}`}
            >
              {isLiked ? "❤️" : "🤍"} {likesCount}
            </button>
            {user && (
              <button
                onClick={handleSave}
                className={`action-btn ${isSaved ? "saved" : ""}`}
              >
                {isSaved ? "🔖" : "🔗"} {isSaved ? "Saved" : "Save"}
              </button>
            )}
            {isOwner && (
              <>
                <button onClick={handleEditBlog} className="action-btn edit">
                  ✏️ Edit
                </button>
                <button onClick={handleDelete} className="action-btn danger">
                  🗑️ Delete
                </button>
              </>
            )}
          </div>

         
          {!isEditingBlog && (
            <div className="blog-content">
              <p>{blog.content}</p>
            </div>
          )}

        
          <div className="comments-section">
            <h2>Comments ({blog.comments?.length || 0})</h2>

            {user && (
              <form onSubmit={handleComment} className="comment-form">
                <textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows="3"
                />
                <button type="submit" className="btn primary">
                  Post Comment
                </button>
              </form>
            )}

            <div className="comments-list">
              {blog.comments && blog.comments.length > 0 ? (
                blog.comments.map((comment, index) => {
                  const commentId = comment._id || comment.id;
                  const isCommentOwner =
                    user &&
                    (comment.userId?._id?.toString() === user._id?.toString() ||
                      comment.userId?.toString() === user._id?.toString());
                  const isBlogOwner = isOwner;

                  return (
                    <div key={commentId || index} className="comment-item">
                      <div className="comment-header">
                        <div>
                          <strong>{comment.userId?.email || "Unknown"}</strong>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {(isCommentOwner || isBlogOwner) && (
                          <div className="comment-actions">
                            {editingCommentId &&
                            editingCommentId.toString() ===
                              commentId.toString() ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleSaveCommentEdit(commentId.toString())
                                  }
                                  className="btn-icon save"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={handleCancelCommentEdit}
                                  className="btn-icon cancel"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                {isCommentOwner && (
                                  <button
                                    onClick={() => handleEditComment(comment)}
                                    className="btn-icon edit"
                                    type="button"
                                  >
                                    ✏️
                                  </button>
                                )}
                                {(isCommentOwner || isBlogOwner) && (
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(commentId.toString())
                                    }
                                    className="btn-icon delete"
                                    type="button"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {editingCommentId &&
                      editingCommentId.toString() === commentId.toString() ? (
                        <textarea
                          value={editingCommentText}
                          onChange={(e) =>
                            setEditingCommentText(e.target.value)
                          }
                          className="edit-comment-textarea"
                          rows="3"
                        />
                      ) : (
                        <p className="comment-text">{comment.message}</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="no-comments">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
      
<div
  style={{
    marginTop: "50px",
    paddingTop: "40px",
    borderTop: "2px solid rgba(255,255,255,0.2)",
  }}
>
  <h2 style={{ color: "white", marginBottom: "16px" }}>
    Live Discussion
  </h2>



  {user ? (
    !joinedChat ? (
      <button
        onClick={() => setJoinedChat(true)}
        style={{
          padding: "12px 24px",
          borderRadius: "999px",
          background: "white",
          color: "#1f2937",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
        }}
      >
        🚀 Join Live Chat
      </button>
    ) : (
      <ChatBox
        blogId={id}
        username={user.email}
      />
    )
  ) : (
    <p style={{ color: "white" }}>
      <Link to="/login" style={{ color: "#93c5fd" }}>
        Login
      </Link>{" "}
      to join the live chat
    </p>
  )}
</div>




        </div>
      </main>

      
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .blog-detail {
          min-height: 100vh;
          background:
  radial-gradient(
    circle at center,
    transparent 40%,
    rgba(0,0,0,0.35) 100%
  ),
  linear-gradient(
    180deg,
    #181a3a 0%,
    #17183a 35%,
    #151636 70%,
    #141432 100%
  );
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

        .nav-links a:hover {
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
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
        }

        .btn.outline {
          background: transparent;
          border: 2px solid white;
          color: white;
        }

        .btn.outline:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .blog-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .blog-container {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          width: 100%;
          box-sizing: border-box;
        }

        .blog-header {
          margin-bottom: 30px;
          text-align: left;
        }

        .blog-header h1 {
          font-size: 36px;
          color: white;
          margin-bottom: 12px;
          font-weight: 700;
          line-height: 1.2;
          word-wrap: break-word;
        }

        .blog-meta {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .blog-image {
          margin-bottom: 30px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .blog-image img {
          width: 100%;
          max-height: 500px;
          object-fit: cover;
          display: block;
        }

        .blog-actions-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          align-items: center;
        }

        .action-btn {
          padding: 10px 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          color: white;
          text-decoration: none !important;
        }

        .action-btn:hover,
        .action-btn:focus,
        .action-btn:active {
          text-decoration: none !important;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .action-btn.liked {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .action-btn.saved {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .action-btn.edit {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .action-btn.danger {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .action-btn.danger:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .blog-content {
          margin-bottom: 40px;
        }

        .blog-content p {
          font-size: 18px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.95);
          white-space: pre-wrap;
        }

        .comments-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
        }

        .comments-section h2 {
          font-size: 24px;
          color: white;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .comment-form {
          margin-bottom: 30px;
        }

        .comment-form textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 12px;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
        }
        .comment-form textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .comment-item {
          padding: 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }

        .comment-item:hover {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .comment-header > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .comment-header strong {
          color: white;
          font-size: 15px;
        }

        .comment-date {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
        }

        .comment-text {
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-top: 8px;
        }

        .comment-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          align-items: center;
        }

        .btn-icon {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          color: white;
          text-decoration: none !important;
        }

        .btn-icon:hover,
        .btn-icon:focus,
        .btn-icon:active {
          text-decoration: none !important;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .edit-comment-textarea {
          width: 100%;
          padding: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
        }
        .edit-comment-textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .edit-blog-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .edit-input, .edit-textarea {
          padding: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-family: inherit;
          font-size: 15px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
        }
        .edit-input::placeholder, .edit-textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .edit-textarea {
          resize: vertical;
          min-height: 200px;
        }

        .edit-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .no-comments {
          color: rgba(255, 255, 255, 0.8);
          font-style: italic;
          text-align: center;
          padding: 40px;
        }

        .message-notification {
          position: fixed;
          top: 80px;
          right: 20px;
          padding: 16px 24px;
          border-radius: 12px;
          backdrop-filter: blur(20px);
          z-index: 1000;
          animation: slideIn 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .message-notification.success {
          background: rgba(34, 197, 94, 0.9);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .message-notification.error {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .blog-container {
            padding: 24px;
          }
          .blog-header h1 {
            font-size: 28px;
          }
          .blog-content p {
            font-size: 16px;
          }
          .blog-actions-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .action-btn {
            width: 100%;
            text-align: center;
          }
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
          .comment-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .comment-actions {
            align-self: flex-end;
          }
          .edit-actions {
            flex-direction: column;
          }
          .edit-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
