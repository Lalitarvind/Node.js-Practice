const express = require("express");
const db_router = require("./Database/db_routes.js");
const auth_router = require("./Authorization/auth_routes.js");
const test_router = require("./Practice/test_routes.js")
const cookieParser = require('cookie-parser')
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors(
    {
        origin: 'http://localhost:4200', 
        credentials: true, 
        allowedHeaders: ['Content-Type', 'Authorization'], 
        methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], 
    }
))
app.use(express.json());
app.use(cookieParser());

app.use("/api", db_router);
app.use("/auth", auth_router);
app.use('/test', test_router)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("server is running on port: %d", process.env.SERVER_PORT);
});
