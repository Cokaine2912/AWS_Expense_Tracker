const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/user/signup", userController.postNewUser);

router.post("/user/login",userController.postUserLogin);


// router.post();

module.exports = router;
