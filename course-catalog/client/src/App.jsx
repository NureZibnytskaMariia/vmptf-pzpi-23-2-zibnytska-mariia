import React, { useState, useEffect } from 'react';
import { BookOpen, Key, LogOut, Star, Sparkles, ClipboardList, Send } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

export default function App() {
  // Стейт менеджмент SPA
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'dashboard', 'login'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wizard_token') || null);
  
  // Форми
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reviewTexts, setReviewTexts] = useState({});
  const [reviewRatings, setReviewRatings] = useState({});
  const [newProgramSteps, setNewProgramSteps] = useState({});

  useEffect(() => {
    fetchCourses();
    if (token) {
      // Якщо є токен, відновлюємо сесію (спрощено)
      setUser({
        username: localStorage.getItem('wizard_username') || 'Wizard',
        enrolledCourses: JSON.parse(localStorage.getItem('wizard_enrolled') || '[]'),
        customPrograms: JSON.parse(localStorage.getItem('wizard_programs') || '{}')
      });
    }
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (e) { console.error("Помилка завантаження курсів", e); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser({
          username: data.username,
          enrolledCourses: data.enrolledCourses,
          customPrograms: data.customPrograms
        });
        localStorage.setItem('wizard_token', data.token);
        localStorage.setItem('wizard_username', data.username);
        localStorage.setItem('wizard_enrolled', JSON.stringify(data.enrolledCourses));
        localStorage.setItem('wizard_programs', JSON.stringify(data.customPrograms));
        setActiveTab('catalog');
      } else { alert(data.message); }
    } catch (e) { alert("Сервер недоступний"); }
  };

  const handleLogout = () => {
    setToken(null); setUser(null);
    localStorage.clear();
    setActiveTab('catalog');
  };

  const handleEnroll = async (courseId) => {
    if (!token) { setActiveTab('login'); return; }
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, enrolledCourses: data.enrolledCourses, customPrograms: data.customPrograms };
        setUser(updatedUser);
        localStorage.setItem('wizard_enrolled', JSON.stringify(data.enrolledCourses));
        localStorage.setItem('wizard_programs', JSON.stringify(data.customPrograms));
      }
    } catch (e) { console.error(e); }
  };

  const handleAddReview = async (courseId) => {
    if (!token) return;
    const text = reviewTexts[courseId] || '';
    const rating = reviewRatings[courseId] || 5;
    if (!text.trim()) return;

    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, rating })
      });
      if (res.ok) {
        fetchCourses(); // оновлюємо дані курсів
        setReviewTexts({ ...reviewTexts, [courseId]: '' });
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateProgram = async (courseId) => {
    const rawSteps = newProgramSteps[courseId] || '';
    if (!rawSteps.trim()) return;
    const stepsArray = rawSteps.split(',').map(s => s.trim());

    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/program`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ steps: stepsArray })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, customPrograms: data.customPrograms };
        setUser(updatedUser);
        localStorage.setItem('wizard_programs', JSON.stringify(data.customPrograms));
        setNewProgramSteps({ ...newProgramSteps, [courseId]: '' });
        alert("Навчальну програму успішно змінено!");
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="app-container">
      {/* Навігаційна панель */}
      <nav className="magic-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveTab('catalog')}>
          <Sparkles color="#c5a059" />
          <h2 style={{ margin: 0, cursor: 'pointer' }}>Hogwarts Data Academy</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button className="magic-btn-secondary" onClick={() => setActiveTab('catalog')}>Каталог</button>
          {token && (
            <button className="magic-btn-secondary" onClick={() => setActiveTab('dashboard')}>
              <ClipboardList size={16} style={{ marginRight: '5px' }} /> Кабінет
            </button>
          )}
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#c5a059' }}>✨ {user?.username}</span>
              <button className="magic-btn" onClick={handleLogout}><LogOut size={16} /></button>
            </div>
          ) : (
            <button className="magic-btn" onClick={() => setActiveTab('login')}><Key size={16} /></button>
          )}
        </div>
      </nav>

      {/* Контентна частина SPA */}
      <main style={{ padding: '2rem' }}>
        
        {/* ВКЛАДКА 1: Каталог курсів */}
        {activeTab === 'catalog' && (
          <div>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Доступні Дисципліни</h1>
            <div className="grid">
              {courses.map(course => {
                const isEnrolled = user?.enrolledCourses?.includes(course.id);
                return (
                  <div key={course.id} className="magic-card">
                    <span style={{ fontSize: '0.8rem', color: '#c5a059', textTransform: 'uppercase' }}>{course.category}</span>
                    <h3>{course.title}</h3>
                    <p style={{ color: '#a0aec0', fontSize: '0.95rem' }}>{course.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                      <span>⏳ {course.duration}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e5c17a' }}>
                        <Star size={16} fill="#e5c17a" /> {course.rating}
                      </span>
                    </div>

                    <button 
                      className="magic-btn" 
                      style={{ width: '100%', marginBottom: '1rem' }}
                      onClick={() => handleEnroll(course.id)}
                      disabled={isEnrolled}
                    >
                      {isEnrolled ? "🧙‍♂️ Ви вже записані" : "Записатися на курс"}
                    </button>

                    {/* Рівень 2: Відгуки */}
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(197,160,89,0.2)', paddingTop: '1rem' }}>
                      <h4>Відгуки магістрів:</h4>
                      {course.reviews.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#718096' }}>Немає відгуків.</p> : 
                        course.reviews.map((r, idx) => (
                          <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                            <strong>{r.user} ({r.rating}⭐):</strong> {r.text}
                          </div>
                        ))
                      }
                      {token && (
                        <div style={{ display: 'flex', gap: '5px', marginTop: '0.5rem' }}>
                          <input 
                            type="text" 
                            placeholder="Ваш відгук..." 
                            className="input-field"
                            value={reviewTexts[course.id] || ''}
                            onChange={(e) => setReviewTexts({...reviewTexts, [course.id]: e.target.value})}
                          />
                          <select 
                            className="input-field" 
                            style={{ width: '60px' }}
                            value={reviewRatings[course.id] || 5}
                            onChange={(e) => setReviewRatings({...reviewRatings, [course.id]: e.target.value})}
                          >
                            <option value="5">5⭐</option>
                            <option value="4">4⭐</option>
                            <option value="3">3⭐</option>
                          </select>
                          <button className="magic-btn" onClick={() => handleAddReview(course.id)}><Send size={14}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: Кабінет користувача (Рівень 3 + 4) */}
        {activeTab === 'dashboard' && user && (
          <div>
            <h1 style={{ textAlign: 'center' }}>Магічний Сувій Успішності</h1>
            <p style={{ textAlign: 'center', color: '#c5a059' }}>Прогрес студента {user.username}</p>
            
            <h2 style={{ marginTop: '2rem' }}>Ваші курси та індивідуальні програми:</h2>
            <div className="grid">
              {courses.filter(c => user.enrolledCourses.includes(c.id)).map(course => (
                <div key={course.id} className="magic-card">
                  <h3>{course.title}</h3>
                  <h4 style={{ color: '#c5a059', marginTop: '1rem' }}>План навчання:</h4>
                  <ul>
                    {(user.customPrograms?.[course.id] || []).map((step, i) => (
                      <li key={i} style={{ marginBottom: '5px', color: '#e2e8f0' }}>🔹 {step}</li>
                    ))}
                  </ul>

                  {/* Зміна програми (Рівень 3 / 4) */}
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#c5a059' }}>Переписати програму (через кому):</label>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                      <input 
                        type="text" 
                        placeholder="Тема 1, Тема 2, Іспит" 
                        className="input-field"
                        value={newProgramSteps[course.id] || ''}
                        onChange={(e) => setNewProgramSteps({...newProgramSteps, [course.id]: e.target.value})}
                      />
                      <button className="magic-btn" onClick={() => handleUpdateProgram(course.id)}>Оновити</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 3: Логін */}
        {activeTab === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="magic-card" style={{ width: '100%', maxWidth: '400px' }}>
              <h2 style={{ textAlign: 'center', marginTop: 0 }}>Вхід до Академії</h2>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label>Ім'я чарівника:</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label>Заклинання-пароль:</label>
                  <input 
                    type="password" 
                    required 
                    className="input-field" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="magic-btn" style={{ marginTop: '1rem' }}>Увійти</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}