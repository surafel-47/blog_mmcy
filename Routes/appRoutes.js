const express = require("express");
const AppRoute = express.Router();

const blogPostController = require("../Controllers/blogPostControllers.js");
const commentController = require("../Controllers/commentControllers.js");
const auditController = require("../Controllers/auditController.js");
const accountController = require("../Controllers/accountController.js");
const authMiddleware = require("../Controllers/authMiddleware.js");
const mongoose = require("mongoose");

const multer = require("multer");
const path = require("path");

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${req.params.id || new mongoose.Types.ObjectId()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix); // Set filename as the ObjectId + file extension
  },
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  User Accout Registration,login, profile Routes Below
 *
 *
 *
 *
 *
 ***********************************************************************************************************/

// Route for registering a Viewer user

AppRoute.post(
  "/registerUser",
  upload.single("avatarImg"),
  accountController.registerUser
);

// Route for registering an Editor user
AppRoute.post("/login", accountController.loginUser);

//To Get User Profile
AppRoute.get("/getUserProfile", authMiddleware, accountController.getUserProfile);

//Turn on and off notifcations
AppRoute.post(
  "/toggleNotifications",
  authMiddleware,
  accountController.toggleNotifications
);

/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  Blog Post Managment Routes Below
 *
 *
 *
 *
 *
 ***********************************************************************************************************/

//To create new post
AppRoute.post(
  "/createPost",
  authMiddleware,
  upload.single("bannerImage"),
  blogPostController.createPost
);

//To Delete a Post
AppRoute.delete("/deletePost/:postId", authMiddleware, blogPostController.deletePost);

//To Edit a Post
AppRoute.patch("/editPost/:postId", authMiddleware, blogPostController.editPost);

//get List of Blogs
AppRoute.get("/blogs", blogPostController.getPostBlogsList);

//get A Blog with Details
AppRoute.get("/viewBlog/:postId", authMiddleware, blogPostController.viewBlogPost);

// Route to get all categories
AppRoute.get("/getCategories", blogPostController.getCategories);

// Route to get all roles
AppRoute.get("/getRoles", blogPostController.getRoles);

/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  Comment Managment Routes Below
 *
 *
 *
 *
 *
 ***********************************************************************************************************/

//To Leave a Comment on a Post
AppRoute.post("/createComment/:postId", authMiddleware, commentController.createComment);

//To Edit a Comment on a Post
AppRoute.patch("/editComment/:commentId", authMiddleware, commentController.editComment);

//To Delete a Comment on a Post
AppRoute.delete(
  "/deleteComment/:commentId",
  authMiddleware,
  commentController.deleteComment
);

//To Get Comments on a Post
AppRoute.get("/getComments/:postId", authMiddleware, commentController.getComments);

/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  Audit Log Routes Below
 *
 *
 *
 *
 *
 ***********************************************************************************************************/
//To GetAudit Logs
AppRoute.get("/getAuditLogs", authMiddleware, auditController.getAuditLogs);

module.exports = AppRoute;
