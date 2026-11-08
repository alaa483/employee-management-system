
const mysql = require("mysql2/promise");

// إنشاء اتصال بقاعدة البيانات
const pool = mysql.createPool({

    host: process.env.DB_HOST || "127.0.0.1",

    port: Number(process.env.DB_PORT || 3306),

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME || "company_db",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});

// تصدير الاتصال لاستخدامه في بقية المشروع
module.exports = pool;
