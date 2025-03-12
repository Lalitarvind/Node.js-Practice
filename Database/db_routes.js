const express = require("express");
const db_methods = require("./db_controller.js");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token" });

      req.user = decoded;
      next(); 
  });
};

router.get("/books", authenticateToken, async (req, res) => {
  const books = await db_methods.getBooks();
  res.send(books);
});

module.exports = router;
