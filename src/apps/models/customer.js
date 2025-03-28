const mongoose = require("../../common/init.mongodb")();
const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);
const CustomerModel = mongoose.model("Customers", customerSchema, "customers");
module.exports = CustomerModel;
