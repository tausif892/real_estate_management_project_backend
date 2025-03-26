const asyncHandler = require("express-async-handler");
const oracledb = require("oracledb");
const { use } = require("../routes/propertyRoutes.cjs");

const createBuyerTable = asyncHandler(async (   ) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: "SYSTEM",
            password: "admin",
            connectionString: "localhost/xepdb1",
        });

        await connection.execute(
            `CREATE TABLE buyers (
                contact_number VARCHAR2(10) PRIMARY KEY,
                name VARCHAR2(50) UNIQUE NOT NULL, 
                password VARCHAR2(255) NOT NULL
            )`
        );

        res.status(201).json({ message: "Table 'buyers' created successfully" });
    } catch (error) {
        if (error.errorNum === 955) {
            console.log(`Table 'buyers' already exists` );
        } else {
            console.error("Database error:", error);
        }
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

const addBuyer = asyncHandler(async (req, res) => {
    const {contact_number, name, password } = req.body;
    let connection;
    if (!password){
        res.status(401).json({message: "Password mandatory"});
    }
    try {
        connection = await oracledb.getConnection({
            user: "SYSTEM",
            password: "admin",
            connectionString: "localhost/xepdb1",
        });

        const result = await connection.execute(
            `INSERT INTO buyers (contact_number, name, password) VALUES (:contact_number,:name, :password)`,
            {contact_number,name,password}, 
            { autoCommit: true } 
        );

        res.status(201).json({ message: "Buyer added successfully" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Internal Server Error" });
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


const deleteBuyer = asyncHandler(async (req, res) => {
    const { name, password, contact_number } = req.body;
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: "SYSTEM",
            password: "admin",
            connectionString: "localhost/xepdb1",
        });

        const result = await connection.execute(
            `DELETE FROM buyers WHERE name = :name AND password = :password AND contact_number = :contact_number`,
            { name, password, contact_number },
            { autoCommit: true } 
        );

        if (result.rowsAffected > 0) {
            res.status(200).json({ message: "Buyer deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found or incorrect password" });
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Internal Server Error" });
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

const findBuyer = asyncHandler(async (req, res) => {
    const {contact_number, name, password } = req.body;
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: "SYSTEM",
            password: "admin",
            connectionString: "localhost/xepdb1",
        });

        const result = await connection.execute(
            `SELECT * FROM buyers WHERE name = :name AND password = :password AND contact_number = :contact_number`,
            { name, password, contact_number}, 
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            res.status(200).json({ message: "Buyer found", data: result.rows });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Internal Server Error" });
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
createBuyerTable();

module.exports = {addBuyer, findBuyer, deleteBuyer};