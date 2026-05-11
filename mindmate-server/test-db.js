const { Client } = require("pg");
require("dotenv").config();

const c = new Client({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || "mindmate",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

c.connect()
  .then(() => {
    console.log("Connected to Postgres OK");
    return c.query("SELECT now() as now");
  })
  .then((r) => {
    console.log("Server time:", r.rows[0].now);
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
  })
  .finally(() => c.end());
