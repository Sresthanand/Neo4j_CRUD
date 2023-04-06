const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createClassRoom = async (req, res) => {
  const { classroomId, capacity, roomType, description, createdAt, updatedAt } =
    req.body;

  const result = await session.run(
    `
          CREATE (c:Classroom {
            id: $classroomId,
            capacity: $capacity,
            roomType: $roomType,
            description: $description,
            createdAt: timestamp(),
            updatedAt: timestamp()
          })
          RETURN c
          `,
    {
      classroomId,
      capacity,
      roomType,
      description,
      createdAt,
      updatedAt,
    }
  );

  if (result.records.length === 0) {
    res.status(500).json({ error: "Failed to create classroom" });
    return;
  }

  const createdClassroom = result.records[0].get("c").properties;
  res.json(createdClassroom);
};


exports.getClassrooms = async (req, res) => {
  const result = await session.run(`
    MATCH (c:Classroom)-[r]-()
    RETURN c, r
  `);

  const classrooms = result.records.map((record) => {
    const classroom = record.get("c").properties;
    const relationship = record.get("r").properties;
    return { ...classroom, ...relationship };
  });

  res.json(classrooms);
};



exports.updateClassroom = async (req, res) => {
  const { classroomId, capacity, roomType, description } = req.body;

  try {
    const result = await session.run(
      `
        MATCH (c:Classroom { id: $classroomId })
        SET c.capacity = $capacity,
            c.roomType = $roomType,
            c.description = $description,
            c.updatedAt = timestamp()
        RETURN c
      `,
      { classroomId, capacity, roomType, description }
    );

    const updatedClassroom = result.records[0].get("c").properties;
    res.json(updatedClassroom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update classroom" });
  }
};



exports.deleteClassroom = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await session.run(
      `
        MATCH (c:Classroom { id: $id })
        OPTIONAL MATCH (c)-[r]-()
        DELETE c, r
        RETURN COUNT(c) as count
      `,
      { id }
    );

    const count = result.records[0].get("count").low;

    if (count === 0) {
      res.status(404).json({ error: `Classroom with ID ${id} not found` });
      return;
    }

    res.json({ message: `Deleted classroom with ID ${id}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete classroom" });
  }
};
