const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://3.223.191.160:7687",
  neo4j.auth.basic("neo4j", "bytes-foreheads-boil"),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: "neo4j" });

exports.createParent = async (req, res) => {
  try {
    const { parentId, parentCode, parentFullName, email, phone } = req.body;

    const result = await session.run(
      `
            CREATE (p:Parent {
              id: $parentId,
              parentCode: $parentCode,
              parentFullName: $parentFullName,
              email: $email,
              phone: $phone,
              createdAt: timestamp(),
              updatedAt: timestamp()
            })
            RETURN p
            `,
      {
        parentId,
        parentCode,
        parentFullName,
        email,
        phone,
      }
    );

    if (result.records.length === 0) {
      res.status(500).json({ error: "Failed to create parent" });
      return;
    }

    const createdParent = result.records[0].get("p").properties;
    res.json(createdParent);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create parent" });
  }
};

exports.getParents = async (req, res) => {
  try {
    const result = await session.run(`
      MATCH (p:Parent)
      RETURN p
    `);

    const parents = result.records.map((record) => record.get("p").properties);
    res.json(parents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateParent = async (req, res) => {
  const { parentId, parentCode, parentFullName, email, phone } = req.body;

  const result = await session.run(
    `
      MATCH (p:Parent { id: $parentId })
      SET p.parentCode = $parentCode,
          p.parentFullName = $parentFullName,
          p.email = $email,
          p.phone = $phone,
          p.updatedAt = timestamp()
      RETURN p
    `,
    {
      parentId,
      parentCode,
      parentFullName,
      email,
      phone,
    }
  );

  if (result.records.length === 0) {
    res.status(404).json({ error: "Parent not found" });
    return;
  }

  const updatedParent = result.records[0].get("p").properties;
  res.json(updatedParent);
};


exports.deleteParent = async (req, res) => {
  const { id } = req.params;

  const result = await session.run(
    `
      MATCH (p:Parent { id: $id })
      OPTIONAL MATCH (p)-[r]-()
      DELETE p, r
      RETURN COUNT(p) as count
    `,
    { id }
  );

  const count = result.records[0].get("count").low;

  if (count === 0) {
    res.status(404).json({ error: `Parent with ID ${id} not found` });
    return;
  }

  res.json({ message: `Deleted parent with ID ${id}` });
};
