const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createClass = async (req, res) => {
  const {
    classId,
    className,
    subjectId,
    teacherId,
    classroomId,
    section,
    createdAt,
    updatedAt,
  } = req.body;

  const result = await session.run(
    `
            MATCH (s:Subject {id: $subjectId})
            MATCH (t:Teacher {id: $teacherId})
            MATCH (c:Classroom {id: $classroomId})
            CREATE (cl:Class {
              id: $classId,
              name: $className,
              section: $section,
              createdAt:timestamp() ,
          updatedAt: timestamp()
            })<-[:TEACHES]-(t)-[:TEACHING_SUBJECT]->(s)<-[:HELD_IN]-(cl)-[:CLASSROOM]->(c)
            RETURN cl
          `,
    {
      classId,
      className,
      subjectId,
      teacherId,
      classroomId,
      section,
      createdAt,
      updatedAt,
    }
  );

  if (result.records.length === 0) {
    res.status(500).json({ error: "Failed to create class" });
    return;
  }

  const createdClass = result.records[0].get("cl").properties;
  res.json(createdClass);
};


exports.getAllClasses = async (req, res) => {
  const result = await session.run(`
    MATCH (cl:Class)-[:TEACHES]->(t:Teacher)-[:TEACHING_SUBJECT]->(s:Subject)<-[:HELD_IN]-(cl)-[:CLASSROOM]->(c:Classroom)
    RETURN cl, s, t, c
  `);

  const classes = result.records.map((record) => {
    const cl = record.get("cl").properties;
    const subject = record.get("s").properties;
    const teacher = record.get("t").properties;
    const classroom = record.get("c").properties;
    return { ...cl, subject, teacher, classroom };
  });

  res.json(classes);
};


exports.updateClass = async (req, res) => {
  const { classId , className, subjectId, teacherId, classroomId, section } = req.body;

  const result = await session.run(
    `
            MATCH (s:Subject {id: $subjectId})
            MATCH (t:Teacher {id: $teacherId})
            MATCH (c:Classroom {id: $classroomId})
            MATCH (cl:Class {id: $classId})
            SET cl.name = $className, cl.section = $section, cl.updatedAt = timestamp()
            MERGE (t)-[:TEACHES]->(cl)
            MERGE (s)<-[:HELD_IN]-(cl)
            MERGE (c)<-[:CLASSROOM]-(cl)
            RETURN cl
          `,
    {
      classId,
      className,
      subjectId,
      teacherId,
      classroomId,
      section,
    }
  );

  if (result.records.length === 0) {
    res.status(500).json({ error: "Failed to update class" });
    return;
  }

  const updatedClass = result.records[0].get("cl").properties;
  res.json(updatedClass);
};


exports.deleteClass = async (req, res) => {
  const { classId } = req.params;

  const result = await session.run(
    `
            MATCH (cl:Class {id: $classId})
            DETACH DELETE cl
          `,
    {
      classId,
    }
  );

  if (result.summary.counters.nodesDeleted() === 0) {
    res.status(500).json({ error: "Failed to delete class" });
    return;
  }

  res.json({ message: `Class ${classId} has been deleted` });
};
