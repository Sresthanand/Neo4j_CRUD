const express = require("express");
const bodyParser = require("body-parser");

const schoolRoutes = require("./routes/schoolRoutes");
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const classRoomRoutes = require("./routes/classRoomRoutes");
const classesRoutes = require("./routes/classesRoutes");
const classStudentRoutes = require("./routes/classStudentRoutes");
const parentRoutes = require("./routes/parentRoutes");
const studentParentRoutes = require("./routes/studentParentRoutes");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the School Management System API" });
});

app.use("/schools", schoolRoutes);
app.use("/students", studentRoutes);
app.use("/subjects", subjectRoutes);
app.use("/teachers", teacherRoutes);
app.use("/classrooms", classRoomRoutes);
app.use("/classes", classesRoutes);
app.use("/classStudents", classStudentRoutes);
app.use("/parents", parentRoutes);
app.use("/studentParent", studentParentRoutes);


process.on("beforeExit", () => {
  session.close();
  driver.close();
});

app.listen(3000, () => {
  console.log("Server listening on port 3000!");
});


