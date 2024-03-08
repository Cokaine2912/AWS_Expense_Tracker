const User = require("../models/user");

const userByPk = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  userByPk,
};
