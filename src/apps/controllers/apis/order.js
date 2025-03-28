const OrderModel = require("../../models/order");
const transporter = require("../../../libs/transporter");
const ejs = require("ejs");
const ProductModel = require("../../models/product");
const CustomerModel = require("../../models/customer");
const pagination = require("../../../libs/pagination");
exports.index = async (req, res) => {
  try {
    const { id } = req.params;
    const query = {};
    query.customerId = id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;
    const orders = await OrderModel.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      status: "success",
      data: {
        docs: orders,
        pages: await pagination(page, limit, OrderModel, query),
      },
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json(error);
  }
};
exports.show = async (req, res) => {
  try {
    const { id } = req.params;
    const orderDetails = await OrderModel.findById(id);
    return res.status(200).json({
      status: "success",
      data: {
        docs: orderDetails,
      },
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json(error);
  }
};
exports.cancelled = async (req, res) => {
  try {
    const { id } = req.params;
    await OrderModel.updateOne({ _id: id }, { $set: { status: "cancelled" } });
    return res.status(200).json({
      status: "success",
      message: "order cancelled successfully!",
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json(error);
  }
};
exports.order = async (req, res) => {
  try {
    const { body } = req;
    const { customerId } = body;
    const { totalPrice } = body;
    const customer = await CustomerModel.findById(customerId);
    const prdIds = body.items.map((item) => item.prd_id);
    const products = await ProductModel.find({
      _id: { $in: prdIds },
    });
    const newItems = body.items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.prd_id);
      return {
        ...item,
        name: product ? product.name : "Unknown Product",
      };
    });
    // const newBody = {
    //   ...body,
    //   items: newItems,
    // };

    // Insert DB
    await new OrderModel(body).save();

    //Send email
    const html = await ejs.renderFile(`${__dirname}/../../view/mail.ejs`, {
      customer,
      totalPrice,
      newItems,
    });
    await transporter.sendMail({
      from: `config.get("mail.auth.user") `, // sender address
      to: customer.email, // list of receivers
      subject: "Xác nhận đơn hàng từ Vietpro Store ✔", // Subject line
      text: "Hello world?", // plain text body
      html, // html body
    });
    return res.status(200).json({
      status: "success",
      message: "Order successfully!",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};
