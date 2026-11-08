
const express = require("express");

const router = express.Router();

const departmentController = require("../controllers/departmentController");

const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// عرض جميع الأقسام: يتطلب تسجيل الدخول
router.get(
    "/",
    authenticateToken,
    departmentController.getAllDepartments
);

// عرض قسم محدد: يتطلب تسجيل الدخول
router.get(
    "/:id",
    authenticateToken,
    departmentController.getDepartmentById
);

// إضافة قسم: يتطلب تسجيل الدخول
router.post(
    "/",
    authenticateToken,
    departmentController.createDepartment
);

// تعديل قسم: المدير فقط
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    departmentController.updateDepartment
);

// حذف قسم: المدير فقط
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    departmentController.deleteDepartment
);

module.exports = router;
