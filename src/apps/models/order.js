const mongoose = require("../../common/init.mongodb")();
const orderSchema = new mongoose.Schema(
  {
    totalPrice: {
      type: Number,
      required: true,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Customers",
    },
    status: {
      type: String, // shipping/ delivered/ cancelled
      default: "shipping",
      required: true,
    },
    items: [
      {
        prd_id: {
          type: mongoose.Types.ObjectId,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);
const OrderModel = mongoose.model("Orders", orderSchema, "orders");
module.exports = OrderModel;
