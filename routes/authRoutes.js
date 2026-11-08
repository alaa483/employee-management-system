const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// إنشاء حساب جديد: المدير فقط
router.post(
    "/register",
    authenticateToken,
    authorizeRole("admin"),
    authController.register
);
// عرض جميع المستخدمين - المدير فقط
router.get(
    "/users",
    authenticateToken,
    authorizeRole("admin"),
    authController.getAllUsers
);
// تحديث صلاحية مستخدم
router.put(
    "/users/:id/role",
    authenticateToken,
    authorizeRole("admin"),
    authController.updateUserRole
);
// إعادة تعيين كلمة مرور مستخدم
router.put(
    "/users/:id/password",
    authenticateToken,
    authorizeRole("admin"),
    authController.resetUserPassword
);
// تسجيل الدخول: متاح للجميع
router.post(
    "/login",
    authController.login
);

module.exports = router;