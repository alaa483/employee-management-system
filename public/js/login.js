
// عناصر شاشة تسجيل الدخول
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

// تنفيذ تسجيل الدخول
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "";
    loginButton.disabled = true;
    loginButton.textContent = "جاري تسجيل الدخول...";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "تعذر تسجيل الدخول.");
        }

        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", JSON.stringify(result.user));

        const returnTo = new URLSearchParams(
            window.location.search
        ).get("returnTo");

        const allowedPages = ["/", "/departments.html"];

        const destination = allowedPages.includes(returnTo)
            ? returnTo
            : "/";

        window.location.replace(destination);

    } catch (error) {
        loginMessage.textContent = error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "تسجيل الدخول";
    }
});
