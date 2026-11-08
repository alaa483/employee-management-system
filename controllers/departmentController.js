
const departmentModel = require("../models/departmentModel");

// عرض جميع الأقسام
async function getAllDepartments(req, res, next) {

    try {

        const departments = await departmentModel.findAll();

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });

    } catch (error) {
        next(error);
    }
}


// عرض قسم محدد
async function getDepartmentById(req, res, next) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "رقم القسم غير صحيح."
        });
    }

    try {

        const department = await departmentModel.findById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "القسم غير موجود."
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });

    } catch (error) {
        next(error);
    }
}


// إضافة قسم جديد
async function createDepartment(req, res, next) {

    const { department_name } = req.body || {};

    if (
        typeof department_name !== "string" ||
        !department_name.trim() ||
        department_name.trim().length > 100
    ) {
        return res.status(400).json({
            success: false,
            message: "يرجى إدخال اسم قسم صحيح."
        });
    }

    try {

        const departmentId = await departmentModel.create(
            department_name.trim()
        );

        res.status(201).json({
            success: true,
            message: "تمت إضافة القسم بنجاح.",
            department: {
                department_id: departmentId,
                department_name: department_name.trim()
            }
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "اسم القسم موجود بالفعل."
            });
        }

        next(error);
    }
}


// تعديل اسم القسم
async function updateDepartment(req, res, next) {

    const id = Number(req.params.id);

    const { department_name } = req.body || {};

    if (
        !Number.isInteger(id) ||
        id <= 0 ||
        typeof department_name !== "string" ||
        !department_name.trim() ||
        department_name.trim().length > 100
    ) {
        return res.status(400).json({
            success: false,
            message: "يرجى إدخال بيانات صحيحة."
        });
    }

    try {

        const existingDepartment = await departmentModel.findById(id);

        if (!existingDepartment) {
            return res.status(404).json({
                success: false,
                message: "القسم غير موجود."
            });
        }

        await departmentModel.update(
            id,
            department_name.trim()
        );

        res.status(200).json({
            success: true,
            message: "تم تعديل القسم بنجاح."
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "اسم القسم مستخدم بالفعل."
            });
        }

        next(error);
    }
}


// حذف قسم
async function deleteDepartment(req, res, next) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "رقم القسم غير صحيح."
        });
    }

    try {

        const existingDepartment = await departmentModel.findById(id);

        if (!existingDepartment) {
            return res.status(404).json({
                success: false,
                message: "القسم غير موجود."
            });
        }
        const employeeCount =
            await departmentModel.countEmployeesByDepartment(id);

        if (employeeCount > 0) {
            return res.status(409).json({
                success: false,
                message: `لا يمكن حذف هذا القسم لأنه مرتبط بعدد ${employeeCount} موظفين. يرجى نقل الموظفين إلى قسم آخر أولاً.`
            });
        }
        await departmentModel.remove(id);

        res.status(200).json({
            success: true,
            message: "تم حذف القسم بنجاح."
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
