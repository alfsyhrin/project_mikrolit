const mysql = require("mysql2");

const db = mysql.createPool(process.env.MYSQL_URL);

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Database connected successfully");
        connection.release();
    }
});

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

module.exports = db;