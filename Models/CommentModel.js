const mongoose =require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CommentModel = mongoose.model("Comment", commentSchema);

module.exports=CommentModel;
