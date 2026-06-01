import React, { useState } from 'react';
import './TaskBoard.css';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Trace benefits to Barrier-Free interfaces', tags: ['Project', 'WCAG'] },
    { id: 2, title: 'Prepare life with practical work No. 2', tags: ['Getting started'] }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [currentTags, setCurrentTags] = useState([]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags([...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTitle,
      tags: currentTags
    };

    setTasks([...tasks, newTask]);
    setNewTitle('');
    setCurrentTags([]);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <main className="board-container">
        <div className="corners top-left"></div>
        <div className="corners top-right"></div>
        <div className="corners bottom-left"></div>
        <div className="corners bottom-right"></div>
      <header>
        <h1>Interactive Task Board</h1>
        <p className="subtitle">Created with WCAG/ARIA accessibility standards in mind</p>
      </header>

      <section className="form-section" aria-labelledby="form-heading">
        <h2 id="form-heading" className="visually-hidden">Create a new task</h2>
        
        <form onSubmit={handleCreateTask} className="task-form">
          <div className="input-group">
            <label htmlFor="task-title">Task description:</label>
            <input
              type="text"
              id="task-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What should be done?"
              required
            />
          </div>

          <div className="input-group tags-input-wrapper">
            <label htmlFor="task-tag">Add a tag:</label>
            <div className="tag-field-row">
              <input
                type="text"
                id="task-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="For example: Urgent"
              />
              <button 
                type="button" 
                onClick={handleAddTag}
                className="btn-secondary"
                aria-label="Add the entered tag to the list"
              >
                + Тег
              </button>
            </div>
            {currentTags.length > 0 && (
              <div className="current-tags-preview" role="status" aria-label="Додані теги">
                {currentTags.map((tag, idx) => (
                  <span key={idx} className="tag-badge">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">Create task:</button>
        </form>
      </section>

      <section className="tasks-section" aria-labelledby="board-heading">
        <h2 id="board-heading">Your tasks ({tasks.length})</h2>
        
        <div className="tasks-grid" aria-live="polite" role="list">
          {tasks.length === 0 ? (
            <p className="empty-message">There are currently no active tasks. The board is empty.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="task-card" role="listitem">
                <div className="task-card-content">
                  <h3>{task.title}</h3>
                  <div className="task-tags">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="tag-badge" aria-label={`Тег: ${tag}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTask(task.id)}
                  aria-label={`Delete task: ${task.title}`}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}