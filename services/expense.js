const Expense = require("../models/expense");

exports.getexpenses = async (where) => {
  try {
    const expenses = await Expense.findAll(where);
    return expenses;
  } catch (err) {
    return err;
  }
};
