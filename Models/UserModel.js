const mongoose =require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  avatarUrl:{ type: String, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  createdAt: { type: Date, default: Date.now },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Post' }], // Array of favorite post IDs
  history: [{ type: Schema.Types.ObjectId, ref: 'Post' }], // Array of Opened post IDs
  receiveNotifications: { type: Boolean, default: true }, // Default is true to receive notifications
});


const UserModel = mongoose.model("User", userSchema);


module.exports=UserModel;

