import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// CAMBIA ESTO POR TU URL REAL SI LA PERDISTE
const API_URL = "https://oew2b6jdoh.execute-api.us-east-1.amazonaws.com/Prod";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <header className="App-header">
            <div className="user-info">
              <p>Hola, {user?.username}</p>
              <button onClick={signOut} style={{backgroundColor: '#ff4444'}}>Salir</button>
            </div>
            
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
                  <div key={task.taskId} className="task-card">
                    <span>{task.description}</span>
                    <small>{task.status || 'pending'}</small>
                  </div>
                ))
              )}
            </div>
          </header>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
