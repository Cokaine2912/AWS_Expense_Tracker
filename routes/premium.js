const express = require("express");

const premiumController = require("../controllers/premium");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/purchase/premium",
  authMiddleware.authenticate,
  premiumController.getPurchasePremium
);

router.get(
  "/expense/premiumness",
  authMiddleware.authenticate,
  premiumController.getPremiumness
);

router.post(
  "/purchase/premium/updatetransactionstatus",
  authMiddleware.authenticate,
  premiumController.postUpdateTransactionstatus
);

router.post(
  "/purchase/premium/updateFailure",
  authMiddleware.authenticate,
  premiumController.postUpdateFailure
);

router.get("/premium/leaderboard", premiumController.getLeaderboard);

router.get("/authenticationcheck",authMiddleware.middleAuthenticate,premiumController.getDetails)

module.exports = router;
