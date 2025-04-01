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
        
        // Set outFormat to OBJECT to get column names in the result
        const result = await connection.execute(
            `SELECT * FROM property WHERE id = :id`, 
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            return res.status(200).json(result.rows[0]); // Return the first property found
        } else {
            return res.status(404).json({ message: "Property not found" });
        }
    } catch (error) {
        console.error("Error finding property:", error);
        return res.status(500).json({ error: "Error finding property" });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
});


const addProperty = asyncHandler(async (req, res) => {
    const { name, location, price, favorite, owner_name, owner_contact, type, furnishing_status, maintenance, photo_tile, photo_2 } = req.body;

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Convert photo_tile and photo_2 to Buffer if they are base64 strings
        const photoTileBuffer = photo_tile ? Buffer.from(photo_tile, 'base64') : null;
        const photo2Buffer = photo_2 ? Buffer.from(photo_2, 'base64') : null;

        await connection.execute(
            `INSERT INTO property (name, location, price, favorite, owner_name, owner_contact, type, furnishing_status, maintenance, photo_tile, photo_2) 
             VALUES (:name, :location, :price, :favorite, :owner_name, :owner_contact, :type, :furnishing_status, :maintenance, :photo_tile, :photo_2)`,
            {
                name,
                location,
                price,
                favorite,
                owner_name,
                owner_contact,
                type,
                furnishing_status,
                maintenance,
                photo_tile: photoTileBuffer,
                photo_2: photo2Buffer
            },
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
        const result = await connection.execute(`SELECT id, name, location, price, photo_tile FROM property`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving property tiles" });
    } finally {
        if (connection) await connection.close();
    }
});

const createBuySellTable = asyncHandler(async () => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE BuySell (
                    owner_number NUMBER(10),
                    contact_number VARCHAR2(20),
                    id NUMBER,
                    CONSTRAINT fk_owner FOREIGN KEY (owner_number) REFERENCES sellers(contact_info),
                    CONSTRAINT fk_buyer FOREIGN KEY (contact_number) REFERENCES buyers(contact_number),
                    CONSTRAINT fk_property FOREIGN KEY (id) REFERENCES property(id)
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN RAISE;
                    END IF;
            END;`
        );
        console.log(`BuySell table created successfully`);
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.close();
    }
});

const transaction = asyncHandler(async (req, res) => {
    const {id, owner_contact, contact_info_buyer} = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `INSERT INTO BuySell (owner_number, contact_number, id) 
             VALUES (:owner_contact, :contact_info_buyer, :id)`,{owner_contact, contact_info_buyer, id},
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

const showTransaction = asyncHandler(async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `SELECT * FROM BuySell`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } 
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No transactions found" });
        }

        res.status(200).json({ message: "Showing BuySell", transactions: result.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error showing BuySell" });

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error("Error closing connection:", error);
            }
        }
    }
});

createPropertyTable();
createBuySellTable();
module.exports = {
    showProperty,
    addProperty,
    findProperty,
    deleteProperty,
    updateProperty,
    showPropertyBySeller,
    showPropertyTile,
    transaction,
    showTransaction
};

