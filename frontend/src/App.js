import React, { useState, useEffect } from 'react';
import './App.css';

// TU URL DE AWS (Verifica que sea correcta)
const API_URL = "https://wpimmkxsxk.execute-api.us-east-1.amazonaws.com/Prod";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Cargar tareas al iniciar (GET)
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  // 2. Crear nueva tarea (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newTask }),
      });
      setNewTask(""); // Limpiar input
      fetchTasks();   // Recargar lista
    } catch (error) {
      console.error("Error guardando:", error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>☁️ Mi To-Do List Serverless</h1>
        
        {/* Formulario de entrada */}
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

        {/* Lista de Tareas */}
        <div className="task-list">
          {tasks.length === 0 ? (
            <p>No hay tareas pendientes 🎉</p>
          ) : (
            tasks.map((task) => (
              <div key={task.taskId} className="task-card">
                <span>{task.description}</span>
                <small>{task.status}</small>
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
