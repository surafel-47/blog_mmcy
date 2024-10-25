const mongoose =require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  categoryName: { type: String, required: true },
  description: { type: String },
});

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports=CategoryModel;