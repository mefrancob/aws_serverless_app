import React, { useState, useEffect } from 'react';
import './App.css';

// TU URL DE AWS (Verifica que sea la correcta, terminada en /Prod)
const API_URL = "https://oew2b6jdoh.execute-api.us-east-1.amazonaws.com/Prod";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Cargar tareas (GET)
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      // Ordenar: Pendientes primero
      const sortedData = data.sort((a, b) => (a.status === 'completed' ? 1 : -1));
      setTasks(sortedData);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  // 2. Crear tarea (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newTask }),
      });
      setNewTask("");
      fetchTasks();
    } catch (error) {
      console.error("Error guardando:", error);
    }
    setLoading(false);
  };

  // 3. Borrar tarea (DELETE)
  const deleteTask = async (taskId) => {
    if (!window.confirm("¿Seguro que quieres borrar esta tarea?")) return;
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      // Actualizar UI optimista (sin recargar todo)
      setTasks(tasks.filter(t => t.taskId !== taskId));
    } catch (error) {
      console.error("Error borrando:", error);
    }
  };

  // 4. Actualizar estado (PUT)
  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      // Actualizar UI primero para sensación de rapidez
      setTasks(tasks.map(t => 
        t.taskId === task.taskId ? { ...t, status: newStatus } : t
      ));

      await fetch(`${API_URL}/tasks/${task.taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error actualizando:", error);
      fetchTasks(); // Revertir si falla
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>☁️ Mi To-Do List Serverless</h1>
        
        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="¿Qué tienes que hacer hoy?"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Agregar"}
          </button>
        </form>

        <div className="task-list">
          {tasks.length === 0 ? (
            <p>No hay tareas pendientes 🎉</p>
          ) : (
            tasks.map((task) => (
              <div key={task.taskId} className={`task-card ${task.status}`}>
                <div className="task-info">
                  <span 
                    className="task-desc"
                    onClick={() => toggleTaskStatus(task)}
                  >
                    {task.status === 'completed' ? '✅' : '⬜'} {task.description}
                  </span>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteTask(task.taskId)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
