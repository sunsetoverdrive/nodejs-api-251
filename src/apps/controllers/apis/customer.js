const CustomerModel = require("../../models/customer");

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const isPhone = await CustomerModel.findOne({ phone: body.phone });

    if (isPhone && isPhone._id.toString() !== id)
      return res.status(400).json("Phone number already exists!");
    const customer = {
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
    };

    await CustomerModel.updateOne({ _id: id }, { $set: customer });
    return res.status(200).json("Update customer successfully!");
  } catch (error) {
    return res.status(500).json(error);
  }
};
