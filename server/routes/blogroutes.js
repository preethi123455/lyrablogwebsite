import express from "express";
import authMiddleware from "../middleware/authmiddleware.js";
import {
  addController,
  getController,
  getSingleBlogController,
  getUserBlogsController,
  deleteBlogController,
  getSavedBlogsController,
  likeController,
  commentController,
  saveController,
  editBlogController,
  editCommentController,
  deleteCommentController,
} from "../controllers/Blogcontroller.js";

const router = express.Router();


router.post("/addblog", authMiddleware, addController);
router.get("/getblog", getController);
router.get("/saved", authMiddleware, getSavedBlogsController);
router.get("/myblogs", authMiddleware, getUserBlogsController);


router.patch("/:id/comments/:commentId", authMiddleware, editCommentController);
router.delete(
  "/:id/comments/:commentId",
  authMiddleware,
  deleteCommentController
);
router.post("/:id/comment", authMiddleware, commentController);
router.patch("/:id/edit", authMiddleware, editBlogController);
router.patch("/:id/like", authMiddleware, likeController);
router.patch("/:id/save", authMiddleware, saveController);


router.delete("/:id", authMiddleware, deleteBlogController);
router.get("/:id", getSingleBlogController);

export default router;
