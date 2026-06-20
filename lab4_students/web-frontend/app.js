const API_URL = 'http://127.0.0.1:8000';

// Перемикання секцій дашборду
function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(`${sectionId}-section`).classList.add('active');
    event.target.classList.add('active');

    const titles = {
        students: 'Керування Студентами',
        teachers: 'Керування Викладачами',
        courses: 'Керування Курсами',
        grades: 'Академічний Журнал Оцінок',
        actions: 'Панель Безпеки та Транзакцій'
    };
    document.getElementById('page-title').innerText = titles[sectionId];

    if (sectionId === 'students') loadStudents();
    if (sectionId === 'teachers') loadTeachers();
    if (sectionId === 'courses') loadCourses();
    if (sectionId === 'grades') loadGrades();
}

function showNotification(text, isSuccess = true) {
    const bar = document.getElementById('notification-bar');
    bar.className = `notification ${isSuccess ? 'success' : 'error'}`;
    bar.innerText = text;
    setTimeout(() => bar.style.display = 'none', 5000);
}

function logTransaction(text) {
    const log = document.getElementById('transaction-log');
    log.innerHTML += `<br>[${new Date().toLocaleTimeString()}] ${text}`;
    log.scrollTop = log.scrollHeight;
}

async function loadStudents() {
    try {
        const res = await fetch(`${API_URL}/students/?skip=0&limit=100`);
        const students = await res.json();
        const tbody = document.getElementById('students-table-body');
        tbody.innerHTML = '';
        students.forEach(s => {
            tbody.innerHTML += `
                        <tr>
                            <td>${s.id}</td>
                            <td>${s.first_name} ${s.last_name}</td>
                            <td>${s.email}</td>
                            <td><strong>${s.group_name}</strong></td>
                            <td class="actions-cell">
                                <button class="action-btn btn-edit" onclick="editStudent(${s.id}, '${s.first_name}', '${s.last_name}', '${s.email}', '${s.group_name}')">✏️</button>
                                <button class="action-btn btn-delete" onclick="deleteStudent(${s.id})">🗑️</button>
                            </td>
                        </tr>
                    `;
        });
    } catch (e) { console.error(e); }
}

async function handleStudentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('student-id').value;
    const payload = {
        first_name: document.getElementById('student-first-name').value,
        last_name: document.getElementById('student-last-name').value,
        email: document.getElementById('student-email').value,
        group_name: document.getElementById('student-group').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/students/${id}` : `${API_URL}/students/`;

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        showNotification(id ? "Дані студента оновлено!" : "Студента успішно створено!");
        resetStudentForm();
        loadStudents();
    } else {
        showNotification("Помилка обробки запиту", false);
    }
}

function editStudent(id, fn, ln, email, group) {
    document.getElementById('student-id').value = id;
    document.getElementById('student-first-name').value = fn;
    document.getElementById('student-last-name').value = ln;
    document.getElementById('student-email').value = email;
    document.getElementById('student-group').value = group;
    document.getElementById('student-form-title').innerText = "Редагувати студента";
    document.getElementById('cancel-student-edit').style.display = 'inline-block';
}

function resetStudentForm() {
    document.getElementById('student-id').value = '';
    document.getElementById('student-form').reset();
    document.getElementById('student-form-title').innerText = "Додати студента";
    document.getElementById('cancel-student-edit').style.display = 'none';
}

async function deleteStudent(id) {
    if (confirm(`Ви впевнені, що хочете видалити студента з ID ${id}?`)) {
        const res = await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        if (res.ok) { showNotification("Студента видалено"); loadStudents(); }
    }
}

async function loadTeachers() {
    const res = await fetch(`${API_URL}/teachers/`);
    const data = await res.json();
    const tbody = document.getElementById('teachers-table-body');
    tbody.innerHTML = '';
    data.forEach(t => {
        tbody.innerHTML += `
                    <tr>
                        <td>${t.id}</td>
                        <td>${t.first_name} ${t.last_name}</td>
                        <td>${t.department}</td>
                        <td><button class="action-btn btn-delete" onclick="deleteTeacher(${t.id})">🗑️</button></td>
                    </tr>
                `;
    });
}

async function handleTeacherSubmit(e) {
    e.preventDefault();
    const payload = {
        first_name: document.getElementById('teacher-first-name').value,
        last_name: document.getElementById('teacher-last-name').value,
        department: document.getElementById('teacher-dep').value
    };
    await fetch(`${API_URL}/teachers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    showNotification("Викладача збережено!");
    document.getElementById('teacher-form').reset();
    loadTeachers();
}

