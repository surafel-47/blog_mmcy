const mongoose =require('mongoose');


const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  bannerImgUrl:{ type: String, required: true }, //add this
  content: { type: String, required: true },
  viewCount: { type: Number, default: 0 },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PostModel = mongoose.model("Post", postSchema);

module.exports=PostModel;

