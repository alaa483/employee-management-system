(function () {
    // عناصر شاشة الأقسام
    const departmentTableBody = document.getElementById(
        "departmentTableBody"
    );

    const departmentCount = document.getElementById(
        "departmentCount"
    );

    const departmentMessage = document.getElementById(
        "departmentMessage"
    );

    const addDepartmentButton = document.getElementById(
        "addDepartmentButton"
    );

    const refreshDepartmentsButton = document.getElementById(
        "refreshDepartmentsButton"
    );




    // التحقق من المستخدم الحالي
    function getCurrentUser() {

        try {

            return JSON.parse(
                sessionStorage.getItem("user") || "null"
            );

        } catch (error) {

            return null;

        }

    }


    // التحقق من صلاحية المدير
    function isAdminUser() {

        const user = getCurrentUser();

        return user?.role === "admin";

    }


    // التحقق من رمز تسجيل الدخول
    function getToken() {

        const token = sessionStorage.getItem("token");

        if (!token) {

            window.location.replace(
                "/login.html?returnTo=%2Fdepartments.html"
            );

            return null;

        }

        return token;

    }


    // تنسيق تاريخ إنشاء القسم
    function formatDate(date) {

        if (!date) {
            return "غير محدد";
        }

        return new Date(date).toLocaleDateString("ar-SA");

    }


    // تحميل الأقسام من MySQL
    async function loadDepartments() {

        const token = getToken();

        if (!token) {
            return;
        }

        departmentTableBody.innerHTML = `
        <tr>
            <td colspan="4">جاري تحميل الأقسام...</td>
        </tr>
    `;

        departmentMessage.textContent = "";

        try {

            const response = await fetch(
                "/api/departments",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (response.status === 401 || response.status === 403) {

                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                window.location.replace("/login.html");

                return;

            }

            const result = await response.json();

            if (!response.ok) {

                throw new Error(
                    result.message || "تعذر تحميل الأقسام."
                );

            }

            // حفظ عدد الأقسام
            departmentCount.textContent = result.count;

            // عرض الأقسام
            displayDepartments(result.data);

            departmentMessage.textContent =
                `تم تحميل ${result.count} قسم بنجاح.`;

        } catch (error) {

            departmentTableBody.innerHTML = `
            <tr>
                <td colspan="4">حدث خطأ أثناء تحميل الأقسام.</td>
            </tr>
        `;

            departmentMessage.textContent = error.message;

        }

    }



    // عرض الأقسام في الجدول
    function displayDepartments(departments) {

        departmentTableBody.replaceChildren();

        if (departments.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.textContent = "لا توجد أقسام مسجلة.";

            row.appendChild(cell);
            departmentTableBody.appendChild(row);

            return;
        }

        departments.forEach(department => {

            const row = document.createElement("tr");

            const values = [
                department.department_id,
                department.department_name,
                formatDate(department.created_at)
            ];

            values.forEach(value => {

                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);

            });

            // عمود الإجراءات
            const actionsCell = document.createElement("td");

            if (isAdminUser()) {

                // زر التعديل
                const editButton = document.createElement("button");

                editButton.textContent = "تعديل";
                editButton.className = "edit-button";

                editButton.addEventListener("click", () => {
                    openEditDepartmentModal(department);
                });

                actionsCell.appendChild(editButton);

                // زر الحذف
                const deleteButton = document.createElement("button");

                deleteButton.textContent = "حذف";
                deleteButton.className = "delete-button";

                deleteButton.addEventListener("click", () => {
                    deleteDepartment(department);
                });

                actionsCell.appendChild(deleteButton);

            } else {

                actionsCell.textContent = "عرض فقط";

            }

            row.appendChild(actionsCell);
            departmentTableBody.appendChild(row);

        });

    }


    // تحديث البيانات
    refreshDepartmentsButton.addEventListener(
        "click",
        loadDepartments
    );



    // إظهار زر إضافة القسم لجميع المستخدمين
    addDepartmentButton.hidden = false;


    // تحميل الأقسام عند فتح الشاشة
    loadDepartments();

    // عناصر نافذة إضافة القسم
    const departmentModal = document.getElementById("departmentModal");

    const departmentForm = document.getElementById("departmentForm");

    const departmentFormMessage = document.getElementById(
        "departmentFormMessage"
    );

    const closeDepartmentModal = document.getElementById(
        "closeDepartmentModal"
    );

    const cancelDepartmentButton = document.getElementById(
        "cancelDepartmentButton"
    );

    const departmentSaveButton = departmentForm.querySelector(
        'button[type="submit"]'
    );


    // فتح نافذة إضافة القسم
    addDepartmentButton.addEventListener("click", () => {

        departmentForm.reset();

        departmentFormMessage.textContent = "";

        departmentModal.classList.add("show");

    });


    // إغلاق نافذة إضافة القسم
    function closeDepartmentWindow() {

        departmentModal.classList.remove("show");

        departmentForm.reset();

        departmentFormMessage.textContent = "";

    }


    // ربط أزرار الإغلاق
    closeDepartmentModal.addEventListener(
        "click",
        closeDepartmentWindow
    );

    cancelDepartmentButton.addEventListener(
        "click",
        closeDepartmentWindow
    );


    // إغلاق النافذة عند الضغط خارجها
    departmentModal.addEventListener("click", (event) => {

        if (event.target === departmentModal) {
            closeDepartmentWindow();
        }

    });


    // حفظ قسم جديد في MySQL
    departmentForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const departmentName = document
            .getElementById("departmentName")
            .value.trim();

        if (!departmentName) {

            departmentFormMessage.textContent =
                "يرجى إدخال اسم القسم.";

            return;
        }

        const token = getToken();

        if (!token) {
            return;
        }

        departmentSaveButton.disabled = true;

        departmentSaveButton.textContent = "جاري الحفظ...";

        departmentFormMessage.textContent = "";

        try {

            const response = await fetch("/api/departments", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    department_name: departmentName
                })

            });

            const result = await response.json();

            if (response.status === 401) {

                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                window.location.replace(
                    "/login.html?returnTo=%2Fdepartments.html"
                );

                return;
            }

            if (!response.ok) {

                throw new Error(
                    result.message || "تعذر إضافة القسم."
                );

            }

            alert("تمت إضافة القسم بنجاح!");

            closeDepartmentWindow();

            // إعادة تحميل الأقسام من MySQL
            await loadDepartments();

        } catch (error) {

            departmentFormMessage.textContent = error.message;

        } finally {

            departmentSaveButton.disabled = false;

            departmentSaveButton.textContent = "حفظ القسم";

        }

    });

    // عناصر نافذة تعديل القسم
    const editDepartmentModal = document.getElementById(
        "editDepartmentModal"
    );

    const editDepartmentForm = document.getElementById(
        "editDepartmentForm"
    );

    const editDepartmentMessage = document.getElementById(
        "editDepartmentMessage"
    );

    const closeEditDepartmentModal = document.getElementById(
        "closeEditDepartmentModal"
    );

    const cancelEditDepartment = document.getElementById(
        "cancelEditDepartment"
    );

    const editDepartmentSaveButton = editDepartmentForm.querySelector(
        'button[type="submit"]'
    );


    // فتح نافذة تعديل القسم
    function openEditDepartmentModal(department) {

        document.getElementById("editDepartmentId").value =
            department.department_id;

        document.getElementById("editDepartmentName").value =
            department.department_name;

        editDepartmentMessage.textContent = "";

        editDepartmentModal.classList.add("show");

    }


    // إغلاق نافذة التعديل
    function closeEditDepartmentWindow() {

        editDepartmentModal.classList.remove("show");

        editDepartmentForm.reset();

        editDepartmentMessage.textContent = "";

    }


    // ربط أزرار الإغلاق
    closeEditDepartmentModal.addEventListener(
        "click",
        closeEditDepartmentWindow
    );

    cancelEditDepartment.addEventListener(
        "click",
        closeEditDepartmentWindow
    );


    // إغلاق النافذة عند الضغط خارجها
    editDepartmentModal.addEventListener("click", (event) => {

        if (event.target === editDepartmentModal) {
            closeEditDepartmentWindow();
        }

    });


    // حفظ تعديل القسم في MySQL
    editDepartmentForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const id = document.getElementById(
            "editDepartmentId"
        ).value;

        const departmentName = document.getElementById(
            "editDepartmentName"
        ).value.trim();

        if (!departmentName) {

            editDepartmentMessage.textContent =
                "يرجى إدخال اسم القسم.";

            return;
        }

        const token = getToken();

        if (!token) {
            return;
        }

        editDepartmentSaveButton.disabled = true;

        editDepartmentSaveButton.textContent = "جاري الحفظ...";

        editDepartmentMessage.textContent = "";

        try {

            const response = await fetch(
                `/api/departments/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        department_name: departmentName
                    })
                }
            );

            if (response.status === 401) {

                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                window.location.replace(
                    "/login.html?returnTo=%2Fdepartments.html"
                );

                return;
            }

            const result = await response.json();

            if (!response.ok) {

                throw new Error(
                    result.message || "تعذر تعديل القسم."
                );

            }

            alert("تم تعديل القسم بنجاح!");

            closeEditDepartmentWindow();

            // تحديث قائمة الأقسام من MySQL
            await loadDepartments();

        } catch (error) {

            editDepartmentMessage.textContent = error.message;

        } finally {

            editDepartmentSaveButton.disabled = false;

            editDepartmentSaveButton.textContent = "حفظ التعديلات";

        }

    });





    // حذف قسم من قاعدة البيانات
    async function deleteDepartment(department) {

        const confirmed = confirm(
            `هل أنت متأكد من حذف القسم "${department.department_name}"؟`
        );

        if (!confirmed) return;

        const token = getToken();

        if (!token) return;

        try {

            const response = await fetch(
                `/api/departments/${department.department_id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (response.status === 401) {

                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                window.location.replace(
                    "/login.html?returnTo=%2Fdepartments.html"
                );

                return;
            }

            if (!response.ok) {
                throw new Error(result.message || "تعذر حذف القسم.");
            }

            alert("تم حذف القسم بنجاح.");

            await loadDepartments();

        } catch (error) {

            alert(error.message);

        }

    }
    // نهاية النطاق المستقل
})();


