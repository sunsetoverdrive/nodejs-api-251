const pagination = require("../../../libs/pagination");
const CategoryModel = require("../../models/category");
const ProductModel = require("../../models/product");

exports.index = async (req, res) => {
  try {
    const categories = await CategoryModel.find().sort({ _id: -1 });
    return res.status(200).json({
      status: "success",
      data: {
        docs: categories,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
exports.show = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    return res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
exports.categoryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const query = {};
    query.category_id = id;
    console.log(id);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;
    const products = await ProductModel.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    console.log(products);

    return res.status(200).json({
      status: "success",
      filters: {
        page,
        limit,
        category_id: id,
      },
      data: {
        docs: products,
        pages: await pagination(page, limit, ProductModel, query),
      },
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
