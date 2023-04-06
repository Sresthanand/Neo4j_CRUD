const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createSchool = async (req, res) => {
  const { schoolId, schoolTitle, levelCount, isActive } = req.body;

  const result = await session.run(
    `
      CREATE (s:School {
        id: $schoolId,
        schoolTitle: $schoolTitle,
        levelCount: $levelCount,
        isActive: $isActive,
        createdAt: timestamp(),
        updatedAt: timestamp()
      })
      RETURN s
    `,
    {
      schoolId,
      schoolTitle,
      levelCount,
      isActive,
    }
  );

  if (result.records.length === 0) {
    res.status(500).json({ error: "Failed to create school" });
    return;
  }

  const createdSchool = result.records[0].get("s").properties;
  res.json(createdSchool);
};

exports.schoolsgetReq = async (req, res) => {
  const result = await session.run(`
    MATCH (s:School)-[r]-()
    RETURN s, r
  `);

  const schools = result.records.map((record) => {
    const school = record.get("s").properties;
    const relationship = record.get("r").properties;
    return { ...school, ...relationship };
  });

  res.json(schools);
};

exports.updateSchool = async (req, res) => {
  const { schoolId, schoolTitle, levelCount, isActive } = req.body;

  const result = await session.run(
    `
      MATCH (s:School { id: $schoolId })
      SET s.schoolTitle = $schoolTitle,
          s.levelCount = $levelCount,
          s.isActive = $isActive,
          s.updatedAt = timestamp()
      RETURN s
    `,
    {
      schoolId,
      schoolTitle,
      levelCount,
      isActive,
    }
  );

  if (result.records.length === 0) {
    res.status(404).json({ error: "School not found" });
    return;
  }

  const updatedSchool = result.records[0].get("s").properties;
  res.json(updatedSchool);
};

exports.deleteSchool = async (req, res) => {
  console.log("hello i am delete api");
  const { id } = req.params;
  console.log(id);

  const result = await session.run(
    `
      MATCH (s:School { id: $id })
      OPTIONAL MATCH (s)-[r]-()
      DELETE s, r
      RETURN COUNT(s) as count
    `,
    { id }
  );

  const count = result.records[0].get("count").low;

  if (count === 0) {
    res.status(404).json({ error: `School with ID ${id} not found` });
    return;
  }

  res.json({ message: `Deleted school with ID ${id}` });
};
