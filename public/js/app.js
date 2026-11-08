
const employeesTable = document.getElementById("employeesTable");

const employeeCount = document.getElementById("employeeCount");

const totalSalaries = document.getElementById("totalSalaries");

const searchInput = document.getElementById("searchInput");

const refreshButton = document.getElementById("refreshButton");

const message = document.getElementById("message");

let employees = [];

// التحقق من صلاحية المستخدم الحالي
function isAdminUser() {

    try {

        const user = JSON.parse(
            sessionStorage.getItem("user") || "null"
        );

        return user?.role === "admin";

    } catch (error) {

        return false;

    }

}
// إظهار الإعدادات للمدير فقط
const settingsNavButton = document.getElementById("settingsNavButton");

if (settingsNavButton) {
    settingsNavButton.hidden = !isAdminUser();
}
// تحديد زر إضافة موظف

const addEmployeeButton = document.getElementById("addEmployeeButton"
);

// إظهار زر إضافة موظف لجميع المستخدمين
if (addEmployeeButton) {
    addEmployeeButton.hidden = false;
}

// تنسيق الأرقام المالية
const salaryFormatter = new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR"
});

// تحميل الموظفين من API
async function loadEmployees() {

    employeesTable.innerHTML = `
        <tr>
            <td colspan="5">جاري تحميل الموظفين...</td>
        </tr>
    `;

    message.textContent = "";

    try {

        const token = sessionStorage.getItem("token");

        if (!token) {
            window.location.replace("/login.html");
            return;
        }

        const response = await fetch("/api/employees", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // إذا انتهت صلاحية الرمز أو أصبح غير صالح
        if (response.status === 401 || response.status === 403) {

            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            window.location.replace("/login.html");
            return;
        }

        if (!response.ok) {
            throw new Error("تعذر تحميل بيانات الموظفين.");
        }

        const result = await response.json();

        employees = result.data;

        displayEmployees(employees);

        updateStatistics(employees);

        message.textContent =
            `تم تحميل ${employees.length} موظف بنجاح.`;

    } catch (error) {

        employeesTable.innerHTML = `
            <tr>
                <td colspan="5">حدث خطأ أثناء تحميل البيانات.</td>
            </tr>
        `;

        message.textContent = error.message;
    }
}

// عرض الموظفين داخل الجدول

function displayEmployees(data) {

    employeesTable.replaceChildren();

    if (data.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "لا توجد بيانات موظفين.";

        row.appendChild(cell);
        employeesTable.appendChild(row);

        return;
    }

    data.forEach(employee => {

        const row = document.createElement("tr");

        const values = [
            employee.id,
            employee.name,
            employee.email,
            salaryFormatter.format(Number(employee.salary)),
            employee.department_name || "غير محدد"
        ];

        values.forEach(value => {

            const cell = document.createElement("td");
            cell.textContent = value;

            row.appendChild(cell);

        });

        // إنشاء عمود الإجراءات
        const actionsCell = document.createElement("td");

        // إظهار أزرار الإدارة للمدير فقط
        if (isAdminUser()) {

            // زر تعديل الموظف
            const editButton = document.createElement("button");

            editButton.textContent = "تعديل";
            editButton.className = "edit-button";

            editButton.addEventListener("click", () => {
                openEditModal(employee);
            });

            // زر حذف الموظف
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "حذف";
            deleteButton.className = "delete-button";

            deleteButton.addEventListener("click", () => {
                deleteEmployeeFromScreen(employee.id);
            });

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);

        } else {

            actionsCell.textContent = "عرض فقط";

        }

        row.appendChild(actionsCell);

        employeesTable.appendChild(row);


    });

}

// تحديث الإحصائيات
function updateStatistics(data) {

    employeeCount.textContent = data.length;

    const total = data.reduce(
        (sum, employee) => sum + Number(employee.salary),
        0
    );

    totalSalaries.textContent =
        salaryFormatter.format(total);
}

// البحث عن الموظفين
searchInput.addEventListener("input", () => {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const filteredEmployees = employees.filter(employee => {

        return (
            employee.name.toLowerCase().includes(searchValue) ||
            employee.email.toLowerCase().includes(searchValue) ||
            String(employee.id).includes(searchValue)
        );

    });

    displayEmployees(filteredEmployees);
});

// إعادة تحميل البيانات
refreshButton.addEventListener("click", loadEmployees);

// تحميل البيانات عند فتح الشاشة
loadEmployees();

// عناصر نافذة إضافة الموظف
const employeeModal = document.getElementById("employeeModal");

const closeModalButton = document.getElementById("closeModalButton");

const cancelButton = document.getElementById("cancelButton");

const employeeForm = document.getElementById("employeeForm");

