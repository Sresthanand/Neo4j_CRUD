const express = require("express");
const router = express.Router();
const classesController = require("../controller/classesController");

router.post("/", classesController.createClass);

router.get("/classesGet", classesController.getAllClasses);

router.put("/updateClass", classesController.updateClass);

router.delete("/:id", classesController.deleteClass);

module.exports = router;
