const cors = require("cors");
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const sequelize = require("./util/database");
const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
const premiumRoutess = require("./routes/premium");
const forgotRoutes = require("./routes/forgotpassword");

const Expense = require("./models/expense");
const User = require("./models/user");
const Order = require("./models/order");
const Forgot = require("./models/forgot");
const Download = require("./models/userdownlaod");

const app = express();
console.log("Version BETA | ALL NEW BRANCH");
console.log("Cokaine Welcomes You ! ");

app.use(cors());
app.use(helmet());
// app.use(compression());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.json({ extended: true }));

app.use(userRoutes);
app.use("/expense", expenseRoutes);
app.use(premiumRoutess);
app.use("/password", forgotRoutes);

app.use("/public", (req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

app.use((req, res, next) => {
  console.log("URL :", req.url);
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' cdnjs.cloudflare.com cdn.jsdelivr.net checkout.razorpay.com 'unsafe-inline'"
  );
  res.sendFile(path.join(__dirname, `views/${req.url}`));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgot);
Forgot.belongsTo(User);

User.hasMany(Download);
Download.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    app.listen(+process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
