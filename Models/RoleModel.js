const mongoose =require('mongoose');

const Schema = mongoose.Schema;

const roleSchema = new Schema({
  roleName: { type: String, required: true, unique: true },
  description: { type: String },
});

const RoleModel = mongoose.model("Role", roleSchema);

module.exports=RoleModel;
