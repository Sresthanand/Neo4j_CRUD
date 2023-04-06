const express = require("express");
const router = express.Router();
const classRoomController = require("../controller/classRoomController");

router.post("/", classRoomController.createClassRoom);

router.get("/classRoomGet", classRoomController.getClassrooms);

router.put("/updateclassRoom", classRoomController.updateClassroom);

router.delete("/:id", classRoomController.deleteClassroom);

module.exports = router;
