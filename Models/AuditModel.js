const mongoose =require('mongoose');

const Schema = mongoose.Schema;

const auditLogSchema = new Schema({
  action: { type: String, required: true },  // post-created, user-signup
  desc: { type: String},
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
});

const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);

module.exports=AuditLogModel;
