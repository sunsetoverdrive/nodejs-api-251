const mongoose = require("../../common/init.mongodb")();
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
const CategoryModel = mongoose.model(
  "Categories",
  categorySchema,
  "categories",
);
module.exports = CategoryModel;
