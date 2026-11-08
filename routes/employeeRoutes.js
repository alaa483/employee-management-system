
const express = require("express");

const router = express.Router();

const employeeController = require("../controllers/employeeController");

const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// عرض الموظفين: يتطلب تسجيل الدخول
router.get(
    "/",
    authenticateToken,
    employeeController.getAllEmployees
);

// إضافة موظف: جميع المستخدمين المسجلين
router.post(
    "/",
    authenticateToken,
    employeeController.createEmployee
);

// تعديل موظف: المدير فقط
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    employeeController.updateEmployee
);

// حذف موظف: المدير فقط
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    employeeController.deleteEmployee
);

module.exports = router;
