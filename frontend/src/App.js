import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// Configuración Estándar y Limpia
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_ce5O3fVpK',
      userPoolClientId: '4s0fendrd92od0bf6b8vk3vbgk',
    }
  }
});

const API_URL = "https://cwaai6k6pi.execute-api.us-east-1.amazonaws.com/Prod";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const getToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (e) {
      return null;
    }
  };

  const fetchTasks = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ description: newTask }),
      });
      if (response.ok) {
        setNewTask("");
        fetchTasks();
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("¿Borrar?")) return;
    const token = await getToken();
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchTasks();
  };

  const completeTask = async (taskId) => {
    const token = await getToken();
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Authorization': token }
    });
    fetchTasks();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const u = await fetchUserAttributes();
        setUserName(u.email);
        fetchTasks();
      } catch(e) {}
    };
    load();
  }, []);

  return (
    <Authenticator loginMechanisms={['email']}>
      {({ signOut, user }) => (
        <div className="App">
          <header className="App-header">
            <div className="user-info">
              <p>Hola, {user?.signInDetails?.loginId || userName}</p>
              <button onClick={signOut} className="btn-logout">Salir</button>
            </div>
            <h1>Lista de Tareas</h1>
            
            <form onSubmit={handleSubmit} className="task-form">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Nueva tarea..."
                disabled={loading}
              />
              <button type="submit" disabled={loading}>Agregar</button>
            </form>

            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.taskId} className="task-card">
                  <span style={{textDecoration: task.status === 'completed' ? 'line-through' : 'none'}}>
                    {task.description}
                  </span>
                  <div>
                    <button onClick={() => completeTask(task.taskId)} className="btn-icon">✅</button>
                    <button onClick={() => deleteTask(task.taskId)} className="btn-icon">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </header>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
