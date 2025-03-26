const express = require("express")

const router = express.Router()
const {showProperty, 
    addProperty, 
    findProperty, 
    deleteProperty, 
    updateProperty,
    showPropertyBySeller,
    showPropertyTile} = require("../controller/propertyControllers.cjs");
router.route("/").get(showProperty);
router.route("/create").post(addProperty);
router.route("/find/:id").get(findProperty);
router.route("/update/:id").put(updateProperty);
router.route("/delete/:id").delete(deleteProperty);
router.route("/show_by_seller/:owner_contact").get(showPropertyBySeller);
router.route("/tile").get(showPropertyTile);

module.exports = router;