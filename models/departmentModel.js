
const pool = require("../config/db");

// عرض جميع الأقسام
async function findAll() {

    const [departments] = await pool.execute(`
        SELECT
            department_id,
            department_name,
            created_at
        FROM departments
        ORDER BY department_id
    `);

    return departments;
}

// البحث عن قسم بواسطة رقمه
async function findById(id) {

    const [departments] = await pool.execute(
        `SELECT department_id, department_name
         FROM departments
         WHERE department_id = ?`,
        [id]
    );

    return departments[0] || null;
}

// حساب عدد الموظفين المرتبطين بالقسم
async function countEmployeesByDepartment(departmentId) {

    const [result] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM employees
         WHERE department_id = ?`,
        [departmentId]
    );

    return result[0].total;
}

// إضافة قسم جديد
async function create(departmentName) {

    const [result] = await pool.execute(
        `INSERT INTO departments (department_name)
         VALUES (?)`,
        [departmentName]
    );

    return result.insertId;
}

// تعديل اسم القسم
async function update(id, departmentName) {

    const [result] = await pool.execute(
        `UPDATE departments
         SET department_name = ?
         WHERE department_id = ?`,
        [departmentName, id]
    );

    return result.affectedRows;
}

// حذف قسم
async function remove(id) {

    const [result] = await pool.execute(
        `DELETE FROM departments
         WHERE department_id = ?`,
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    findAll,
    findById,
    countEmployeesByDepartment,
    create,
    update,
    remove
};