const formMessage = document.getElementById("formMessage");

const saveButton = employeeForm.querySelector(
    'button[type="submit"]'
);

// فتح نافذة إضافة الموظف
addEmployeeButton.addEventListener("click", () => {

    employeeForm.reset();

    formMessage.textContent = "";

    employeeModal.classList.add("show");

});

// إغلاق النافذة
function closeEmployeeModal() {

    employeeModal.classList.remove("show");

    employeeForm.reset();

    formMessage.textContent = "";

}

closeModalButton.addEventListener(
    "click",
    closeEmployeeModal
);

cancelButton.addEventListener(
    "click",
    closeEmployeeModal
);

// إغلاق النافذة عند الضغط خارجها
employeeModal.addEventListener("click", (event) => {

    if (event.target === employeeModal) {
        closeEmployeeModal();
    }

});

// حفظ موظف جديد في MySQL
employeeForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document
        .getElementById("employeeName")
        .value.trim();

    const email = document
        .getElementById("employeeEmail")
        .value.trim();

    const salary = Number(
        document.getElementById("employeeSalary").value
    );

    if (!name || !email || !Number.isFinite(salary) || salary < 0) {

        formMessage.textContent = "يرجى إدخال جميع البيانات بصورة صحيحة.";

        return;
    }

    saveButton.disabled = true;

    saveButton.textContent = "جاري الحفظ...";

    formMessage.textContent = "";

    try {

        const response = await fetch("/api/employees", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            },

            body: JSON.stringify({
                name,
                email,
                salary
            })

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "حدث خطأ أثناء إضافة الموظف."
            );
        }

        alert("تمت إضافة الموظف بنجاح!");

        closeEmployeeModal();

        // إعادة تحميل الموظفين من قاعدة البيانات
        await loadEmployees();

    } catch (error) {

        formMessage.textContent = error.message;

    } finally {

        saveButton.disabled = false;

        saveButton.textContent = "حفظ الموظف";

    }

});

// عناصر نافذة التعديل
const editEmployeeModal = document.getElementById(
    "editEmployeeModal"
);

const editEmployeeForm = document.getElementById(
    "editEmployeeForm"
);

const editFormMessage = document.getElementById(
    "editFormMessage"
);

const closeEditModalButton = document.getElementById(
    "closeEditModalButton"
);

const cancelEditButton = document.getElementById(
    "cancelEditButton"
);

// زر حفظ التعديلات
const editSaveButton = editEmployeeForm.querySelector(
    'button[type="submit"]'
);


// فتح نافذة التعديل وتعبئة بيانات الموظف
function openEditModal(employee) {

    document.getElementById("editEmployeeId").value =
        employee.id;

    document.getElementById("editEmployeeName").value =
        employee.name;

    document.getElementById("editEmployeeEmail").value =
        employee.email;

    document.getElementById("editEmployeeSalary").value =
        employee.salary;
    document.getElementById("editEmployeeDepartment").value =
        employee.department_id || "";
    editFormMessage.textContent = "";

    editEmployeeModal.classList.add("show");

}


// إغلاق نافذة التعديل
function closeEditModal() {

    editEmployeeModal.classList.remove("show");

    editEmployeeForm.reset();

    editFormMessage.textContent = "";

}


// ربط أزرار الإغلاق
closeEditModalButton.addEventListener(
    "click",
    closeEditModal
);

cancelEditButton.addEventListener(
    "click",
    closeEditModal
);


// إغلاق النافذة عند الضغط خارجها
editEmployeeModal.addEventListener("click", (event) => {

    if (event.target === editEmployeeModal) {
        closeEditModal();
    }

});


