const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createStudent = async (req, res) => {
  const {
    studentId,
    studentCode,
    fullName,
    gender,
    dob,
    email,
    phoneNumber,
    schoolId,
    stage,
    section,
    isActive,
    joiningDate,
  } = req.body;

  const result = await session.run(
    `
      CREATE (s:Student {
        studentId : $studentId,
        studentCode: $studentCode,
        fullName: $fullName,
        gender: $gender,
        dob: $dob,
        email: $email,
        phoneNumber: $phoneNumber,
        stage: $stage,
        section: $section,
        isActive: $isActive,
        joiningDate: $joiningDate
      })
      WITH s
      MATCH (school:School { id: $schoolId })
      CREATE (s)-[:ATTENDS]->(school)
      RETURN s
    `,
    {
      studentId,
      studentCode,
      fullName,
      gender,
      dob,
      email,
      phoneNumber,
      schoolId,
      stage,
      section,
      isActive,
      joiningDate,
    }
  );

  if (result.records.length === 0) {
    res.status(500).json({ error: "Failed to create student" });
    return;
  }

  const createdStudent = result.records[0].get("s").properties;
  res.json(createdStudent);
};

exports.getAllStudents = async (req, res) => {
  const result = await session.run(`
    MATCH (s:Student)-[r]->()
    RETURN s, r
  `);

  const students = result.records.map((record) => {
    const student = record.get("s").properties;
    const relationship = record.get("r").properties;
    return { ...student, ...relationship };
  });

  res.json(students);
};

exports.updateStudent = async (req, res) => {
  const {
    studentId,
    studentCode,
    fullName,
    gender,
    dob,
    email,
    phoneNumber,
    schoolId,
    stage,
    section,
    isActive,
    joiningDate,
  } = req.body;

  const result = await session.run(
    `
      MATCH (s:Student { studentId: $studentId })
      SET s.studentCode = $studentCode,
          s.fullName = $fullName,
          s.gender = $gender,
          s.dob = $dob,
          s.email = $email,
          s.phoneNumber = $phoneNumber,
          s.stage = $stage,
          s.section = $section,
          s.isActive = $isActive,
          s.joiningDate = $joiningDate,
          s.updatedAt = timestamp()
      RETURN s
    `,
    {
      studentId,
      studentCode,
      fullName,
      gender,
      dob,
      email,
      phoneNumber,
      schoolId,
      stage,
      section,
      isActive,
      joiningDate,
    }
  );

  if (result.records.length === 0) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const updatedStudent = result.records[0].get("s").properties;
  res.json(updatedStudent);
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;

  const result = await session.run(
    `
      MATCH (s:Student { studentId: $id })
      OPTIONAL MATCH (s)-[r]-()
      DELETE s, r
      RETURN COUNT(s) as count
    `,
    { id }
  );

  const count = result.records[0].get("count").low;

  if (count === 0) {
    res.status(404).json({ error: `Student with ID ${id} not found` });
    return;
  }

  res.json({ message: `Deleted student with ID ${id}` });
};
