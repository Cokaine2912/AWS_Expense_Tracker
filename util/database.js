const Sequilize = require("sequelize");
require("dotenv").config();
const sequelize = new Sequilize(process.env.DB_SCHEMA, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
});

module.exports = sequelize;
