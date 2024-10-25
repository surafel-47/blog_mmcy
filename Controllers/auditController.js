const UserModel = require("../Models/UserModel.js");
const AuditLogModel = require("../Models/AuditModel.js");
/********************************************************************************************************
 *
 *
 *
 *
 *
 *
 *  ----- Audit Related
 *
 *
 *
 *
 *
 ***********************************************************************************************************/

// Get Audit Logs Controller
const getAuditLogs = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Login required to access audit logs",
      });
    }
    const { id: userId } = req.user;

    // Check if the user exists in the database and if they are an editor
    const user = await UserModel.findById(userId).populate("roleId");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (user.roleId.roleName !== "editor") {
      return res.status(403).json({
        success: false,
        message: "Only editors can access audit logs",
      });
    }

    // Extract query parameters for filtering
    const { action = "", date = "" } = req.query;

    // Build the filter query
    const filterQuery = {};

    // Action filter
    if (action) {
      filterQuery.action = { $regex: action, $options: "i" }; // Case-insensitive search
    }

    // Date filter
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // Include the whole day

      filterQuery.timestamp = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Fetch audit logs from the database based on filters
    const auditLogs = await AuditLogModel.find(filterQuery)
      .populate({
        path: "userId",
        select: "username email", // Only include username and email, exclude passwordHash
      })
      .sort({ timestamp: -1 }) // Sort by most recent logs
      .exec();

    res.json({
      success: true,
      message: "Audit logs fetched successfully",
      auditLogs,
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
  getAuditLogs,
};
