const express = require("express");
const router = express.Router();
const subjectController = require("../controller/subjectController");

router.post("/", subjectController.createSubject);

router.get("/subjectGet", subjectController.getSubjects);

router.put("/updateSubject", subjectController.updateSubject);

router.delete("/:id", subjectController.deleteSubject);

module.exports = router;
