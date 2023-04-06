const express = require("express");
const router = express.Router();
const schoolController = require("../controller/schoolController");

router.post("/", schoolController.createSchool);

router.get("/schoolGet", schoolController.schoolsgetReq);

router.put("/updateSchool", schoolController.updateSchool);

router.delete("/:id", schoolController.deleteSchool);

module.exports = router;
