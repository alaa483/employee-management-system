
const pool = require("../config/db");


// عرض جميع الموظفين مع أسماء الأقسام
async function getAllEmployees(req, res, next) {
    try {

        const [employees] = await pool.query(`
            SELECT
                employees.id,
                employees.name,
                employees.email,
                employees.salary,
                employees.department_id,
                departments.department_name
            FROM employees
            LEFT JOIN departments
                ON employees.department_id = departments.department_id
            ORDER BY employees.id
        `);

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });

    } catch (error) {
        next(error);
    }
}


// إضافة موظف جديد
async function createEmployee(req, res, next) {

    const { name, email, salary, department_id } = req.body;

    // التحقق من البيانات
    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        !email.includes("@") ||
        salary === "" ||
        salary === null ||
        salary === undefined ||
        !Number.isFinite(Number(salary)) ||
        Number(salary) < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "يرجى إدخال بيانات الموظف بصورة صحيحة."
        });
    }

    // التحقق من رقم القسم إذا تم إرساله
    if (
        department_id !== undefined &&
        department_id !== null &&
        (!Number.isInteger(Number(department_id)) ||
            Number(department_id) <= 0)
    ) {
        return res.status(400).json({
            success: false,
            message: "رقم القسم غير صحيح."
        });
    }

    try {

        // التأكد من وجود القسم في قاعدة البيانات
        if (department_id !== undefined && department_id !== null) {

            const [departments] = await pool.execute(
                `SELECT department_id
                 FROM departments
                 WHERE department_id = ?`,
                [Number(department_id)]
            );

            if (departments.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "القسم المحدد غير موجود."
                });
            }
        }

        // إضافة الموظف مع رقم القسم
        const [result] = await pool.execute(
            `INSERT INTO employees
             (name, email, salary, department_id)
             VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                email.trim(),
                Number(salary),
                department_id ? Number(department_id) : null
            ]
        );

        res.status(201).json({
            success: true,
            message: "تمت إضافة الموظف بنجاح.",
            employee: {
                id: result.insertId,
                name: name.trim(),
                email: email.trim(),
                salary: Number(salary),
                department_id: department_id
                    ? Number(department_id)
                    : null
            }
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "البريد الإلكتروني مستخدم بالفعل."
            });
        }

        next(error);
    }
}



async function updateEmployee(req, res, next) {

    const id = Number(req.params.id);

    const { name, email, salary, department_id } = req.body;

    if (
        !Number.isInteger(id) ||
        id <= 0 ||
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        !email.includes("@") ||
        salary === "" ||
        salary === null ||
        salary === undefined ||
        !Number.isFinite(Number(salary)) ||
        Number(salary) < 0 ||
        department_id === "" ||
        department_id === null ||
        department_id === undefined ||
        !Number.isInteger(Number(department_id)) ||
        Number(department_id) <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "يرجى إدخال بيانات الموظف بصورة صحيحة."
        });
    }

    try {

        // التأكد من وجود الموظف
        const [existing] = await pool.execute(
            "SELECT id FROM employees WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "الموظف غير موجود."
            });
        }

        // التأكد من وجود القسم
        const [departments] = await pool.execute(
            "SELECT department_id FROM departments WHERE department_id = ?",
            [Number(department_id)]
        );

        if (departments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "القسم المحدد غير موجود."
            });
        }

        // التأكد من عدم تكرار البريد الإلكتروني
        const [duplicate] = await pool.execute(
            "SELECT id FROM employees WHERE email = ? AND id <> ?",
            [email.trim(), id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "البريد الإلكتروني مستخدم بالفعل."
            });
        }

        // تنفيذ التعديل
        await pool.execute(
            `UPDATE employees
             SET name = ?, email = ?, salary = ?, department_id = ?
             WHERE id = ?`,
            [
                name.trim(),
                email.trim(),
                Number(salary),
                Number(department_id),
                id
            ]
        );

        res.status(200).json({
            success: true,
            message: "تم تعديل بيانات الموظف بنجاح."
        });

    } catch (error) {
        next(error);
    }
}


async function deleteEmployee(req, res, next) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "رقم الموظف غير صحيح."
        });
    }

    try {

        const [result] = await pool.execute(
            "DELETE FROM employees WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "الموظف غير موجود."
            });
        }

        res.status(200).json({
            success: true,
            message: "تم حذف الموظف بنجاح."
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
