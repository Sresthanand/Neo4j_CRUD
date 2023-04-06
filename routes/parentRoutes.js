const express = require("express");
const router = express.Router();
const parentController = require("../controller/parentController");

router.post("/", parentController.createParent);

router.get("/parentGet", parentController.getParents);

router.put("/updateParent", parentController.updateParent);

router.delete("/:id", parentController.deleteParent);

module.exports = router;
