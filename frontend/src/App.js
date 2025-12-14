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

const formFields = {
  signUp: {
    email: { order: 2, isRequired: true },
    preferred_username: { order: 1, label: 'Nombre de usuario', placeholder: 'Ej: Manuel', isRequired: true },
    password: { order: 3 },
    confirm_password: { order: 4 }
  },
};

function Home({ user, signOut }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  
  // --- CAMBIO PAGINACIÓN: Estado para el token ---
  const [nextToken, setNextToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // ESTADOS DEL FORMULARIO
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");

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

  // --- CAMBIO PAGINACIÓN: Función fetchTasks mejorada ---
  // Ahora acepta un token opcional para cargar la siguiente página
  const fetchTasks = async (tokenToLoad = null, append = false) => {
    const token = await getToken();
    if (!token) return;
    
    try {
      const headers = await getAuthHeaders(token);
      
      // Construimos la URL con parámetros de paginación
      let url = `${API_URL}/tasks?limit=5`; // Traemos de 5 en 5
      if (tokenToLoad) {
        // Codificamos el token para que viaje seguro en la URL
        url += `&nextToken=${encodeURIComponent(tokenToLoad)}`;
      }

      if (append) setLoadingMore(true);

      const response = await fetch(url, { headers: { 'Authorization': headers.Authorization } });
      
      if (response.ok) {
        const data = await response.json();
        
        // Manejamos la respuesta nueva { tasks: [], nextToken: ... }
        let newTasks = [];
        let newNextToken = null;

        if (data.tasks) {
          newTasks = data.tasks;
          newNextToken = data.nextToken;
        } else if (Array.isArray(data)) {
          // Soporte retroactivo por si la Lambda falla y envía array antiguo
          newTasks = data;
        }

        // Si es "Cargar más", sumamos las tareas. Si es carga inicial, reemplazamos.
        if (append) {
          setTasks(prev => [...prev, ...newTasks]);
        } else {
          setTasks(newTasks);
        }
        
        setNextToken(newNextToken);
      }
    } catch (error) { console.error("Error fetching tasks", error); }
    setLoadingMore(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const payload = { 
        description: title, 
        details: details, 
        priority: priority,
        dueDate: dueDate
      };
      
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setTitle("");
        setDetails("");
        setPriority("normal");
        setDueDate("");
        // Recargamos desde cero al crear una tarea nueva
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
      // Filtramos localmente para no tener que recargar todo
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
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
      // Recargar todo para actualizar estado
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
      // Carga inicial (sin token)
      fetchTasks();
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LÓGICA DE FECHAS MEJORADA ---
  const getDateStatus = (dateString) => {
    if (!dateString) return { color: '#888', text: null }; 
    
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localToday = new Date(today.getTime() - offset).toISOString().split('T')[0];

    const tomorrowDate = new Date(today.getTime() - offset);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const localTomorrow = tomorrowDate.toISOString().split('T')[0];

    if (dateString < localToday) return { color: '#ff4444', text: '(Vencida)' }; 
    if (dateString === localToday) return { color: '#ffbb33', text: '(Vence Hoy)' }; 
    if (dateString === localTomorrow) return { color: '#ffbb33', text: '(Vence Mañana)' }; 

    return { color: '#888', text: null };
  };

  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase();
    const matchTitle = task.description.toLowerCase().includes(term);
    const matchDetails = task.details ? task.details.toLowerCase().includes(term) : false;
    return matchTitle || matchDetails;
  });

  const highTasks = filteredTasks.filter(t => t.priority === 'alta');
  const normalTasks = filteredTasks.filter(t => t.priority === 'normal' || !t.priority);
  const lowTasks = filteredTasks.filter(t => t.priority === 'baja');

  const renderCard = (task) => (
    <div key={task.taskId} className={`task-card priority-${task.priority || 'normal'}`}>
      <div className="task-content">
        <span className="task-title" style={{
          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
          opacity: task.status === 'completed' ? 0.5 : 1
        }}>
          {task.description}
        </span>
        
        {task.details && (
          <p className="task-desc" style={{
            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            opacity: task.status === 'completed' ? 0.5 : 1
          }}>
            {task.details}
          </p>
        )}

        {/* FECHA CON ALERTA INTELIGENTE */}
        {task.dueDate && (
          <div className="task-date" style={{ 
            color: task.status === 'completed' ? '#888' : getDateStatus(task.dueDate).color 
          }}>
            📅 {task.dueDate} 
            
            {task.status !== 'completed' && getDateStatus(task.dueDate).text && (
              <span style={{fontWeight:'bold', marginLeft:'5px'}}>
                 {getDateStatus(task.dueDate).text}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="actions">
        <button onClick={() => completeTask(task.taskId)} className="btn-icon">✅</button>
        <button onClick={() => deleteTask(task.taskId)} className="btn-icon">🗑️</button>
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <div className="user-info">
          <p>Hola, {displayName || "..."}</p> 
          <button onClick={signOut} className="btn-logout">Cerrar Sesión</button>
        </div>
        
        {/* --- CAMBIO PAGINACIÓN: Solo mostrar búsqueda si hay tareas cargadas --- */}
        <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar en tareas cargadas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
        </div>

        <h1>Lista de Tareas</h1>
        
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
              placeholder="Descripción opcional..."
              disabled={loading}
              className="input-details"
            />
            
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-date"
              disabled={loading}
            />

            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="input-priority"
              disabled={loading}
            >
              <option value="alta">🔴 Prioridad Alta</option>
              <option value="normal">🟡 Prioridad Normal</option>
              <option value="baja">🟢 Prioridad Baja</option>
            </select>

          </div>

          <button type="submit" disabled={loading} className="btn-add">
            {loading ? '...' : 'Agregar'}
          </button>
        </form>

        <div className="kanban-board">
          <div className="kanban-column col-high">
            <h3>🔴 Priorida Alta ({highTasks.length})</h3>
            <div className="column-content">
              {highTasks.map(renderCard)}
              {highTasks.length === 0 && <p className="empty-msg">Vacío</p>}
            </div>
          </div>

          <div className="kanban-column col-normal">
            <h3>🟡 Prioridad Normal ({normalTasks.length})</h3>
            <div className="column-content">
              {normalTasks.map(renderCard)}
              {normalTasks.length === 0 && <p className="empty-msg">Vacío</p>}
            </div>
          </div>

          <div className="kanban-column col-low">
            <h3>🟢 Prioridad Baja ({lowTasks.length})</h3>
            <div className="column-content">
              {lowTasks.map(renderCard)}
              {lowTasks.length === 0 && <p className="empty-msg">Vacío</p>}
            </div>
          </div>
        </div>

        {/* --- CAMBIO PAGINACIÓN: Botón "Cargar Más" --- */}
        {nextToken && (
          <div className="load-more-container" style={{ marginTop: '20px', paddingBottom: '40px' }}>
            <button 
              onClick={() => fetchTasks(nextToken, true)} 
              className="btn-add" 
              style={{ backgroundColor: '#2196F3', width: '200px' }}
              disabled={loadingMore}
            >
              {loadingMore ? 'Cargando...' : '⬇️ Cargar más tareas'}
            </button>
          </div>
        )}

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
