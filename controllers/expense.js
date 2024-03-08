// All the imports ##############################################################################

const Expense = require("../models/expense");
const User = require("../models/user");
const Download = require("../models/userdownlaod");
const sequelize = require("../util/database");
const ExpenseServices = require("../services/expense");
const DownloadServices = require("../services/download");
const AWS = require("aws-sdk");

//  The required functions ##############################################################################

async function uploadToS3(data, filename) {
  const BUCKET_NAME = "cokaineexpensetracker";
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME,
  });
  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, res) => {
      if (err) {
        console.log("Something went wrong !", err);
        reject(err);
      } else {
        console.log("Success", res);
        resolve(res.Location);
      }
    });
  });
}

// All the exports ##############################################################################

exports.getAllExpenseData = async (req, res, next) => {
  try {
    const userId = req.headers.userId;
    const op = await Expense.findAll({ where: { userId: userId } });
    res.status(200).json(op);
  } catch (err) {
    res.status(500).json({ success: false, err: err });
  }
};

exports.postAddExpense = async (req, res, next) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const userUpdate = User.findOne({
      // Promise 1
      where: { id: req.body.userId },
      transaction,
    });

    const expenseCreate = Expense.create(req.body, { transaction }); // Promise 2

    const [op1, op2] = await Promise.all([userUpdate, expenseCreate]);
    let new_total = op1.totalSpendings + +req.body.amount;
    await op1.update({ totalSpendings: new_total }, { transaction });

    await transaction.commit();
    res.json(op2);
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    console.log(err);
    res
      .status(500)
      .json({ error: "An error occurred while adding the expense." });
  }
};

exports.deleteExpense = async (req, res, next) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const id = req.params.id;
    const todel = await Expense.findByPk(id, { transaction }); // Promise 1
    const user_update = await User.findByPk(todel.userId, { transaction }); // Promise 2

    let new_total = user_update.totalSpendings - todel.amount;

    const updatePromise = user_update.update(
      { totalSpendings: new_total },
      { transaction }
    ); // Promise 3
    const deletePromise = todel.destroy({ transaction }); // Promise 4

    await Promise.all([updatePromise, deletePromise]);
    await transaction.commit();

    res.json({ msg: "Expense Removed !" });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    console.log(err);
  }
};

exports.getDownloadExpense = async (req, res, next) => {
  try {
    const user = req.user;
    const user_expenses = await Expense.findAll({ where: { userId: user.id } });
    const tarik = new Date();
    const stringified = JSON.stringify(user_expenses);
    const filename = `Expense${user.id}/${user.username}_expenses_${tarik}.txt`;
    const fileurl = await uploadToS3(stringified, filename);

    await Download.create({ userId: user.id, fileURL: fileurl });

    res.status(200).json({ file: fileurl, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ fileurl: "", success: false, err: err });
  }
};

exports.getAllDownloads = async (req, res, next) => {
  const page = req.params.page;
  let ipp = req.headers.ipp;
  ipp = +ipp;
  try {
    const id = req.user.id;

    const total_prom = Download.count();
    const all_prom = Download.findAll({
      where: { userId: id },
      offset: ipp * (page - 1),
      limit: ipp,
      order: [["createdAt", "DESC"]],
    });

    const [total, all] = await Promise.all([total_prom, all_prom]);
    const total_pages = Math.ceil(total / ipp);
    
    let next = false;

    if (page < total_pages) {
      next = true;
    }

    let prev = false;

    if (page > 1) {
      prev = true;
    }

    // RESPONSE

    res.status(200).json({
      success: true,
      data: all,
      total: total_pages,
      ipp: ipp,
      current : page,
      next: next,
      prev: prev,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
