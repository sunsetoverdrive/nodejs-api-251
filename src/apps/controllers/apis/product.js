const ProductModel = require("../../models/product.js");
const pagination = require("../../../libs/pagination.js");
const CommentModel = require("../../models/comment.js");
exports.index = async (req, res) => {
  try {
    const query = {};
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = page * limit - limit;
    if (req.query.is_featured) query.is_featured = req.query.is_featured;
    if (req.query.is_stock) query.is_stock = req.query.is_stock;
    if (req.query.name) query.$text = { $search: req.query.name };
    const products = await ProductModel.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      status: "success",
      filter: {
        is_featured: req.query.is_featured || null,
        is_stock: req.query.is_stock || null,
        page,
        limit,
      },
      data: {
        docs: products,
        pages: await pagination(page, limit, ProductModel, query),
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
};
exports.show = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    return res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};
exports.comment = async (req, res) => {
  try {
    const { id } = req.params;

    const query = {};
    query.product_id = id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;

    const comments = await CommentModel.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      status: "success",
      filter: {
        page,
        limit,
        product_id: id,
      },
      data: {
        docs: comments,
        pages: await pagination(page, limit, CommentModel, query),
      },
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
exports.storeComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = req.body;
    comment.product_id = id;
    await new CommentModel(comment).save();
    return res.status(200).json({
      status: "success",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
