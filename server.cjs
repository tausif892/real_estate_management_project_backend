const oracledb = require('oracledb');
const express = require('express');
const app = express();

app.use(express.json());

app.use("/properties", require("./routes/propertyRoutes.cjs"));
app.use("/buyers", require ("./routes/buyerRoutes.cjs"));
app.use("/sellers", require("./routes/sellerRoutes.cjs"));
app.listen(5000, () => {
    console.log(`The listening port is 5000`);
});
