const express = require("express");
const { addBuyer, findBuyer, deleteBuyer } = require("../controller/buyerController.cjs");

const router = express.Router();

router.route("/").post(addBuyer)
router.route("/login").get(findBuyer)
router.route("/delete").delete(deleteBuyer)

module.exports = router;