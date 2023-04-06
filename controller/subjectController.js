const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createSubject = async (req, res) => {
  const { subjectId, subjectTitle, schoolId, stage, term, carryMarks } =
    req.body;
  const createdAt = new Date().getTime();
  const updatedAt = createdAt;

  try {
    const result = await session.run(
      `
        MATCH (s:School { id: $schoolId })
        CREATE (sub:Subject {
          id: $subjectId,
          subjectTitle: $subjectTitle,
          schoolId: $schoolId,
          stage: $stage,
          term: $term,
          carryMarks: $carryMarks,
          createdAt:timestamp() ,
          updatedAt: timestamp()
        })
        CREATE (s)-[:OFFERS]->(sub)
        RETURN sub
        `,
      {
        subjectId,
        subjectTitle,
        schoolId,
        stage,
        term,
        carryMarks,
        createdAt,
        updatedAt,
      }
    );

    const createdSubject = result.records[0].get("sub").properties;
    res.json(createdSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create subject" });
  } finally {
    session.close();
  }
};

exports.getSubjects = async (req, res) => {
  const result = await session.run(`
    MATCH (sub:Subject)-[r]-()
    RETURN sub, r
  `);

  const subjects = result.records.map((record) => {
    const subject = record.get("sub").properties;
    const relationship = record.get("r").properties;
    return { ...subject, ...relationship };
  });

  res.json(subjects);
};

exports.updateSubject = async (req, res) => {
  const { subjectId, subjectTitle, stage, term, carryMarks, isActive } =
    req.body;

  const result = await session.run(
    `
      MATCH (sub:Subject { id: $subjectId })
      SET sub.subjectTitle = $subjectTitle,
          sub.stage = $stage,
          sub.term = $term,
          sub.carryMarks = $carryMarks,
          sub.isActive = $isActive,
          sub.updatedAt = timestamp()
      RETURN sub
    `,
    {
      subjectId,
      subjectTitle,
      stage,
      term,
      carryMarks,
      isActive,
    }
  );

  if (result.records.length === 0) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  const updatedSubject = result.records[0].get("sub").properties;
  res.json(updatedSubject);
};

exports.deleteSubject = async (req, res) => {
  const { id } = req.params;

  const result = await session.run(
    `
      MATCH (sub:Subject { id: $id })
      OPTIONAL MATCH (sub)-[r]-()
      DELETE sub, r
      RETURN COUNT(sub) as count
    `,
    { id }
  );

  const count = result.records[0].get("count").low;

  if (count === 0) {
    res.status(404).json({ error: `Subject with ID ${id} not found` });
    return;
  }

  res.json({ message: `Deleted subject with ID ${id}` });
};
