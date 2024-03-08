const Sequilize = require("sequelize");

const sequelize = require("../util/database");

const Download = sequelize.define("download", {
  id: {
    type: Sequilize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fileURL: Sequilize.STRING,
});

module.exports = Download;
