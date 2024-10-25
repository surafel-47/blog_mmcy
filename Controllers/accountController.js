const bcrypt = require("bcrypt");
const RoleModel = require("../Models/RoleModel.js");
const UserModel = require("../Models/UserModel.js");
const AuditLogModel = require("../Models/AuditModel.js");
const jwt = require("jsonwebtoken");
const Utils = require("../Utils/Utils.js");

/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  User Registration and login Controllers Below
 *
 *
 *
 *
 *
 ***********************************************************************************************************/

  // Controller to register
  const registerUser = async (req, res) => {
    // Extract and trim input values
    const { username, email, password, roleName } = {
      username: req.body.username?.trim().toLowerCase(),
      email: req.body.email?.trim().toLowerCase(),
      password: req.body.password?.trim().toLowerCase(),
      roleName: req.body.roleName?.trim().toLowerCase(),
    };

    // Basic validation for required fields
    if (!username || !email || !password || !roleName) {
      return res.status(400).json({
        success: false,
        message: "All fields (username, email, password, role) are required",
      });
    }

    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }

      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds of hashing

      // Find the role based on the passed roleName
      const role = await RoleModel.findOne({ roleName });
      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      // Create new user
      const newUser = new UserModel({
        username,
        email,
        passwordHash: hashedPassword,
        roleId: role._id,
      });

      // Save the user in the database
      await newUser.save();

      // Log the registration event to the audit log
      const auditLogEntry = new AuditLogModel({
        action: "registration",
        desc: `User Name ${(u = newUser.username)} - Email: ${
          newUser.email
        } Registered`,
        userId: newUser._id, // Store the ID of the newly registered user
        timestamp: new Date(),
      });

      auditLogEntry.save();

      res
        .status(201)
        .json({ success: true, message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  };

//Login Controller
const loginUser = async (req, res) => {
  // Extract and trim input values
  const { usernameOrEmail, password } = {
    usernameOrEmail: req.body.usernameOrEmail?.trim().toLowerCase(),
    password: req.body.password?.trim(),
  };

  // Basic validation for required fields
  if (!usernameOrEmail || !password) {
    return res.status(400).json({
      success: false,
      message: "Username/email and password are required",
    });
  }

  try {
    // Find the user by either email or username
    const user = await UserModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.roleId },
      process.env.JWT_SECRET,
      {
        expiresIn: Utils.TOKEN_EXPIRATION_TIME,
      }
    );

    // Log the registration event to the audit log
    const auditLogEntry = new AuditLogModel({
      action: "login",
      desc: `User Name ${(u = user.username)} - Email: ${
        user.email
      } Logged In`,
      userId: user._id, 
      timestamp: new Date(),
    });

    auditLogEntry.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Server Internal Error",
    });
  }
};



// Get User Profile Controller
const getUserProfile = async (req, res) => {
  try {
    // Ensure the user is authenticated (attached by authMiddleware)
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id: userId } = req.user; // Get the userId from the token

    // Find the user in the database
    const user = await UserModel.findById(userId).populate("roleId", "roleName");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Send user profile data
    res.json({
      success: true,
      message: "User profile fetched successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const toggleNotifications = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to toggle notifications",
      });
    }

    const userId = req.user.id; 

    // Find the user in the database
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Toggle the receiveNotifications
    user.receiveNotifications = !user.receiveNotifications;

    await user.save();

    res.json({
      success: true,
      message: "Notification preferences updated successfully",
      receiveNotifications: user.receiveNotifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


module.exports = { registerUser, loginUser,getUserProfile,toggleNotifications };
