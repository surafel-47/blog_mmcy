const PostModel = require("../Models/PostModel.js");
const CommentModel = require("../Models/CommentModel.js");
const sanitizeHtml = require("sanitize-html");

/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  ----- Comment Related Controllers Below
 *
 *
 *
 *
 *
 ***********************************************************************************************************/

// Create Comment Controller
const createComment = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to leave a comment",
      });
    }

    // Ensure the user is authenticated
    const { id: userId } = req.user; // (attached by the authMiddleware)

    // Get the postId from the request parameters
    const postId = req.params.postId;

    // Check if the post exists
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }

    // Extract and trim input values
    const { content } = {
      content: req.body.content?.trim().substring(0, 100), // Max 100 chars Length
    };

    // Basic validation for required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required to leave a comment",
      });
    }

    // Sanitize the content to prevent XSS attacks
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["strong", "em"]),
      allowedAttributes: {},
    });

    // Create a new comment
    const newComment = new CommentModel({
      content: sanitizedContent, // Use the sanitized content
      postId, // Associate the comment with the post
      userId: userId, // Associate the comment with the user
      createdAt: new Date(),
    });

    // Save the comment in the database
    await newComment.save();

    res.json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Edit Comment Controller
const editComment = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to edit a comment",
      });
    }

    const { id: userId } = req.user; // Extract user ID from the request

    // Extract and trim input values
    const { content } = {
      content: req.body.content?.trim().substring(0, 100), // Limit content to 100 characters
    };

    // Basic validation for required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Find the comment by ID
    const comment = await CommentModel.findById(req.params.commentId).populate(
      "postId"
    );

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if the user is the author of the comment or the author of the post
    if (
      comment.userId.toString() !== userId &&
      comment.postId.authorId.toString() !== userId
    ) {
      return res.status(400).json({
        success: false,
        message: "You do not have permission to edit this comment",
      });
    }

    // Update the comment content
    comment.content = content;
    await comment.save();

    res.json({
      success: true,
      message: "Comment edited successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete Comment Controller
const deleteComment = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to delete a comment",
      });
    }

    const { id: userId } = req.user; // Extract user ID from the request

    // Find the comment by ID and populate the postId
    const comment = await CommentModel.findById(req.params.commentId).populate(
      "postId"
    );

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if the user is the author of the comment or the author of the post
    if (
      comment.userId.toString() !== userId &&
      comment.postId.authorId.toString() !== userId
    ) {
      return res.status(400).json({
        success: false,
        message: "You do not have permission to delete this comment",
      });
    }

    // Delete the comment
    await CommentModel.findByIdAndDelete(req.params.commentId);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Comments for a Post Controller
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Fetch all comments for the post
    let comments = await CommentModel.find({ postId })
      .populate({
        path: "userId",
        select: "username", // Only include username in the response
      })
      .sort({ createdAt: -1 }); // Sort comments by creation date (newest first)

    let your_comment = null;

    // Check if the user is logged in
    if (req.user) {
      const userId = req.user.id;

      // Find the comment made by the logged-in user for this post
      your_comment = comments.find(
        (comment) => comment.userId._id.toString() === userId
      );

      // If the user has a comment, remove it from the main comments list
      if (your_comment) {
        comments = comments.filter(
          (comment) => comment.userId._id.toString() !== userId
        );
      }
    }

    res.json({
      success: true,
      message: "Comments fetched successfully",
      comments, // All comments for the post, excluding user's comment
      your_comment, // User's comment or null if not logged in or no comment made
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



module.exports = {
  createComment,
  editComment,
  deleteComment,
  getComments,
};
