import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Historial() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  async function fetchHistorial(userObj) {
    setLoading(true);
    setError('');
    try {
      const headers = {
        'X-Usuario-ID': userObj.usuarioID.toString(),
        'X-Usuario-Nombre': userObj.nombre,
        'X-Usuario-Rol': userObj.rol
      };
      const endpoint = userObj.rol === 'Administrador' 
        ? 'https://localhost:7124/api/prestamos/todos' 
        : `https://localhost:7124/api/prestamos/usuario`;
      const response = await fetch(endpoint, { credentials: 'include', headers });
      if (!response.ok) throw new Error('Error al cargar el historial');
      const data = await response.json();
      setSolicitudes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const loggedUser = JSON.parse(userStr);
    setTimeout(() => setUsuario(loggedUser), 0);
    fetchHistorial(loggedUser);
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  const handleConfirmarEntrega = async (id) => {
    if (!window.confirm('¿Está seguro de confirmar que ha recibido el equipo?')) return;
    try {
      const response = await fetch(`https://localhost:7124/api/prestamos/confirmar-entrega/${id}`, {
        method: 'POST',
        headers: {
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al confirmar la entrega');
      alert('Entrega confirmada con éxito. El equipo ahora está En Uso.');
      fetchHistorial(usuario);
    } catch (err) {
      alert(err.message);
    }
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const totalPrestamos = solicitudes.length;
  const activos = solicitudes.filter(s => s.estado === 'EnUso').length;
  const hoy = new Date();
  const atrasados = solicitudes.filter(s => s.estado === 'EnUso' && new Date(s.fechaFin) < hoy).length;
  const multasAcumuladas = solicitudes.reduce((acc, curr) => acc + curr.multa + curr.multaDanio, 0);
  const getStatusChipClass = (estado, fechaFin) => {
    const parsedState = estado ? estado.toLowerCase() : '';
    if (parsedState === 'pendiente') return 'status-chip-pending';
    if (parsedState === 'aprobado') return 'status-chip-approved';
    if (parsedState === 'enuso') {
      const isOverdue = new Date(fechaFin) < hoy;
      return isOverdue ? 'status-chip-overdue' : 'status-chip-pending';
    }
    if (parsedState === 'devuelto') return 'status-chip-returned';
    return 'bg-surface-variant text-on-surface-variant';
  };
  const getStatusLabel = (estado, fechaFin) => {
    const parsedState = estado ? estado.toLowerCase() : '';
    if (parsedState === 'pendiente') return 'Pendiente Aprobación';
    if (parsedState === 'aprobado') return 'Aprobado (Por retirar)';
    if (parsedState === 'enuso') {
      const isOverdue = new Date(fechaFin) < hoy;
      return isOverdue ? 'Atrasado' : 'En Uso';
    }
    if (parsedState === 'devuelto') return 'Devuelto';
    return estado || 'Desconocido';
  };
  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen antialiased flex flex-col md:flex-row">
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center mr-2 text-[#64748b]"><span className="material-symbols-outlined">menu</span></button>
          <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#4f46e5] text-xl">devices</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-[#e2e8f0] flex items-center justify-center bg-[#f1f5f9] text-[#4f46e5] font-bold text-xs">
            {usuario?.nombre?.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </nav>
      <aside className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-[#e2e8f0] z-40 flex flex-col py-6 px-4 transition-transform duration-300 ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">{usuario?.nombre}</h3>
            <p className="text-xs text-[#64748b]">{usuario?.rol}</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {usuario?.rol === 'Administrador' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Dashboard
            </button>
          )}
          <button
            onClick={() => navigate('/catalogo')}
            className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            Catálogo
          </button>
          {usuario?.rol === 'Administrador' && (
            <>
              <button
                onClick={() => navigate('/aprobaciones')}
                className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
                Aprobaciones
              </button>
              <button
                onClick={() => navigate('/mantenimiento')}
                className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">build</span>
                Mantenimiento
              </button>
            </>
          )}
          <button className="flex items-center gap-3 bg-[#4f46e5] text-white p-3 rounded-xl text-left transition-colors text-sm font-medium shadow-sm">
            <span className="material-symbols-outlined text-[20px]">history</span>
            {usuario?.rol === 'Administrador' ? 'Historial' : 'Mis Solicitudes'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-[#ef4444] p-3 hover:bg-[#fef2f2] rounded-xl text-left transition-colors text-sm font-medium mt-auto"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Salir
          </button>
        </nav>
      </aside>
      {menuAbierto && (
        <div 
          className="fixed inset-0 top-16 bg-[#0f172a]/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}
      <main className="pt-24 px-6 md:pl-72 md:pr-8 pb-12 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] mb-2">
              {usuario?.rol === 'Administrador' ? 'Historial' : 'Mis Solicitudes'}
            </h1>
            <p className="text-sm text-[#64748b]">
              {usuario?.rol === 'Administrador' 
                ? 'Revisa el estado de todos tus préstamos anteriores y actuales.' 
                : 'Haz seguimiento al estado de tus solicitudes de préstamo.'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="min-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] text-[#64748b] flex items-center justify-center">
                <span className="material-symbols-outlined">devices</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a] mb-1 leading-none">{totalPrestamos}</div>
              <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Históricos</div>
            </div>
          </div>
          <div className="min-card p-6 flex flex-col justify-between border-l-4 border-l-[#3b82f6]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a] mb-1 leading-none">{activos}</div>
              <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Activos</div>
            </div>
          </div>
          <div className="min-card p-6 flex flex-col justify-between border-l-4 border-l-[#ef4444]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#fef2f2] text-[#ef4444] flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a] mb-1 leading-none">{atrasados}</div>
              <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Atrasados</div>
            </div>
          </div>
          <div className="min-card p-6 flex flex-col justify-between bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a] mb-1 leading-none">S/ {multasAcumuladas.toFixed(2)}</div>
              <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Multas Acumuladas</div>
            </div>
          </div>
        </div>
        {error && (
          <div className="badge-error w-full text-center py-3 mb-6 block">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5]"></div>
          </div>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Equipo</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">ID Ref</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Solicitud</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Límite</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Estado</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider text-right">Multa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {solicitudes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-[#64748b] text-sm">
                        No hay historial de préstamos para mostrar.
                      </td>
                    </tr>
                  ) : (
                    solicitudes.map((s) => {
                      const isOverdue = new Date(s.fechaFin) < hoy && s.estado === 'EnUso';
                      const badgeClass = getStatusChipClass(s.estado);
                      return (
                      <tr key={s.detalleID} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#4f46e5]">
                              <span className="material-symbols-outlined text-xl">
                                {s.tipoEquipo === 'Laptop' ? 'laptop_mac' : 
                                 s.tipoEquipo === 'Monitor' ? 'monitor' : 
                                 s.tipoEquipo === 'Tablet' ? 'tablet_mac' : 
                                 s.tipoEquipo === 'Parlante' ? 'speaker' : 'devices'}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-[#0f172a] text-sm leading-tight">{s.nombreEquipo}</p>
                              <p className="text-xs text-[#64748b] mt-0.5">{s.tipoEquipo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#64748b] font-medium">#REQ-{s.detalleID}</td>
                        <td className="py-4 px-6 text-sm text-[#0f172a]">{formatDate(s.fechaSolicitud)}</td>
                        <td className={`py-4 px-6 text-sm ${isOverdue ? 'text-[#ef4444] font-semibold' : 'text-[#0f172a]'}`}>
                          {formatDate(s.fechaFin)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={badgeClass}>
                            {getStatusLabel(s.estado, s.fechaFin)}
                          </span>
                          {s.estado === 'Rechazado' && s.motivoRechazo && (
                            <p className="text-[10px] text-[#ef4444] mt-1.5 max-w-[200px] truncate" title={s.motivoRechazo}>
                              {s.motivoRechazo}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 items-center">
                            {s.estado !== 'Rechazado' && s.estado !== 'Pendiente' && (
                              <button onClick={() => window.open(`/contrato/${s.prestamoID}`, '_blank')} className="text-[11px] text-[#4f46e5] font-semibold hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">description</span>
                                Ver Contrato
                              </button>
                            )}
                            {s.estado === 'Aprobado' && usuario?.rol !== 'Administrador' && (
                              <button onClick={() => handleConfirmarEntrega(s.prestamoID)} className="text-[11px] text-[#16a34a] font-semibold hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Confirmar Entrega
                              </button>
                            )}
                          </div>
                        </td>
                        <td className={`py-4 px-6 text-sm text-right ${s.multa + s.multaDanio > 0 ? 'text-[#ef4444] font-bold' : 'text-[#64748b]'}`}>
                          {s.multa + s.multaDanio > 0 ? `S/ ${(s.multa + s.multaDanio).toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
