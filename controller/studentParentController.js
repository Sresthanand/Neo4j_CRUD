const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createStudentParent = async (req, res) => {
  const { student_parentId, studentId, parentId, relationship } = req.body;
  const studentResult = await session.run(
    "MATCH (s:Student { studentId: $studentId }) RETURN s",
    { studentId }
  );
  if (studentResult.records.length === 0) {
    res.status(400).json({ error: "Student not found" });
    return;
  }
  const parentResult = await session.run(
    "MATCH (p:Parent { id: $parentId }) RETURN p",
    { parentId }
  );
  if (parentResult.records.length === 0) {
    res.status(400).json({ error: "Parent not found" });
    return;
  }
  const result = await session.run(
    `
    MATCH (s:Student { studentId: $studentId })
    MATCH (p:Parent { id: $parentId })
    CREATE (s)-[r:HAS_PARENT { student_parentId: $student_parentId, relationship: $relationship, createdAt: timestamp(), updatedAt: timestamp() }]->(p)
    RETURN r
    `,
    { student_parentId, studentId, parentId, relationship }
  );

  const createdStudentParent = result.records[0].get("r").properties;
  res.json(createdStudentParent);
};

exports.getStudentParentRelationships = async (req, res) => {
  try {
    const result = await session.run(
      `
        MATCH (s:Student)-[r:HAS_PARENT]->(p:Parent)
        RETURN s.studentId AS studentId, p.id AS parentId, r.student_parentId AS student_parent_id, r.relationship AS relationship, r.createdAt AS createdAt, r.updatedAt AS updatedAt
      `
    );

    const relationships = result.records.map((record) => ({
      studentId: record.get("studentId").toNumber(),
      parentId: record.get("parentId"),
      student_parent_id: record.get("student_parent_id"),
      relationship: record.get("relationship"),
      createdAt: record.get("createdAt").toNumber(),
      updatedAt: record.get("updatedAt").toNumber(),
    }));

    res.json(relationships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateClassStudentParent = async (req, res) => {
  try {
    const { class_student_id, classId, studentId, parentId } = req.body;

    const result = await session.run(
      `
            MATCH (c:Class)-[r:ENROLLED]->(s:Student)-[p:PARENT]->(p:Parent)
            WHERE c.id = $classId AND s.studentId = $studentId AND p.parentId = $parentId AND r.id = $class_student_id
            RETURN r, p
            `,
      { classId, studentId, parentId, class_student_id }
    );

    const enrolledRelationship = result.records[0]?.get("r");
    const parentRelationship = result.records[0]?.get("p");
    if (!enrolledRelationship || !parentRelationship) {
      return res
        .status(404)
        .json({ error: "Class-Student-Parent relationship not found" });
    }

    const updateResult = await session.run(
      `
            MATCH (c:Class)-[r:ENROLLED]->(s:Student)-[p:PARENT]->(p:Parent)
            WHERE c.id = $classId AND s.studentId = $studentId AND p.parentId = $parentId AND r.id = $class_student_id
            SET r.updatedAt = timestamp(), p.updatedAt = timestamp()
            RETURN r, p
            `,
      { classId, studentId, parentId, class_student_id }
    );

    const updatedEnrolledRelationship = updateResult.records[0]?.get("r");
    const updatedParentRelationship = updateResult.records[0]?.get("p");

    res.json({
      class_student_id,
      classId,
      studentId,
      parentId,
      enrolledUpdatedAt: updatedEnrolledRelationship.properties.updatedAt,
      parentUpdatedAt: updatedParentRelationship.properties.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteStudentParent = async (req, res) => {
  try {
    const { student_parentId } = req.params;

    const result = await session.run(
      `
        MATCH (s:Student)-[r:HAS_PARENT]->(p:Parent)
        WHERE r.student_parentId = $student_parentId
        DELETE r
        RETURN count(r) as nodesDeleted
      `,
      { student_parentId }
    );

    if (result.summary.counters.nodesDeleted() === 0) {
      res
        .status(500)
        .json({ error: "Failed to delete student-parent relationship" });
      return;
    }

    res.json({ message: "Student-parent relationship deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
