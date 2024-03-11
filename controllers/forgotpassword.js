/// ALL THE IMPORTS ////////////////

const sib = require("sib-api-v3-sdk");
const fs = require("fs");
const { v4: uuidv4, validate: uuidValidate } = require("uuid");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

//// MODELS //////////////////
const Forgot = require("../models/forgot");
const User = require("../models/user");

const client = sib.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;

const tranEmailApi = new sib.TransactionalEmailsApi();

const sender = {
  email: process.env.SENDER_EMAIL,
  name: process.env.SENDER_NAME,
};

function validate(uuid) {
  return uuidValidate(uuid);
}

const redirect = "http://65.0.180.206:5000/password/resetpassword";
async function SendinBlue(receiver) {
  const receivers = [
    {
      email: receiver,
    },
  ];
  try {
    const id = uuidv4();
    op = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Password Reset | Testing SendinBlue | Brevo",
      textContent: `This is just for testing purpose !!`,
      htmlContent: `<h1>PASSWORD RESET LINK</h1>
          <a href="${redirect}/${id}">Click here to reset Paassword<a/>`,
    });

    return id;
  } catch (err) {
    console.log(err);
  }
}

async function HASHING(password, saltrounds) {
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(password, saltrounds)
      .then((hash) => {
        resolve(hash);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

////////// ALL EXPORTS ////////////////////////////////////////

exports.postNewPassword = async (req, res, next) => {
  try {
    const id = await SendinBlue(req.body.email);
    req.body.id = id;
    return res.status(200).json(req.body);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getResetPassword = async (req, res, next) => {
  try {
    const id = req.params.id;

    const forgot = await Forgot.findOne({ where: { id: id } });

    if (forgot && forgot.isactive === true) {
      res.setHeader("Content-Type", "text/html");
      res.write("<html>");
      res.write(`<head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
          padding: 20px;
        }
        h1 {
          color: #333;
        }
        form {
          background-color: #fff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 3px;
        }
        button[type="submit"] {
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
      </style>
    </head>`);
      res.write(`<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="form-action 'self' http://65.0.180.206:5000/password/updatenewpassword;">
    <title>PASSWORD RESET PAGE</title>
    <!-- Other meta tags, stylesheets, scripts, etc. -->
</head>`);
      res.write("<h1>SET NEW PASSWORD</h1>");
      res.write(`<form action="/password/updatenewpassword" method="post">
    <input type="text" name="email" placeholder="email"><br><br>
    <input type="password" name="password" id="password" placeholder="password"><br><br>
    <input type="password" name="confirm" id="confirm" placeholder="confirm password"><br><br>
    <input type="hidden" value=${id} name="id">
    <button type="submit">Submit</button>
  </form>`);
      res.write("</html>");
      res.end();
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getResetLink = async (req, res, next) => {
  try {
    const receiver = req.body.email;

    const user = await User.findOne({ where: { email: receiver } });

    if (!user) {
      return res.json({ error: "Email you entered doesn't exist" });
    }

    const id = await SendinBlue(receiver);

    const forgot = await Forgot.create({
      id: id,
      userId: user.id,
      isactive: true,
    });

    res.status(200).json({ msg: "Link sent to email", id: id });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateNewPassword = async (req, res, next) => {
  try {
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    const confirm = req.body.confirm;
    const id = req.body.id;

    if (password !== confirm) {
      return res.json({ error: "Passwords not matching !" });
    }
    user = await User.findOne({ where: { email: email } });
    forgot = await Forgot.findOne({ where: { id: id } });

    const saltrounds = process.env.SALTROUNDS;
    const new_password = await HASHING(password, saltrounds);
    await user.update({ password: new_password });

    await forgot.update({ isactive: false });
    return res.status(200).json(req.body);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
