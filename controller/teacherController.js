const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createTeacher = async (req, res) => {
  const {
    teacherId,
    teacherCode,
    teacherFullName,
    gender,
    dateOfBirth,
    emailId,
    phoneNumber,
    isActive,
    joiningDate,
    workingDays,
  } = req.body;

  const result = await session.run(
    `
            CREATE (t:Teacher {
              id: $teacherId,
              teacherCode: $teacherCode,
              teacherFullName: $teacherFullName,
              gender: $gender,
              dateOfBirth: $dateOfBirth,
              emailId: $emailId,
              phoneNumber: $phoneNumber,
              isActive: $isActive,
              joiningDate: $joiningDate,
              workingDays: $workingDays,
              updatedAt: timestamp(),
              createdAt: timestamp()
            })
            RETURN t
          `,
    {
      teacherId,
      teacherCode,
      teacherFullName,
      gender,
      dateOfBirth,
      emailId,
      phoneNumber,
      isActive,
      joiningDate,
      workingDays,
    }
  );

  if (result.records.length === 0) {
    res.status(500).json({ error: "Failed to create teacher" });
    return;
  }

  const createdTeacher = result.records[0].get("t").properties;
  res.json(createdTeacher);
};

exports.getTeachers = async (req, res) => {
  try {
    const result = await session.run(`
      MATCH (t:Teacher)-[r]-()
      RETURN t, r
    `);

    const teachers = result.records.map((record) => {
      const teacher = record.get("t").properties;
      const relationship = record.get("r").properties;
      return { ...teacher, ...relationship };
    });

    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
};

exports.updateTeacher = async (req, res) => {
  const {
    teacherId,
    teacherCode,
    teacherFullName,
    gender,
    dateOfBirth,
    emailId,
    phoneNumber,
    isActive,
    joiningDate,
    workingDays,
  } = req.body;

  const result = await session.run(
    `
      MATCH (t:Teacher { id: $teacherId })
      SET t.teacherCode = $teacherCode,
          t.teacherFullName = $teacherFullName,
          t.gender = $gender,
          t.dateOfBirth = $dateOfBirth,
          t.emailId = $emailId,
          t.phoneNumber = $phoneNumber,
          t.isActive = $isActive,
          t.joiningDate = $joiningDate,
          t.workingDays = $workingDays,
          t.updatedAt = timestamp()
      RETURN t
    `,
    {
      teacherId,
      teacherCode,
      teacherFullName,
      gender,
      dateOfBirth,
      emailId,
      phoneNumber,
      isActive,
      joiningDate,
      workingDays,
    }
  );

  if (result.records.length === 0) {
    res.status(404).json({ error: "Teacher not found" });
    return;
  }

  const updatedTeacher = result.records[0].get("t").properties;
  res.json(updatedTeacher);
};

exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;

  const result = await session.run(
    `
      MATCH (t:Teacher { id: $id })
      OPTIONAL MATCH (t)-[r]-()
      DELETE t, r
      RETURN COUNT(t) as count
    `,
    { id }
  );

  const count = result.records[0].get("count").low;

  if (count === 0) {
    res.status(404).json({ error: `Teacher with ID ${id} not found` });
    return;
  }

  res.json({ message: `Deleted teacher with ID ${id}` });
};
