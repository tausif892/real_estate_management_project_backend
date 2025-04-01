const asyncHandler = require("express-async-handler");
const oracledb = require("oracledb");

const createSellerTable = async () => {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password: 'admin',
            connectionString: 'localhost/xepdb1'
        });

        await connection.execute(
            `BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE sellers (
                    name VARCHAR2(20),
                    password VARCHAR2(20),
                    contact_info NUMBER(10) PRIMARY KEY
                )';
            END;`
        );

        console.log(`Seller table created successfully`);
    } catch (error) {
        if (error.message.includes("ORA-00955")) {
            console.log("Table 'sellers' already exists");
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
};


const addSeller = asyncHandler( async (req,res) => {
    let connection;
    const {name, password, contact_info} = req.body;
    try{
        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password: 'admin',
            connectionString: 'localhost/xepdb1'
        });
    
        await connection.execute(
            `INSERT INTO sellers (name, password, contact_info) values (:name, :password, : contact_info)`,
            {name, password, contact_info});
        await connection.commit();
        res.json({message: "Seller inserted successfully"});

    }catch(error){
        res.status(500);
        console.error(error);
    }finally{
        if (connection){
            try{
                await connection.close();
            }catch(error){
                console.error(error);
            }
        }
    }
});

const findSellerByContactInfo = asyncHandler(async (req, res) => {
    let connection;
    const { contact_info } = req.body; // Extract contact_info properly

    try {
        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password: 'admin',
            connectionString: 'localhost/xepdb1'
        });

        const result = await connection.execute(
            `SELECT * FROM sellers WHERE contact_info = :contact_info`, 
            { contact_info: { val: contact_info, type: oracledb.STRING, maxSize: 100 } }, 
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Seller not found" });
        }

        res.status(200).json({ message: "Seller found", seller: result.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error(error);
            }
        }
    }
});

const updateSeller = asyncHandler(async (req, res) => {
    let connection;
    const { name, password, contact_info } = req.body;

    try {
        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password: 'admin',
            connectionString: 'localhost/xepdb1'
        });

        await connection.execute(
            `DELETE FROM sellers WHERE contact_info = :contact_info`,
            { contact_info },
            { autoCommit: false }
        );

        await connection.execute(
            `INSERT INTO sellers (name, password, contact_info) VALUES (:name, :password, :contact_info)`,
            { name, password, contact_info },
            { autoCommit: false }
        );

        await connection.commit();

        res.status(200).json({ message: "Seller updated successfully" });

    } catch (error) {
        console.error(error);
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }
        res.status(500).json({ error: "Internal Server Error" });
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

const deleteSeller = asyncHandler(async (req, res) => {
    let connection;
    const {contact_info} = req.params;
    try{
        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password:'admin',
            connectionString: 'localhost/xepdb1'
        });

        await connection.execute(
            `DELETE FROM sellers WHERE contact_info = :contact_info`, {contact_info}
        );
    await connection.commit();
    res.status(200).json({message: "Seller deleted successfully"});
    }catch(error){
        res.status(500).json({message: error})    
    }finally{
        if (connection){
            try{
                await connection.close();
            }catch(error){
                res.status(500).json({message: "Connection not closed"});
            }
        }
    }
});

const showAll = asyncHandler( async (req,res) => {
    let connection;
    try{
        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password: 'admin',
            connectionString: 'localhost/xepdb1'
        });
    
        await connection.execute(
            `SELECT * from sellers`);
    
            await connection.commit();
            res.status(200).json({message: "Seller found"});

    }catch(error){
        res.status(500);
        console.error(error);
    }finally{
        if (connection){
            try{
                await connection.close();
            }catch(error){
                console.error(error);
            }
        }
    }
});


createSellerTable();

module.exports = {addSeller, deleteSeller, findSellerByContactInfo, updateSeller, showAll};




