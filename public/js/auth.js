// التحقق من تسجيل الدخول عند فتح صفحات النظام
(function () {

    const token = sessionStorage.getItem("token");

    if (!token) {

        window.location.replace("/login.html");

    }

})();