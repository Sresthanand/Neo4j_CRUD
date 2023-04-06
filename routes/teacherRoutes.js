const express = require("express");
const router = express.Router();
const teacherController = require("../controller/teacherController");

router.post("/", teacherController.createTeacher);

router.get("/teacherGet", teacherController.getTeachers);

router.put("/updateTeacher", teacherController.updateTeacher);

router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
