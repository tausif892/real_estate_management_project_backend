const express = require("express")

const router = express.Router()
const {showProperty, 
    addProperty, 
    findProperty, 
    deleteProperty, 
    updateProperty,
    showPropertyBySeller,
    showPropertyTile,
    transaction,
    showTransaction} = require("../controller/propertyControllers.cjs");
router.route("/").get(showProperty);
router.route("/create").post(addProperty);
router.route("/find/:id").get(findProperty);
router.route("/update/:id").put(updateProperty);
router.route("/delete/:id").delete(deleteProperty);
router.route("/showbyseller/:owner_contact").get(showPropertyBySeller);
router.route("/tile").get(showPropertyTile);
router.route("/transaction").post(transaction);
router.route("/showtransaction").get(showTransaction)


module.exports = router;