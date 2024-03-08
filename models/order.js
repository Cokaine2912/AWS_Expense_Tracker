const Sequilize = require("sequelize");

const sequelize = require("../util/database");

const Order = sequelize.define("order", {
  id: {
    type: Sequilize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  paymentId: Sequilize.STRING,
  orderId: Sequilize.STRING,
  status: Sequilize.STRING,
});

module.exports = Order
