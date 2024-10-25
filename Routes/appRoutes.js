const express = require("express");
const AppRoute = express.Router();

const blogPostController = require("../Controllers/blogPostControllers.js");
const commentController = require("../Controllers/commentControllers.js");
const auditController = require("../Controllers/auditController.js");
const accountController = require("../Controllers/accountController.js");
const authMiddleware = require("../Controllers/authMiddleware.js");



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

AppRoute.post("/registerViewerUser", (req, res) => {
  req.body.roleName = "Viewer"; // Add roleName in the request body
  accountController.registerUser(req, res);
});

// Route for registering an Editor user
AppRoute.post("/registerEditorUser", (req, res) => {
  req.body.roleName = "Editor"; // Add roleName in the request body
  accountController.registerUser(req, res);
});

// Route for registering an Editor user
AppRoute.post("/login", accountController.loginUser);

//To Get User Profile
AppRoute.get("/getUserProfile",authMiddleware,accountController.getUserProfile);

//Turn on and off notifcations
AppRoute.post("/toggleNotifications",authMiddleware,accountController.toggleNotifications);


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
AppRoute.post("/createPost",authMiddleware, blogPostController.createPost);

//To Delete a Post
AppRoute.delete("/deletePost/:postId",authMiddleware,blogPostController.deletePost);

//To Edit a Post
AppRoute.patch("/editPost/:postId",authMiddleware,blogPostController.editPost);


//get List of Blogs
AppRoute.get("/blogs", blogPostController.getPostBlogsList);

//get A Blog with Details
AppRoute.get("/viewBlog/:postId",authMiddleware, blogPostController.viewBlogPost);

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
AppRoute.post("/createComment/:postId",authMiddleware,commentController.createComment);

//To Edit a Comment on a Post
AppRoute.patch("/editComment/:commentId",authMiddleware,commentController.editComment);

//To Delete a Comment on a Post
AppRoute.delete("/deleteComment/:commentId",authMiddleware,commentController.deleteComment);

//To Get Comments on a Post
AppRoute.get("/getComments/:postId",authMiddleware,commentController.getComments);


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
AppRoute.get("/getAuditLogs",authMiddleware,auditController.getAuditLogs);


module.exports = AppRoute;
