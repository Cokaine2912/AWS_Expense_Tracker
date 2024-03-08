const express = require("express");
const bodyParser = require("body-parser");

const forgotPasswordController = require("../controllers/forgotpassword");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/forgotpassword", forgotPasswordController.postNewPassword);

router.get("/resetpassword/:id", forgotPasswordController.getResetPassword);

router.post("/resetlink", forgotPasswordController.getResetLink);

router.use("/updatenewpassword", bodyParser.urlencoded({ extended: true }));

router.post("/updatenewpassword", forgotPasswordController.updateNewPassword);

module.exports = router;
