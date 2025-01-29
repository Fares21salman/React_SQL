const express = require("express");
const sql = require("mssql");
const cors = require("cors"); // Import cors

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: "http://localhost:3001" }));

const dbConfig = {
  user: "sa",
  password: "jasmin@123",
  server: "JIDTP1094",
  database: "Report_Database",
  options: {
    encrypt: true, // Use if required by the database
    trustServerCertificate: true, // For self-signed certs
  },
};

app.get("/executions", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM ExecutionSummary");
    console.log("Result......>>>>>>", result);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error querying the database: ", err);
    res.status(500).send("Error querying the database");
  }
});

app.listen(5004, () => console.log("Server running on port 5000"));
