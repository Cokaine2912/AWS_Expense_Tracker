const Sequilize = require("sequelize");

const sequelize = require("../util/database");

const Forgot = sequelize.define("forgot", {
  id: {
    type: Sequilize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  userId: { type: Sequilize.INTEGER, allowNull: false },
  isactive: {
    type: Sequilize.BOOLEAN,
  },
});

module.exports = Forgot;
