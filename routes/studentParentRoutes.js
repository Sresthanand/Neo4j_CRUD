const express = require("express");
const router = express.Router();
const studentParenController = require("../controller/studentParentController");

router.post("/", studentParenController.createStudentParent);

router.get(
  "/StudentParentGet",
  studentParenController.getStudentParentRelationships
);

router.put(
  "/updateStudentParent",
  studentParenController.updateClassStudentParent
);

router.delete("/:id", studentParenController.deleteStudentParent);

module.exports = router;