async function deleteTeacher(id) {
    const res = await fetch(`${API_URL}/teachers/${id}`, { method: 'DELETE' });
    if (res.ok) { showNotification("Викладача видалено"); loadTeachers(); }
    else { showNotification("Помилка: Викладач веде активні курси!", false); }
}

async function loadCourses() {
    const res = await fetch(`${API_URL}/courses/`);
    const data = await res.json();
    const tbody = document.getElementById('courses-table-body');
    tbody.innerHTML = '';
    data.forEach(c => {
        tbody.innerHTML += `
                    <tr>
                        <td>${c.id}</td>
                        <td>${c.title}</td>
                        <td>${c.description}</td>
                        <td>${c.teacher_id}</td>
                        <td><button class="action-btn btn-delete" onclick="deleteCourse(${c.id})">🗑️</button></td>
                    </tr>
                `;
    });
}

async function handleCourseSubmit(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('course-title-input').value,
        description: document.getElementById('course-desc').value,
        teacher_id: parseInt(document.getElementById('course-teacher-id').value)
    };
    const res = await fetch(`${API_URL}/courses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        showNotification("Курс створено (Кеш Redis скинуто)!");
        document.getElementById('course-form').reset();
        loadCourses();
    } else { showNotification("Помилка створення курсу (Перевірте ID викладача)", false); }
}

async function deleteCourse(id) {
    const res = await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' });
    if (res.ok) { showNotification("Курс видалено"); loadCourses(); }
    else { showNotification("Помилка видалення: На курсі є оцінки студентів!", false); }
}

async function loadGrades() {
    const res = await fetch(`${API_URL}/grades/`);
    const data = await res.json();
    const tbody = document.getElementById('grades-table-body');
    tbody.innerHTML = '';
    data.forEach(g => {
        tbody.innerHTML += `
                    <tr>
                        <td>${g.id}</td>
                        <td>${g.student_id}</td>
                        <td>${g.course_id}</td>
                        <td><strong>${g.score}</strong></td>
                        <td>${new Date(g.created_at).toLocaleDateString()}</td>
                        <td><button class="action-btn btn-delete" onclick="deleteGrade(${g.id})">🗑️</button></td>
                    </tr>
                `;
    });
}

async function handleGradeSubmit(e) {
    e.preventDefault();
    const payload = {
        student_id: parseInt(document.getElementById('grade-student-id').value),
        course_id: parseInt(document.getElementById('grade-course-id').value),
        score: parseInt(document.getElementById('grade-score').value)
    };
    const res = await fetch(`${API_URL}/grades/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        showNotification("Оцінку успішно виставлено!");
        document.getElementById('grade-form').reset();
        loadGrades();
    } else { showNotification("Помилка бази даних (CheckConstraint або неіснуючі ID)", false); }
}

async function deleteGrade(id) {
    await fetch(`${API_URL}/grades/${id}`, { method: 'DELETE' });
    showNotification("Оцінку видалено");
    loadGrades();
}

async function handleGraduateSubmit(e) {
    e.preventDefault();
    const sId = document.getElementById('grad-student-id').value;
    const cId = document.getElementById('grad-course-id').value;
    const score = document.getElementById('grad-score').value;

    logTransaction(`Спроба запуску атомарної транзакції випуску для Студента ID:${sId}...`);

    try {
        const res = await fetch(`${API_URL}/students/${sId}/graduate?course_id=${cId}&score=${score}`, {
            method: 'POST'
        });
        const data = await res.json();

        if (res.ok) {
            showNotification("Транзакція пройшла успішно!");
            logTransaction(`УСПІХ: Студент отримав бал ${score}. Група автоматично змінена на 'GRADUATED'.`);
        } else {
            showNotification(data.detail || "Помилка транзакції", false);
            logTransaction(`ЗБІЙ: База даних відхилила операцію. Причина: ${data.detail}. Виконано ROLLBACK. Дані не постраждали.`);
        }
    } catch (err) {
        logTransaction(`Критична помилка мережі: ${err.message}`);
    }
}

window.onload = loadStudents;