// حفظ التعديلات في قاعدة MySQL
editEmployeeForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const id = document.getElementById(
        "editEmployeeId"
    ).value;

    const name = document.getElementById(
        "editEmployeeName"
    ).value.trim();

    const email = document.getElementById(
        "editEmployeeEmail"
    ).value.trim();

    const salary = Number(
        document.getElementById("editEmployeeSalary").value
    );
    const department_id = document.getElementById(
        "editEmployeeDepartment"
    ).value;
    if (
        !name ||
        !email ||
        !email.includes("@") ||
        !Number.isFinite(salary) ||
        salary < 0 ||
        !department_id ||
        !Number.isInteger(Number(department_id)) ||
        Number(department_id) <= 0
    ) {

        editFormMessage.textContent =
            "يرجى إدخال البيانات بصورة صحيحة.";

        return;
    }

    editSaveButton.disabled = true;

    editSaveButton.textContent = "جاري الحفظ...";

    editFormMessage.textContent = "";

    try {

        const response = await fetch(
            `/api/employees/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },

                body: JSON.stringify({
                    name,
                    email,
                    salary,
                    department_id: Number(department_id)
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "تعذر تعديل بيانات الموظف."
            );
        }

        alert("تم تعديل بيانات الموظف بنجاح!");

        closeEditModal();

        // تحميل البيانات الجديدة من MySQL
        await loadEmployees();

    } catch (error) {

        editFormMessage.textContent = error.message;

    } finally {

        editSaveButton.disabled = false;

        editSaveButton.textContent = "حفظ التعديلات";

    }

});


async function deleteEmployeeFromScreen(id) {

    // التأكد من رغبة المستخدم في الحذف
    const confirmed = confirm(
        "هل أنت متأكد من حذف هذا الموظف؟"
    );

    if (!confirmed) {
        return;
    }

    // التأكد من وجود رمز تسجيل الدخول
    const token = sessionStorage.getItem("token");

    if (!token) {
        window.location.replace("/login.html");
        return;
    }

    try {

        // إرسال طلب الحذف مع رمز JWT
        const response = await fetch(
            `/api/employees/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        // إذا انتهت صلاحية تسجيل الدخول
        if (response.status === 401) {

            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            window.location.replace("/login.html");
            return;
        }

        // إذا لم يمتلك المستخدم صلاحية الحذف
        if (response.status === 403) {
            throw new Error(
                result.message || "ليس لديك صلاحية حذف الموظفين."
            );
        }

        if (!response.ok) {
            throw new Error(
                result.message || "تعذر حذف الموظف."
            );
        }

        alert("تم حذف الموظف بنجاح!");

        // تحديث الجدول والإحصائيات
        await loadEmployees();

    } catch (error) {

        alert(error.message);

    }
}



async function loadDepartmentsForEmployee() {

    const departmentSelect =
        document.getElementById("employeeDepartment");

    const editDepartmentSelect =
        document.getElementById("editEmployeeDepartment");

    const token = sessionStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch("/api/departments", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("تعذر تحميل الأقسام.");
        }

        const result = await response.json();

        const departmentLists = [
            departmentSelect,
            editDepartmentSelect
        ];

        departmentLists.forEach(select => {

            if (!select) return;

            select.innerHTML =
                '<option value="">اختر القسم</option>';

            result.data.forEach(department => {

                const option = document.createElement("option");

                option.value = department.department_id;
                option.textContent = department.department_name;

                select.appendChild(option);

            });

        });

        console.log("تم تحميل الأقسام بنجاح.");

    } catch (error) {

        console.error("خطأ تحميل الأقسام:", error);

    }
}
loadDepartmentsForEmployee();
// تسجيل الخروج من النظام
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", () => {

        // حذف بيانات تسجيل الدخول
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // العودة إلى صفحة تسجيل الدخول
        window.location.replace("/login.html");

    });

}



function showPage(page) {

    // إخفاء جميع الشاشات
    dashboardSection.hidden = true;
    employeesSection.hidden = true;
    departmentsSection.hidden = true;
    settingsSection.hidden = true;

    // إزالة التحديد من جميع عناصر القائمة
    dashboardNavButton.classList.remove("active");
    employeesNavButton.classList.remove("active");
    departmentsNavButton.classList.remove("active");

    if (settingsNavButton) {
        settingsNavButton.classList.remove("active");
    }

    // إظهار الشاشة المطلوبة
    if (page === "dashboard") {

        dashboardSection.hidden = false;
        dashboardNavButton.classList.add("active");

    }

    else if (page === "employees") {

        employeesSection.hidden = false;
        employeesNavButton.classList.add("active");

    }

    else if (page === "departments") {

        departmentsSection.hidden = false;
        departmentsNavButton.classList.add("active");

    }

    else if (page === "settings") {

        if (!isAdminUser()) {
            alert("ليس لديك صلاحية الوصول إلى الإعدادات.");
            return;
        }

        settingsSection.hidden = false;
        settingsNavButton.classList.add("active");

        // تحميل قائمة المستخدمين
        loadUsers();
    }
}


// الضغط على الرئيسية
dashboardNavButton.addEventListener("click", () => {
    showPage("dashboard");
});

// الضغط على الموظفين
employeesNavButton.addEventListener("click", () => {
    showPage("employees");
});

// الضغط على الأقسام
departmentsNavButton.addEventListener("click", () => {
    showPage("departments");
});
// الضغط على الإعدادات
if (settingsNavButton) {
    settingsNavButton.addEventListener("click", () => {
        showPage("settings");
    });
}


