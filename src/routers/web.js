const express = require("express");
const router = express.Router();
const config = require("config");
// import controller
const CategoryController = require("../apps/controllers/apis/category.js");
const OrderController = require("../apps/controllers/apis/order.js");
const ProductController = require("../apps/controllers/apis/product.js");
const AuthController = require("../apps/controllers/apis/auth.js");
const CustomerController = require("../apps/controllers/apis/customer.js");

// Import middleware
const AuthMiddleware = require("../apps/middlewares/auth.js");

// Router
// Category
router.get(`/categories`, CategoryController.index);
router.get(`/categories/:id`, CategoryController.show);
router.get(`/categories/:id/products`, CategoryController.categoryProducts);

// Order
router.get(`/orders/:id`, OrderController.show);
router.patch(`/orders/:id/cancel`, OrderController.cancelled);
router.post(`/order`, OrderController.order);

// Product
router.get(`/products`, ProductController.index);
router.get(`/products/:id`, ProductController.show);
router.get(`/products/:id/comments`, ProductController.comment);
router.post(`/products/:id/comments`, ProductController.storeComments);

// Customer
router.post(`/customer/register`, AuthController.registerCustomer);
router.post(`/customer/login`, AuthController.loginCustomer);
router.post(
  `/customer/logout`,
  AuthMiddleware.verifyAuthenticationCustomer,
  AuthController.logoutCustomer,
);
router.get(`/auth/refresh-token`, AuthController.refreshToken);
router.get(
  `/customer/test`,
  AuthMiddleware.verifyAuthenticationCustomer,
  (req, res) => {
    return res.status(200).json("Pass auth!");
  },
);
router.post(`/customers/:id/update`, CustomerController.update);
router.get(`/customer/:id/orders`, OrderController.index);

module.exports = router;
