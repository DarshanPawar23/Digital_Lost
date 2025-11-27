// db.js (Updated using mysql2/promise)

const mysql = require("mysql2/promise"); // Use the promise wrapper
require("dotenv").config();

const pool = mysql.createPool({ // Using a pool is better practice
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log("MySQL Connected Successfully!");
        connection.release(); 
    })
    .catch(err => {
        console.error("Database connection failed:", err);
    });

module.exports = pool; 