// تحميل قائمة المستخدمين
async function loadUsers() {

    const usersTableBody = document.getElementById("usersTableBody");

    usersTableBody.innerHTML = `
        <tr>
            <td colspan="4">جاري تحميل المستخدمين...</td>
        </tr>
    `;

    try {

        const response = await fetch("/api/auth/users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "تعذر تحميل المستخدمين.");
        }

        usersTableBody.innerHTML = "";

        result.data.forEach(user => {

            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = user.user_id;

            const usernameCell = document.createElement("td");
            usernameCell.textContent = user.username;

            const roleCell = document.createElement("td");
            roleCell.textContent =
                user.role === "admin" ? "مدير النظام" : "مستخدم عادي";

            const actionsCell = document.createElement("td");

            // زر تغيير الصلاحية
            const changeRoleButton = document.createElement("button");

            changeRoleButton.textContent =
                user.role === "admin"
                    ? "تحويل إلى مستخدم عادي"
                    : "تحويل إلى مدير";

            changeRoleButton.addEventListener("click", () => {
                changeUserRole(
                    user.user_id,
                    user.role === "admin" ? "user" : "admin"
                );
            });

            // زر تغيير كلمة المرور
            const changePasswordButton = document.createElement("button");

            changePasswordButton.textContent = "تغيير كلمة المرور";

            changePasswordButton.addEventListener("click", () => {
                resetUserPassword(user.user_id, user.username);
            });

            actionsCell.appendChild(changeRoleButton);
            actionsCell.appendChild(changePasswordButton);

            row.appendChild(idCell);
            row.appendChild(usernameCell);
            row.appendChild(roleCell);
            row.appendChild(actionsCell);

            usersTableBody.appendChild(row);
        });

        if (result.data.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="4">لا يوجد مستخدمون مسجلون.</td>
                </tr>
            `;
        }

    } catch (error) {

        usersTableBody.innerHTML = `
            <tr>
                <td colspan="4">${error.message}</td>
            </tr>
        `;
    }
}

// تغيير صلاحية المستخدم
async function changeUserRole(userId, newRole) {

    const confirmation = confirm(
        `هل تريد تغيير صلاحية هذا المستخدم إلى ${newRole === "admin" ? "مدير النظام" : "مستخدم عادي"
        }؟`
    );

    if (!confirmation) {
        return;
    }

    try {

        const response = await fetch(`/api/auth/users/${userId}/role`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            },

            body: JSON.stringify({
                role: newRole
            })

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "تعذر تغيير صلاحية المستخدم."
            );
        }

        alert("تم تغيير صلاحية المستخدم بنجاح.");

        loadUsers();

    } catch (error) {

        alert(error.message);

    }
}

// إعادة تعيين كلمة مرور المستخدم
async function resetUserPassword(userId, username) {

    const newPassword = prompt(
        `أدخل كلمة المرور الجديدة للمستخدم: ${username}`
    );

    // إلغاء العملية إذا ضغط المدير على إلغاء
    if (newPassword === null) {
        return;
    }

    // التحقق من طول كلمة المرور
    if (newPassword.length < 8) {
        alert("كلمة المرور يجب ألا تقل عن 8 أحرف.");
        return;
    }

    const confirmation = confirm(
        `هل تريد تغيير كلمة مرور المستخدم ${username}؟`
    );

    if (!confirmation) {
        return;
    }

    try {

        const response = await fetch(
            `/api/auth/users/${userId}/password`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },

                body: JSON.stringify({
                    password: newPassword
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "تعذر تغيير كلمة المرور."
            );
        }

        alert("تم تغيير كلمة المرور بنجاح.");

    } catch (error) {

        alert(error.message);

    }
}

// عناصر نموذج إنشاء مستخدم جديد
const userForm = document.getElementById("userForm");

const newUsername = document.getElementById("newUsername");

const newPassword = document.getElementById("newPassword");

const newUserRole = document.getElementById("newUserRole");

const userFormMessage = document.getElementById("userFormMessage");

const createUserButton = document.getElementById("createUserButton");
// إنشاء مستخدم جديد
if (userForm) {

    userForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username = newUsername.value.trim();
        const password = newPassword.value;
        const role = newUserRole.value;

        userFormMessage.textContent = "";

        createUserButton.disabled = true;
        createUserButton.textContent = "جاري إنشاء المستخدم...";

        try {

            const response = await fetch("/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },

                body: JSON.stringify({
                    username,
                    password,
                    role
                })

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "تعذر إنشاء المستخدم."
                );
            }

            userFormMessage.textContent =
                "تم إنشاء المستخدم بنجاح.";

            userForm.reset();
            loadUsers();
        } catch (error) {

            userFormMessage.textContent = error.message;

        } finally {

            createUserButton.disabled = false;
            createUserButton.textContent = "إنشاء المستخدم";

        }

    });

}