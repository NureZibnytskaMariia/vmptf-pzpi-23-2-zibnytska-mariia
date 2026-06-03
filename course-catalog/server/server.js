import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'courses.json');

const app = express();
const PORT = 5001;
const JWT_SECRET = 'hogwarts_secret_order_of_phoenix';

app.use(cors());
app.use(express.json());

// Хелпери для роботи з JSON ("БД")
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');

// Мідлвар для перевірки JWT (Рівень 3)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Токен відсутній' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Невалідний токен' });
        req.user = user;
        next();
    });
};

// --- МАРШРУТИ ---

// 1. Аутентифікація (Рівень 3)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = readData();
    const user = db.users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: 'Невірне ім\'я користувача або пароль' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, username: user.username, enrolledCourses: user.enrolledCourses, customPrograms: user.customPrograms });
});

// 2. Отримання списку курсів (Рівень 1)
app.get('/api/courses', (req, res) => {
    const db = readData();
    res.json(db.courses);
});

// 3. Запис на курс (Рівень 2)
app.post('/api/courses/:id/enroll', authenticateToken, (req, res) => {
    const courseId = parseInt(req.params.id);
    const db = readData();
    const user = db.users.find(u => u.id === req.user.id);

    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
        if (!user.customPrograms) user.customPrograms = {};
        // Рівень 4: Автоматичне створення базової програми при записі
        user.customPrograms[courseId] = ["Вступна лекція", "Основний модуль", "Фінальний зріз знань"];
        writeData(db);
    }
    res.json({ enrolledCourses: user.enrolledCourses, customPrograms: user.customPrograms });
});

// 4. Додавання відгуку та перерахунок рейтингу (Рівень 2)
app.post('/api/courses/:id/reviews', authenticateToken, (req, res) => {
    const courseId = parseInt(req.params.id);
    const { text, rating } = req.body;
    const db = readData();

    const course = db.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ message: 'Курс не знайдено' });

    const newReview = { user: req.user.username, text, rating: parseInt(rating) };
    course.reviews.push(newReview);

    // Перерахунок середнього рейтингу
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.rating = parseFloat((totalRating / course.reviews.length).toFixed(1));

    writeData(db);
    res.json(course);
});

// 5. Оновлення персональної навчальної програми (Рівень 3 / 4)
app.post('/api/courses/:id/program', authenticateToken, (req, res) => {
    const courseId = parseInt(req.params.id);
    const { steps } = req.body; // масив стрічок (задач)
    const db = readData();
    const user = db.users.find(u => u.id === req.user.id);

    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    if (!user.customPrograms) user.customPrograms = {};

    user.customPrograms[courseId] = steps;
    writeData(db);
    res.json({ customPrograms: user.customPrograms });
});

app.listen(PORT, () => {
    console.log(`🧙‍♂️ Magic server is running on http://localhost:${PORT}`);
});