const CustomerModel = require("../../models/customer");
const { redisClient } = require("../../../common/init.redis");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");
const config = require("config");
const TokenModel = require("../../models/token");

const generateAccessToken = async (customer) => {
  // console.log(customer);
  return await jwt.sign(
    { email: customer.email },
    config.get("app.jwtAccessKey"),
    {
      expiresIn: "60s",
    },
  );
};
const generateRefreshToken = async (customer) => {
  return jwt.sign({ email: customer.email }, config.get("app.jwtRefreshKey"), {
    expiresIn: "1h",
  });
};
const setTokenBlackList = async (token) => {
  const decoded = jwtDecode(token);
  console.log(decoded.exp);

  if (decoded.exp > Date.now() / 1000) {
    redisClient.set(token, token, {
      EXAT: decoded.exp,
    });
  }
};

exports.registerCustomer = async (req, res) => {
  try {
    const { body } = req;
    const { email, phone } = body;
    const isEmail = await CustomerModel.findOne({ email });
    if (isEmail)
      return res.status(400).json({
        status: "Fail",
        message: "Email exists!",
      });
    const isPhone = await CustomerModel.findOne({ phone });
    if (isPhone)
      return res.status(400).json({
        status: "Fail",
        message: "Phone exists!",
      });

    const customer = {
      fullName: body.fullName,
      email,
      phone,
      password: body.password,
      address: body.address,
    };
    await CustomerModel(customer).save();
    return res.status(200).json({
      status: "success",
      message: "customer create successfully!",
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json(error);
  }
};
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isEmail = await CustomerModel.findOne({ email });
    // console.log(isEmail);

    if (!isEmail) return res.status(400).json("Email not valid!");
    const isPassword = isEmail.password === password;
    if (!isPassword) return res.status(400).json("Password not valid");
    if (isEmail && isPassword) {
      const accessToken = await generateAccessToken(isEmail);
      const refreshToken = await generateRefreshToken(isEmail);
      const isToken = await TokenModel.findOne({ customer_id: isEmail._id });
      if (isToken) {
        // chuyen vao redis
        setTokenBlackList(isToken.accessToken);
        setTokenBlackList(isToken.refreshToken);
        // xoa token trong db
        await TokenModel.deleteOne({ customer_id: isEmail._id });
      }

      await TokenModel({
        customer_id: isEmail._id,
        accessToken,
        refreshToken,
      }).save();
      // console.log(accessToken);
      res.cookie("refreshToken", refreshToken, { httpOnly: true });
      const { password, ...others } = isEmail._doc;

      return res.status(200).json({
        customer: others,
        accessToken,
      });
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};
exports.logoutCustomer = async (req, res) => {
  try {
    const { accessToken } = req;
    const token = await TokenModel.findOne({ accessToken });
    setTokenBlackList(token.accessToken);
    setTokenBlackList(token.refreshToken);
    await TokenModel.deleteOne({ accessToken });
    return res.status(200).json("logout successfully!");
  } catch (error) {
    return res.status(500).json(error);
  }
};
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json("authentication required!");
    const dirtyToken = await redisClient.get(refreshToken);
    if (dirtyToken) return res.status(401).json("Token expires");
    jwt.verify(
      refreshToken,
      config.get("app.jwtRefreshKey"),
      async (error, decode) => {
        if (error) return res.status(401).json("authentication required!");
        const newAccessToken = await generateAccessToken(decode);
        await TokenModel.updateOne(
          { refreshToken },
          { $set: { accessToken: newAccessToken } },
        );
        return res.status(200).json({
          accessToken: newAccessToken,
        });
      },
    );
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};
