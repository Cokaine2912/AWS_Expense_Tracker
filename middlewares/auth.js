const jwt = require("jsonwebtoken");
const User = require("../models/user");
const secretKey = "feiofheofgepegje";
const UserServices = require("../services/user");

exports.middleParseToken = async (req, res, next) => {
  const token = req.body.token;
  const obj = jwt.verify(token, secretKey);
  req.body.userId = obj.userId;
  next();
};

exports.middleGetAll = async (req, res, next) => {
  const token = req.headers.authorization;
  const obj = jwt.verify(token, secretKey);
  req.headers.premium = obj.premium;
  req.headers.userId = obj.userId;
  next();
}; // NOT IN USE ANYMORE !!

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const obj = jwt.verify(token, secretKey);
    req.headers.username = obj.name;
    req.headers.premium = obj.premium;
    req.headers.userId = obj.userId;
    User.findByPk(obj.userId)
      .then((op) => {
        req.user = op;
        next();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};

exports.middleAuthenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  const obj = jwt.verify(token, secretKey);
  req.headers.username = obj.name;
  req.headers.premium = obj.premium;
  req.headers.userId = obj.userId;

  const user = await UserServices.userByPk(obj.userId);
  req.user = user;
  next();
}; // NEWONE FOR CLEANING 
