const express = require("express");
const { addSeller, updateSeller, deleteSeller, findSellerByContactInfo, showAll } = require("../controller/sellerController.cjs");
const router = express.Router();

router.route("/").post(addSeller);
router.route("/:contact_info").put(updateSeller);
router.route("/:contact_info").delete(deleteSeller);
router.route("/:contact_info").get(findSellerByContactInfo);
router.route("/showAll").get(showAll)

module.exports = router;