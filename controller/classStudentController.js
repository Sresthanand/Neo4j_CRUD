const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createclassStudent = async (req, res) => {
  try {
    const { class_student_id, classId, studentId } = req.body;

    console.log("studentid + " + studentId);

    const classResult = await session.run(
      `
            MATCH (c:Class)
            WHERE c.id = $classId
            RETURN c
            `,
      { classId }
    );
    const classNode = classResult.records[0]?.get("c");
    if (!classNode) {
      return res.status(404).json({ error: "Class not found" });
    }

    const studentResult = await session.run(
      `
    MATCH (s:Student)
    WHERE toString(s.studentId) = $studentId
    RETURN s    
            `,
      { studentId }
    );

    const studentNode = studentResult.records[0]?.get("s");

    console.log(studentNode);

    if (!studentNode) {
      return res.status(404).json({ error: "Student not found" });
    }

    const result = await session.run(
      `
            MATCH (c:Class), (s:Student)
            WHERE c.id = $classId AND s.studentId = $studentId
            CREATE (c)-[r:ENROLLED]->(s)
            SET r.id = $class_student_id
            SET r.createdAt = timestamp()
            RETURN r
            `,
      { classId, studentId, class_student_id }
    );

    const enrolledRelationship = result.records[0]?.get("r");
    if (!enrolledRelationship) {
      return res.status(500).json({ error: "Failed to create relationship" });
    }

    res.json({
      class_student_id,
      classId,
      studentId,
      enrolledAt: enrolledRelationship.properties.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getClassStudentRelationships = async (req, res) => {
  try {
    const result = await session.run(
      `
        MATCH (c:Class)-[r:ENROLLED]->(s:Student)
        RETURN c.id AS classId, s.studentId AS studentId, r.id AS class_student_id, r.createdAt AS enrolledAt
      `
    );

    const relationships = result.records.map((record) => ({
      classId: record.get("classId"),
      studentId: record.get("studentId").toNumber(),
      class_student_id: record.get("class_student_id"),
      enrolledAt: record.get("enrolledAt").toNumber(),
    }));

    res.json(relationships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateClassStudent = async (req, res) => {
  try {
    const { class_student_id, classId, studentId } = req.body;

    const classResult = await session.run(
      `
            MATCH (c:Class)
            WHERE c.id = $classId
            RETURN c
            `,
      { classId }
    );
    const classNode = classResult.records[0]?.get("c");
    if (!classNode) {
      return res.status(404).json({ error: "Class not found" });
    }

    const studentResult = await session.run(
      `
            MATCH (s:Student)
            WHERE toString(s.studentId) = $studentId
            RETURN s
            `,
      { studentId }
    );

    const studentNode = studentResult.records[0]?.get("s");
    if (!studentNode) {
      return res.status(404).json({ error: "Student not found" });
    }

    const result = await session.run(
      `
            MATCH (c:Class)-[r:ENROLLED]->(s:Student)
            WHERE c.id = $classId AND s.studentId = $studentId AND r.id = $class_student_id
            SET r.updatedAt = timestamp()
            RETURN r
            `,
      { classId, studentId, class_student_id }
    );

    const enrolledRelationship = result.records[0]?.get("r");
    if (!enrolledRelationship) {
      return res
        .status(404)
        .json({ error: "Class-Student relationship not found" });
    }

    res.json({
      class_student_id,
      classId,
      studentId,
      updatedAt: enrolledRelationship.properties.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteClassStudent = async (req, res) => {
  try {
    const { class_student_id } = req.params;

    const result = await session.run(
      `
            MATCH (c:Class)-[r:ENROLLED]->(s:Student)
            WHERE r.id = $class_student_id
            DELETE r
            RETURN count(r) as nodesDeleted
            `,
      { class_student_id }
    );

    if (result.summary.counters.nodesDeleted() === 0) {
      res
        .status(500)
        .json({ error: "Failed to delete class-student relationship" });
      return;
    }

    res.json({ message: "Class-student relationship deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
