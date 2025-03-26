const asyncHandler = require("express-async-handler");
const oracledb = require("oracledb");
const dbConfig = {
    user: "SYSTEM",
    password: "admin",
    connectionString: "localhost/xepdb1"
};

const createPropertyTable = asyncHandler(async () => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE property (
                    id NUMBER PRIMARY KEY,
                    name VARCHAR2(20),
                    location VARCHAR2(50),
                    price NUMBER,
                    favorite NUMBER,
                    owner_name VARCHAR2(20),
                    owner_contact VARCHAR2(10),
                    type VARCHAR2(20) CHECK (type IN (''Commercial'', ''Residential'')),
                    furnishing_status VARCHAR2(20) CHECK (furnishing_status IN (''Full'', ''Half'', ''Unfurnished'')),
                    maintenance NUMBER,
                    photo_tile BLOB,
                    photo_2 BLOB
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN RAISE;
                    END IF;
            END;`
        );
        console.log(`Property table created successfully`);
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.close();
    }
});

const showProperty = asyncHandler(async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT * FROM property`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving properties" });
    } finally {
        if (connection) await connection.close();
    }
});

const findProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT * FROM property WHERE id = :id`, { id });
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error finding property" });
    } finally {
        if (connection) await connection.close();
    }
});

const addProperty = asyncHandler(async (req, res) => {
    const { name, location, price, favorite, owner_name, owner_contact, type, furnishing_status, maintenance, photo_tile, photo_2 } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `INSERT INTO property (name, location, price, favorite, owner_name, owner_contact, type, furnishing_status, maintenance, photo_tile, photo_2) 
             VALUES (:name, :location, :price, :favorite, :owner_name, :owner_contact, :type, :furnishing_status, :maintenance, :photo_tile, :photo_2)`,
            { name, location, price, favorite, owner_name, owner_contact, type, furnishing_status, maintenance, photo_tile, photo_2 },
            { autoCommit: true }
        );
        res.status(201).json({ message: "Property added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error adding property" });
    } finally {
        if (connection) await connection.close();
    }
});

const deleteProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`DELETE FROM property WHERE id = :id`, { id }, { autoCommit: true });
        res.json({ message: "Property deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting property" });
    } finally {
        if (connection) await connection.close();
    }
});

const updateProperty = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {name, location, price, favorite, owner_name, owner_contact, type, furnishing_status, maintenance, photo_tile, photo_2 } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `UPDATE property 
            SET name = :name, location = :location, price = :price, favorite = :favorite, owner_name = :owner_name, owner_contact = :owner_contact, type = :type, furnishing_status = :furnishing_status, maintenance = :maintenance, photo_tile = :photo_tile, photo_2 = :photo_2
            WHERE id = :id`,
            { id, name, location, price, favorite, owner_name, owner_contact, type, furnishing_status, maintenance, photo_tile, photo_2 },
            { autoCommit: true }
        );
        res.json({ message: "Property updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating property" });
    } finally {
        if (connection) await connection.close();
    }
});

const showPropertyBySeller = asyncHandler(async (req, res) => {
    const { owner_contact } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT photo_tile, name, location, price FROM property WHERE owner_contact = :owner_contact`,
            { owner_contact }
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving seller's properties" });
    } finally {
        if (connection) await connection.close();
    }
});

const showPropertyTile = asyncHandler(async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT photo_tile, name, location, price FROM property`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving property tiles" });
    } finally {
        if (connection) await connection.close();
    }
});

createPropertyTable();

module.exports = {
    showProperty,
    addProperty,
    findProperty,
    deleteProperty,
    updateProperty,
    showPropertyBySeller,
    showPropertyTile
};

