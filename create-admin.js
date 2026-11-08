require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function createAdmin() {
    try {
        const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        if (!username || !password || password.length < 8) {
            throw new Error("يجب تحديد اسم المدير وكلمة مرور لا تقل عن 8 أحرف.");
        }

        const [admins] = await pool.execute(
            "SELECT user_id FROM users WHERE role = 'admin' LIMIT 1"
        );

        if (admins.length > 0) {
            throw new Error("يوجد حساب مدير بالفعل.");
        }

        const [existingUsers] = await pool.execute(
            "SELECT user_id FROM users WHERE username = ?",
            [username]
        );

        if (existingUsers.length > 0) {
            throw new Error("اسم المستخدم مستخدم بالفعل.");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.execute(
            `INSERT INTO users (username, password_hash, role)
             VALUES (?, ?, 'admin')`,
            [username, passwordHash]
        );

        console.log("تم إنشاء حساب المدير بنجاح.");

    } catch (error) {
        console.error("تعذر إنشاء المدير:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

createAdmin();