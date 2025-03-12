const { pool } = require("../database.js");
const queries = require("./db_queries.js");
const Joi = require("joi");

async function getBooks() {
  const [rows] = await pool.query("SELECT * FROM books");
  return rows;
}

async function getBookByID(id) {
  try {
    const [rows] = await pool.query(
      `
        SELECT * FROM books WHERE id = ?
        `,
      [id]
    );
    return rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { getBookByID, getBooks };
