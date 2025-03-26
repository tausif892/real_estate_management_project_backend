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
router.route("/").post(addProperty);
router.route("/:id").get(findProperty);
router.route("/:id").put(updateProperty);
router.route("/:id").delete(deleteProperty);
router.route("/:contact_info").get(showPropertyBySeller);
router.route("/tile").get(showPropertyTile);

module.exports = router;