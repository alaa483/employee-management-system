
// تحميل إعدادات ملف البيئة
require("dotenv").config();

// استدعاء الاتصال بقاعدة البيانات
const pool = require("./config/db");

async function testConnection() {

    let connection;

    try {

        // الحصول على اتصال من MySQL
        connection = await pool.getConnection();

        console.log("تم الاتصال بقاعدة MySQL بنجاح!");

        // التأكد من إصدار MySQL وقاعدة البيانات
        const [version] = await connection.query(`
            SELECT VERSION() AS mysql_version,
                   DATABASE() AS database_name
        `);

        console.table(version);

        // عرض الموظفين من قاعدة البيانات
        const [employees] = await connection.query(`
            SELECT id, name, email, salary
            FROM employees
            ORDER BY id
        `);

        console.log("قائمة الموظفين:");

        console.table(employees);

    } catch (error) {

        console.error("حدث خطأ في الاتصال:", error.message);

        process.exitCode = 1;

    } finally {

        if (connection) {
            connection.release();
        }

        await pool.end();

    }
}

testConnection();
