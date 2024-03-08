// All the imports ##############################################################################

const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
require("dotenv").config();

//  The required functions ##############################################################################

function HASHING(password, saltrounds) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltrounds).then((hash) => {
      resolve(hash);
    });
  });
}

function DEHASHING(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash).then((op) => {
      resolve(op);
    });
  });
}


const secretKey = process.env.USER_ACCESS_TOKEN
function generateAccessToken(id,name,ispremiumUser) {
    return jwt.sign({userId : id , name: name ,premium : ispremiumUser},secretKey)
}

// All the exports ##############################################################################
exports.postNewUser = async (req, res, next) => {
  const new_user = req.body;
  const saltrounds = +process.env.SALTROUNDS;
  const new_pass = await HASHING(new_user.password, saltrounds);
  new_user.password = new_pass;
  User.create(new_user)
    .then((op) => {
      res.json(op);
    })
    .catch((err) => {
      if (err.name === "SequelizeUniqueConstraintError") {
        res.json({ error: "email already registered ! " });
      } else {
        console.log(err);
      }
    });
};

exports.postUserLogin = async (req, res, next) => {
  const obj = req.body;
  const email = obj.email;
  const password = obj.password;
  

  const findings = await User.findAll({ where: { email: email } });

  if (findings.length === 0) {
    res.status(404).json({ error: "User Not Found !" });
  } else {
    const hash = findings[0].password;
    const dehash = await DEHASHING(password, hash);
    // console.log(dehash);

    const token = generateAccessToken(findings[0].id,findings[0].username,findings[0].ispremiumUser)
    if (!dehash) {
      res.status(400).json({ error: "User Not Authorized !" });
    } else {
      res.status(200).json({ success: "User Login Successful !" ,token  : token});
    }
  }
};
