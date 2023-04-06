const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");

router.post("/", studentController.createStudent);

router.post("/studentsGet", studentController.getAllStudents);

router.post("/updateStudent", studentController.updateStudent);

router.delete("/:id", studentController.deleteStudent);

module.exports = router;
