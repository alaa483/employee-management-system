
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
// استقبال بيانات JSON
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
// تشغيل ملفات الواجهات من مجلد public
app.use(express.static(path.join(__dirname, "public")));

// اختبار سلامة التطبيق
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Employee Management API is running"
    });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "حدث خطأ داخلي في السيرفر."
    });
});

module.exports = app;
