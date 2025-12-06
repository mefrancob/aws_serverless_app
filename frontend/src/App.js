import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// Configuración de AWS
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_ce5O3fVpK',
      userPoolClientId: '4s0fendrd92od0bf6b8vk3vbgk',
    }
  }
});

const API_URL = "https://cwaai6k6pi.execute-api.us-east-1.amazonaws.com/Prod";

// Configuración del Formulario de Registro
const formFields = {
  signUp: {
    email: { order: 2, isRequired: true },
    preferred_username: {
      order: 1,
      label: 'Nombre de usuario',
      placeholder: 'Ej: Manuel',
      isRequired: true,
    },
    password: { order: 3 },
    confirm_password: { order: 4 }
  },
};

// --- COMPONENTE INTERNO: Solo existe cuando el usuario ya entró ---
function Home({ user, signOut }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(""); // Nombre para mostrar

  const getToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (e) { return null; }
  };

  const getAuthHeaders = async (token = null) => {
    const currentToken = token || await getToken();
    return {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTasks = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const headers = await getAuthHeaders(token);
      const response = await fetch(`${API_URL}/tasks`, { headers: { 'Authorization': headers.Authorization } });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setTasks(data);
        else if (data.body) setTasks(JSON.parse(data.body));
        else if (data.Items) setTasks(data.Items);
      }
    } catch (error) { console.error("Error", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ description: newTask }),
      });
      if (response.ok) {
        setNewTask("");
        await fetchTasks();
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("¿Borrar tarea?")) return;
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': headers.Authorization }
      });
      fetchTasks();
    } catch (error) { console.error(error); }
  };

  const completeTask = async (taskId) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ status: 'completed' })
      });
      fetchTasks();
    } catch (error) { console.error(error); }
  };

  // Este useEffect AHORA SÍ correrá justo después del login
  useEffect(() => {
    const loadData = async () => {
      // 1. Cargar Nombre de Usuario
      try {
        const attributes = await fetchUserAttributes();
        // Prioridad: atributo 'preferred_username', si no, el del objeto user
        const name = attributes.preferred_username || user?.signInDetails?.loginId;
        setDisplayName(name);
      } catch (e) { console.log(e); }

      // 2. Cargar Tareas
      fetchTasks();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Se ejecuta al "montar" este componente Home

  return (
    <div className="App">
      <header className="App-header">
        <div className="user-info">
          {/* Aquí mostramos el estado displayName que acabamos de cargar */}
          <p>Hola, {displayName || "..."}</p> 
          <button onClick={signOut} className="btn-logout">Cerrar Sesión</button>
        </div>
        <h1>Lista de Tareas</h1>
        
        <form onSubmit={handleSubmit} className="task-form">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nueva tarea..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>{loading ? '...' : 'Agregar'}</button>
        </form>

        <div className="task-list">
          {tasks.length === 0 && <p style={{fontSize: '0.9rem', opacity: 0.7}}>No hay tareas pendientes.</p>}
          {tasks.map((task) => (
            <div key={task.taskId} className="task-card">
              <span style={{
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                opacity: task.status === 'completed' ? 0.5 : 1
              }}>
                {task.description}
              </span>
              <div className="actions">
                <button onClick={() => completeTask(task.taskId)} className="btn-icon">✅</button>
                <button onClick={() => deleteTask(task.taskId)} className="btn-icon">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
function App() {
  return (
    <Authenticator loginMechanisms={['email']} formFields={formFields}>
      {({ signOut, user }) => (
        // Renderizamos 'Home' pasando el usuario y la función salir.
        // Al montarse 'Home' por primera vez, disparará su useEffect y cargará el nombre correcto.
        <Home user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

export default App;
