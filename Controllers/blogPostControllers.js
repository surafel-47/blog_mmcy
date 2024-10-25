const CategoryModel = require("../Models/CategoryModel.js");
const RoleModel = require("../Models/RoleModel.js");
const UserModel = require("../Models/UserModel.js");
const PostModel = require("../Models/PostModel.js");
const CommentModel = require("../Models/CommentModel.js");
const AuditLogModel = require("../Models/AuditModel.js");
const sanitizeHtml = require("sanitize-html");

/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  ----- Post Related
 *
 *
 *
 *
 *
 ***********************************************************************************************************/
// Controller to get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find(); // Fetch all categories from the db
    res.json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Controller to get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await RoleModel.find(); // Fetch all roles from the datebase
    res.json({ success: true, data: roles });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Create Post Controller
const createPost = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to create a post",
      });
    }

    // Ensure the user is authenticated
    const { id: authorId } = req.user; //(attached by the authMiddleware)

    // Check if the user exists in the database
    const user = await UserModel.findById(authorId).populate("roleId"); // Populate roleId to get full role object
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    // Check if the user's role is allowed to create posts
    if (user.roleId.roleName !== "editor") {
      return res.status(400).json({
        success: false,
        message: "This account type can't create posts",
      });
    }

    // Extract and trim input values
    const { title, content, categoryId } = {
      title: req.body.title?.trim(),
      content: req.body.content?.trim(),
      categoryId: req.body.categoryId?.trim(),
    };

    // Basic validation for required fields
    if (!title || !content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category ID are required",
      });
    }

    // Sanitize the content to prevent XSS attacks
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "code",
        "img",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt"],
      },
    });

    // Create a new post
    const newPost = new PostModel({
      title,
      content: sanitizedContent, // Use the sanitized content
      categoryId,
      authorId,
    });

    // Save the post in the database
    await newPost.save();

    await newPost.populate("categoryId");

    // Log the Post Created event to the audit log
    const auditLogEntry = new AuditLogModel({
      action: "post-created",
      desc: `User Name ${(u = user.username)} - Created: ${newPost.title} Blog`,
      userId: user._id,
      timestamp: new Date(),
    });

    auditLogEntry.save();

    res.json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete Post Controller
const deletePost = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to delete a post",
      });
    }

    // Get the authenticated user's ID
    const { id: userId } = req.user; // Attached by the authMiddleware

    // Check if the user exists in the database
    const user = await UserModel.findById(userId).populate("roleId"); // Populate roleId to get full role object
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Get the post ID from request params
    const { postId } = req.params;

    // Find the post by ID
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user is the author (no editor can delete someone else's post)
    if (post.userId.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You do not have permission to delete this post",
      });
    }

    // Delete the post
    await PostModel.findByIdAndDelete(postId);

    // Delete comments related to the deleted post
    await CommentModel.deleteMany({ postId: postId });

    // Log the Post Deleted event to the audit log
    const auditLogEntry = new AuditLogModel({
      action: "post-deleted",
      desc: `User Name ${(u = user.username)} - Deleted: ${post.title} Blog`,
      userId: user._id,
      timestamp: new Date(),
    });

    auditLogEntry.save();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Edit Post Controller
const editPost = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to edit a post",
      });
    }

    // Ensure the user is authenticated
    const { id: userId } = req.user; // (attached by the authMiddleware)

    // Check if the user exists in the database
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Get the post to be edited
    const postId = req.params.postId;
    const post = await PostModel.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user is the author
    if (post.authorId.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You do not have permission to edit this post",
      });
    }

    // Extract and trim input values
    const { title, content, categoryId } = {
      title: req.body.title?.trim(),
      content: req.body.content?.trim(),
      categoryId: req.body.categoryId?.trim(),
    };

    // Basic validation for required fields
    if (!title || !content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category ID are required",
      });
    }

    // Sanitize the content to prevent XSS attacks
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "code",
        "img",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt"],
      },

    });

    // Update the post
    post.title = title;
    post.content = sanitizedContent;
    post.categoryId = categoryId;
    post.updatedAt = Date.now();

    // Save the updated post
    await post.save();
    await post.populate("categoryId");

    // Log the Post Edited event to the audit log
    const auditLogEntry = new AuditLogModel({
      action: "post-edited",
      desc: `User Name ${(u = user.username)} - Edited: ${post.title} Blog`,
      userId: user._id,
      timestamp: new Date(),
    });

    auditLogEntry.save();
    res.json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Post Blogs List Controller
const getPostBlogsList = async (req, res) => {
  try {
    const {
      sortBy = "createdAt",
      search = "",
      categoryId,
      authorUserName = "",
    } = req.query; // Default sort by date and no search

    // Set sort option based on the query parameter
    let sortOption = {};
    if (sortBy === "viewCount") {
      sortOption = { viewCount: -1 }; // Sort by viewCount
    } else if (sortBy === "category") {
      sortOption = { categoryId: 1 }; // Sort by categoryId
    } else {
      sortOption = { createdAt: -1 }; // Default sort by date
    }

    // Build the search query with optional title and category filtering
    let searchQuery = {};
    if (search) {
      searchQuery.title = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    if (categoryId) {
      searchQuery.categoryId = categoryId; // Filter by categoryId if provided
    }

    // Fetch blogs from the database
    const blogsFetched = await PostModel.find(searchQuery)
      .populate({
        path: "authorId",
        select: "username email", // Only include username and email, exclude passwordHash
      })
      .populate({
        path: "categoryId",
      })
      .sort(sortOption) // Sort by the specified option
      .exec();

    let blogs;

    if (authorUserName) {
      blogs = blogsFetched.filter(
        (blog) =>
          blog.authorId.username.toLowerCase() === authorUserName.toLowerCase()
      );
    } else {
      blogs = blogsFetched;
    }

    const categories = await CategoryModel.find({});

    res.json({
      success: true,
      message: "Blogs fetched successfully",
      blogs,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// View Blog Post Controller
const viewBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Fetch the blog post from the database
    const post = await PostModel.findById(postId)
      .populate({
        path: "authorId",
        select: "username email", // Include username and email
      })
      .populate({
        path: "categoryId",
      });

    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment viewCount of the post
    post.viewCount += 1;
    await post.save(); // Save the updated post back to the database

    // Initialize the response object with the post details
    const response = {
      success: true,
      post,
      favorited: false, // Default to false
      canModify: false, // Default to false
    };

    // Check if the user is logged in
    if (req.user) {
      const userId = req.user.id; // User ID from the request
      const user = await UserModel.findById(userId); // Fetch the user

      // Check if the post is favorited by the user
      response.favorited = user.favorites.includes(postId);

      console.log(post.authorId._id.toString());
      console.log(userId);

      // Check if the user is the author of the post
      if (post.authorId._id == userId) {
        response.canModify = true;
      }

      // Add the post to the user's history if it's not already there
      if (!user.history.includes(postId)) {
        user.history.push(postId); // Add postId to the history array
        await user.save(); // Save the updated user back to the database
      }
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getRoles,
  createPost,
  deletePost,
  editPost,
  getPostBlogsList,
  viewBlogPost,
};
