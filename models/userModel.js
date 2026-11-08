
const pool = require("../config/db");

// البحث عن مستخدم بواسطة اسم المستخدم
async function findByUsername(username) {

    const [users] = await pool.execute(
        `SELECT
           user_id,
           username,
           password_hash,
           role,
           token_version
         FROM users
         WHERE username = ?`,
        [username]
    );

    return users[0] || null;
}
// البحث عن مستخدم بواسطة رقمه
async function findById(userId) {

    const [users] = await pool.execute(
        `SELECT
    user_id,
    username,
    role,
    token_version
    FROM users
    WHERE user_id = ?`,
        [userId]
    );

    return users[0] || null;
}
// عرض جميع المستخدمين
async function getAllUsers() {

    const [users] = await pool.execute(
        `SELECT
            user_id,
            username,
            role
         FROM users
         ORDER BY user_id`
    );

    return users;
}
// إنشاء مستخدم جديد
async function create(username, passwordHash, role = "user") {

    const [result] = await pool.execute(
        `INSERT INTO users
            (username, password_hash, role)
         VALUES (?, ?, ?)`,
        [username, passwordHash, role]
    );

    return result.insertId;
}
// تحديث كلمة مرور المستخدم
async function updatePassword(userId, passwordHash) {

    await pool.execute(
        `UPDATE users
         SET password_hash = ?
         WHERE user_id = ?`,
        [passwordHash, userId]
    );

}
// زيادة إصدار رموز الدخول للمستخدم
async function updateTokenVersion(userId) {

    await pool.execute(
        `UPDATE users
         SET token_version = token_version + 1
         WHERE user_id = ?`,
        [userId]
    );

}
// تحديث صلاحية المستخدم
async function updateRole(userId, role) {

    await pool.execute(
        `UPDATE users
         SET role = ?
         WHERE user_id = ?`,
        [role, userId]
    );
}
module.exports = {
    findByUsername,
    findById,
    getAllUsers,
    create,
    updatePassword,
    updateTokenVersion,
    updateRole
};
