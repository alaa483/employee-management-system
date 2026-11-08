
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");

// إنشاء حساب مستخدم جديد
async function register(req, res, next) {

    const { username, password, role } = req.body || {};

    // التحقق من البيانات
    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof password !== "string" ||
        password.length < 8 ||
        typeof role !== "string" ||
        !["admin", "user"].includes(role)
    ) {
        return res.status(400).json({
            success: false,
            message: "البيانات غير صحيحة. تأكد من اسم المستخدم وكلمة المرور والصلاحية."
        });
    }

    try {

        const cleanUsername = username.trim().toLowerCase();

        // التأكد من أن المستخدم غير موجود
        const existingUser = await userModel.findByUsername(
            cleanUsername
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "اسم المستخدم موجود بالفعل."
            });
        }

        // تشفير كلمة المرور
        const passwordHash = await bcrypt.hash(password, 10);

        // إنشاء المستخدم في قاعدة البيانات
        const userId = await userModel.create(
            cleanUsername,
            passwordHash,
            role
        );

        res.status(201).json({
            success: true,
            message: "تم إنشاء الحساب بنجاح.",
            user: {
                id: userId,
                username: cleanUsername,
                role: role
            }
        });

    } catch (error) {

        // معالجة تكرار اسم المستخدم
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "اسم المستخدم موجود بالفعل."
            });
        }

        next(error);
    }
}

// عرض جميع المستخدمين
async function getAllUsers(req, res, next) {

    try {

        const users = await userModel.getAllUsers();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        next(error);
    }
}
// تحديث صلاحية المستخدم
async function updateUserRole(req, res, next) {

    try {

        const userId = Number(req.params.id);
        const { role } = req.body;

        // التحقق من رقم المستخدم
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "رقم المستخدم غير صحيح."
            });
        }

        // التحقق من الصلاحية المطلوبة
        if (!["admin", "user"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "الصلاحية غير صحيحة."
            });
        }
        // منع المستخدم من تغيير صلاحية حسابه بنفسه
        if (Number(req.user.userId) === userId) {

            return res.status(403).json({
                success: false,
                message: "لا يمكنك تغيير صلاحية حسابك بنفسك."
            });

        }
        // جلب جميع المستخدمين
        const users = await userModel.getAllUsers();

        // البحث عن المستخدم المطلوب
        const targetUser = users.find(
            user => Number(user.user_id) === userId
        );

        // التأكد من وجود المستخدم
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود."
            });
        }

        // منع تخفيض صلاحية آخر مدير
        if (targetUser.role === "admin" && role === "user") {

            const adminCount = users.filter(
                user => user.role === "admin"
            ).length;

            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: "لا يمكن تخفيض صلاحية آخر مدير في النظام."
                });
            }
        }
        await userModel.updateRole(userId, role);

        res.status(200).json({
            success: true,
            message: "تم تحديث صلاحية المستخدم بنجاح."
        });

    } catch (error) {
        next(error);
    }
}
// تسجيل دخول المستخدم
async function login(req, res, next) {

    const { username, password } = req.body || {};

    // التحقق من البيانات
    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "اسم المستخدم وكلمة المرور مطلوبان."
        });
    }

    try {

        // البحث عن المستخدم
        const user = await userModel.findByUsername(
            username.trim()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "اسم المستخدم أو كلمة المرور غير صحيحة."
            });
        }

        // مقارنة كلمة المرور
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "اسم المستخدم أو كلمة المرور غير صحيحة."
            });
        }

        // إنشاء رمز JWT
        const token = jwt.sign(
            {
                userId: user.user_id,
                username: user.username,
                role: user.role,
                tokenVersion: user.token_version
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1h"
            }
        );

        res.status(200).json({
            success: true,
            message: "تم تسجيل الدخول بنجاح.",
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                role: user.role,
                tokenVersion: user.token_version
            }
        });

    } catch (error) {

        next(error);
    }
}

// إعادة تعيين كلمة مرور المستخدم
async function resetUserPassword(req, res, next) {

    try {

        const userId = Number(req.params.id);
        const { password } = req.body;

        // التحقق من رقم المستخدم
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "رقم المستخدم غير صحيح."
            });
        }

        // التحقق من كلمة المرور
        if (
            typeof password !== "string" ||
            password.length < 8
        ) {
            return res.status(400).json({
                success: false,
                message: "كلمة المرور يجب ألا تقل عن 8 أحرف."
            });
        }

        // تشفير كلمة المرور
        const passwordHash = await bcrypt.hash(password, 10);

        // تحديث كلمة المرور في قاعدة البيانات
        await userModel.updatePassword(userId, passwordHash);
        await userModel.updateTokenVersion(userId);

        res.status(200).json({
            success: true,
            message: "تم تغيير كلمة المرور بنجاح."
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    register,
    login,
    getAllUsers,
    updateUserRole,
    resetUserPassword
};
