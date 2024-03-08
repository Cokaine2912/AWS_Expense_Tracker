const express = require("express");

const expenseController = require("../controllers/expense");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/allexpensedata",
  authMiddleware.middleAuthenticate,
  expenseController.getAllExpenseData
);
router.post(
  "/addexpense",
  authMiddleware.middleParseToken,
  expenseController.postAddExpense
);

router.delete("/deleteexpense/:id", expenseController.deleteExpense);

router.get("/download",authMiddleware.authenticate, expenseController.getDownloadExpense);

router.get("/alldownloads/:page",authMiddleware.middleAuthenticate, expenseController.getAllDownloads);


module.exports = router;
