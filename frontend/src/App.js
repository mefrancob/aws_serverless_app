import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_ce5O3fVpK',
      userPoolClientId: '4s0fendrd92od0bf6b8vk3vbgk',
    }
  }
});

const API_URL = "https://cwaai6k6pi.execute-api.us-east-1.amazonaws.com/Prod";

const formFields = {
  signUp: {
    email: { order: 2, isRequired: true },
    preferred_username: {
      order: 1,
      label: 'Nombre de usuario',
      placeholder: 'Ej: Manolo',
      isRequired: true,
    },
    password: { order: 3 },
    confirm_password: { order: 4 }
  },
};

function Home({ user, signOut }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  // ESTADOS NUEVOS: Separamos Título y Detalles
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

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
    if (!title.trim()) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // ENVIAMOS AMBOS CAMPOS
      // Nota: Mantenemos 'description' como el título para compatibilidad con tus tareas viejas
      const payload = {
        description: title, 
        details: details // Nuevo campo
      };

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setTitle("");
        setDetails(""); // Limpiamos ambos campos
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const attributes = await fetchUserAttributes();
        const name = attributes.preferred_username || user?.signInDetails?.loginId;
        setDisplayName(name);
      } catch (e) { console.log(e); }
      fetchTasks();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="user-info">
          <p>Hola, {displayName || "..."}</p> 
          <button onClick={signOut} className="btn-logout">Cerrar Sesión</button>
        </div>
        <h1>Lista de Tareas</h1>
        
        {/* FORMULARIO ACTUALIZADO: AHORA TIENE DOS INPUTS */}
        <form onSubmit={handleSubmit} className="task-form">
          <div className="input-group">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea..."
              disabled={loading}
              className="input-title"
            />
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Descripción opcional (detalles...)"
              disabled={loading}
              className="input-details"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-add">
            {loading ? '...' : 'Agregar'}
          </button>
        </form>

        <div className="task-list">
          {tasks.length === 0 && <p style={{fontSize: '0.9rem', opacity: 0.7}}>No hay tareas pendientes.</p>}
          {tasks.map((task) => (
            <div key={task.taskId} className="task-card">
              <div className="task-content">
                {/* TÍTULO */}
                <span className="task-title" style={{
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  opacity: task.status === 'completed' ? 0.5 : 1
                }}>
                  {task.description}
                </span>
                
                {/* DESCRIPCIÓN (Solo se muestra si existe) */}
                {task.details && (
                  <p className="task-desc" style={{
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    opacity: task.status === 'completed' ? 0.5 : 1
                  }}>
                    {task.details}
                  </p>
                )}
              </div>
              
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

function App() {
  return (
    <Authenticator loginMechanisms={['email']} formFields={formFields}>
      {({ signOut, user }) => (
        <Home user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

export default App;
