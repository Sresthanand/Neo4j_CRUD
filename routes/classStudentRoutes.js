const express = require("express");
const router = express.Router();
const classStudentController = require("../controller/classStudentController");

router.post("/", classStudentController.createclassStudent);

router.get(
  "/classStudentGet",
  classStudentController.getClassStudentRelationships
);

router.put("/updateclassStudent", classStudentController.updateClassStudent);

router.delete("/:id", classStudentController.deleteClassStudent);

module.exports = router;
