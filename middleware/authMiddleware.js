
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
// التحقق من تسجيل دخول المستخدم
async function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    // التأكد من وجود رمز الدخول
    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({
            success: false,
            message: "يجب تسجيل الدخول أولاً."
        });

    }

    const token = authHeader.split(" ")[1];

    // التحقق من صحة رمز JWT
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {

        if (error) {

            return res.status(403).json({
                success: false,
                message: "رمز الدخول غير صالح أو انتهت صلاحيته."
            });

        }

        // البحث عن المستخدم في قاعدة البيانات
        userModel.findById(user.userId)
            .then((currentUser) => {

                // التأكد من أن المستخدم لا يزال موجودًا
                if (!currentUser) {
                    return res.status(401).json({
                        success: false,
                        message: "حساب المستخدم غير موجود."
                    });
                }

                // التحقق من إصدار رمز الدخول
                if (user.tokenVersion !== currentUser.token_version) {
                    return res.status(401).json({
                        success: false,
                        message: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى."
                    });
                }

                // تحديث بيانات المستخدم بالصلاحية الحالية
                req.user = {
                    ...user,
                    role: currentUser.role
                };

                next();

            })
            .catch(next);

    });

}


// التحقق من صلاحية المستخدم
function authorizeRole(...allowedRoles) {

    return (req, res, next) => {

        if (!req.user || !allowedRoles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية لتنفيذ هذه العملية."
            });

        }

        next();

    };

}


module.exports = {
    authenticateToken,
    authorizeRole
};
