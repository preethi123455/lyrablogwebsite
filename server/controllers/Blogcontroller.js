import Blog from "../models/blogSchema.js";
import bcrypt from "bcryptjs";

export const addController = async (req, res) => {
  try {
    const { title, content, thumbnail } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "All fields required" });
    }

    const blog = new Blog({
      title,
      content,
      thumbnail: thumbnail || "",
      authorId: req.user.userId,
      likes: [],
      comments: [],
    });

    await blog.save();

    return res.status(201).json({
      success: true,
      message: "Blog added successfully",
      blog,
    });
  } catch (error) {
    console.error("Add Blog Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getController = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("authorId", "email")
      .populate("comments.userId", "email")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

export const getSingleBlogController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("authorId", "email")
      .populate("comments.userId", "email");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
};

export const getUserBlogsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const blogs = await Blog.find({ authorId: userId })
      .populate("authorId", "email")
      .populate("comments.userId", "email")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user blogs", error });
  }
};

export const deleteBlogController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.authorId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
};

export const getSavedBlogsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const blogs = await Blog.find({ savedBy: userId })
      .populate("authorId", "email")
      .populate("comments.userId", "email")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved blogs", error });
  }
};

export const likeController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user.userId;
    const isLiked = blog.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (isLiked) {
      blog.likes = blog.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id);
    res.json({
      success: true,
      likesCount: updatedBlog.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const commentController = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Comment required" });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.comments.push({
      userId: req.user.userId,
      message,
    });

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("comments.userId", "email")
      .populate("authorId", "email");

    res.json({ success: true, comments: updatedBlog.comments });
  } catch (error) {
    console.error("Comment Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const unlikeController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user.userId;

    blog.likes = blog.likes.filter((id) => id.toString() !== userId);

    await blog.save();

    res.json({
      message: "Blog unliked",
      likesCount: blog.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Unlike failed", error });
  }
};
export const saveController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user.userId;

    
    if (blog.savedBy.includes(userId)) {
      blog.savedBy.pull(userId);
      await blog.save();
      return res.json({ message: "Blog unsaved" });
    } else {
      blog.savedBy.push(userId);
      await blog.save();
      return res.json({ message: "Blog saved" });
    }
  } catch (error) {
    res.status(500).json({ message: "Save failed", error });
  }
};
export const editBlogController = async (req, res) => {
  try {
    console.log("Edit Blog Route Hit:", req.params.id, req.body);
    const { title, content, thumbnail } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    blog.title = title.trim();
    blog.content = content.trim();
    if (thumbnail !== undefined) {
      blog.thumbnail = thumbnail.trim();
    }

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("authorId", "email")
      .populate("comments.userId", "email");

    res.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error("Edit Blog Error:", error);
    res.status(500).json({ message: "Edit failed", error: error.message });
  }
};

export const editCommentController = async (req, res) => {
  try {
    console.log("Edit Comment Route Hit:", req.params, req.body);
    const { message } = req.body;
    const { id, commentId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Comment message required" });
    }

    if (!commentId) {
      return res.status(400).json({ message: "Comment ID required" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    
    if (comment.userId.toString() !== req.user.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this comment" });
    }

    comment.message = message.trim();
    await blog.save();

    const updatedBlog = await Blog.findById(id)
      .populate("comments.userId", "email")
      .populate("authorId", "email");

    res.json({ success: true, comments: updatedBlog.comments });
  } catch (error) {
    console.error("Edit Comment Error:", error);
    res
      .status(500)
      .json({ message: "Error editing comment", error: error.message });
  }
};

export const deleteCommentController = async (req, res) => {
  try {
    console.log("Delete Comment Route Hit:", req.params);
    const { id, commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ message: "Comment ID required" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    
    const isCommentAuthor =
      comment.userId.toString() === req.user.userId.toString();
    const isBlogAuthor =
      blog.authorId.toString() === req.user.userId.toString();

    if (!isCommentAuthor && !isBlogAuthor) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    blog.comments.pull(commentId);
    await blog.save();

    const updatedBlog = await Blog.findById(id)
      .populate("comments.userId", "email")
      .populate("authorId", "email");

    res.json({ success: true, comments: updatedBlog.comments });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};
