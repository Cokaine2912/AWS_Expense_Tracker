const Sequilize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("user", {
  id: {
    type: Sequilize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: { type: Sequilize.STRING, allowNull: false },
  email: {
    type: Sequilize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequilize.STRING,
    allowNull: false,
  },
  ispremiumUser: {
    type: Sequilize.BOOLEAN,
    defaultValue: false,
  },
  totalSpendings: {
    type: Sequilize.FLOAT,
    defaultValue: 0,
  },
});

module.exports = User;
