import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Mantenimiento() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const [completarModalOpen, setCompletarModalOpen] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState(null);
  const [costoFinal, setCostoFinal] = useState('');
  const [notasResolucion, setNotasResolucion] = useState('');
  const [completarLoading, setCompletarLoading] = useState(false);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const loggedUser = JSON.parse(userStr);
    if (loggedUser.rol !== 'Administrador') {
      navigate('/catalogo');
      return;
    }
    setTimeout(() => setUsuario(loggedUser), 0);
    fetchMantenimientos(loggedUser);
  }, [navigate]);
  async function fetchMantenimientos(userObj) {
    setLoading(true);
    setError('');
    try {
      const headers = {
        'X-Usuario-ID': userObj.usuarioID.toString(),
        'X-Usuario-Nombre': userObj.nombre,
        'X-Usuario-Rol': userObj.rol
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/mantenimiento`, {
        credentials: 'include', headers
      });
      if (!response.ok) {
        let msg = 'Error al cargar la lista de mantenimiento';
        try {
          const errData = await response.json();
          if (errData.mensaje) msg = errData.mensaje;
        } catch { }
        throw new Error(msg);
      }
      const data = await response.json();
      setMantenimientos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  const openCompletarModal = (maint) => {
    setSelectedMaint(maint);
    setCostoFinal(maint.costo || 0);
    setNotasResolucion('');
    setCompletarModalOpen(true);
  };
  const handleCompletarSubmit = async (e) => {
    e.preventDefault();
    setCompletarLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/mantenimiento/completar/${selectedMaint.mantenimientoID}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        body: JSON.stringify({ costo: parseFloat(costoFinal || 0) }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al completar el mantenimiento');
      alert(data.mensaje || 'Mantenimiento completado');
      setCompletarModalOpen(false);
      fetchMantenimientos(usuario);
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletarLoading(false);
    }
  };
  function getStatusChipClass(estado) {
    switch (estado) {
      case 'Pendiente': return 'bg-[#fef3c7] text-[#d97706]';
      case 'Aprobado': return 'bg-[#e0e7ff] text-[#4f46e5]';
      case 'EnUso': return 'bg-[#dbeafe] text-[#2563eb]';
      case 'Devuelto': return 'bg-[#dcfce3] text-[#16a34a]';
      case 'Rechazado': return 'bg-[#fef2f2] text-[#ef4444]';
      case 'EnProceso': return 'bg-[#fef3c7] text-[#d97706] border border-[#fde68a]';
      case 'Completado': return 'bg-[#dcfce3] text-[#16a34a] border border-[#bbf7d0]';
      default: return 'bg-[#f1f5f9] text-[#64748b]';
    }
  }
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
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </button>
          <button
            onClick={() => navigate('/catalogo')}
            className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            Catálogo
          </button>
          <button
            onClick={() => navigate('/aprobaciones')}
            className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
            Aprobaciones
          </button>
          <button className="flex items-center gap-3 bg-[#4f46e5] text-white p-3 rounded-xl text-left transition-colors text-sm font-medium shadow-sm">
            <span className="material-symbols-outlined text-[20px]">build</span>
            Mantenimiento
          </button>
          <button
            onClick={() => navigate('/historial')}
            className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            Historial
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
            <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] mb-2">Mantenimiento Técnico</h1>
            <p className="text-sm text-[#64748b]">Gestión y seguimiento de equipos en reparación activa.</p>
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
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
              <h2 className="text-lg font-bold text-[#0f172a]">Equipos en Reparación</h2>
              <span className="bg-[#fef2f2] text-[#ef4444] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-[#fca5a5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span> {mantenimientos.length} Activos
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Equipo</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Diagnóstico</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Técnico Asignado</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider text-right">Costo Preliminar</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#64748b] uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {mantenimientos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-[#64748b] text-sm">
                        No hay equipos registrados en mantenimiento activo en este momento.
                      </td>
                    </tr>
                  ) : (
                    mantenimientos.map((m) => (
                      <tr key={m.mantenimientoID} className="hover:bg-[#f8fafc] transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#4f46e5]">
                              <span className="material-symbols-outlined">build</span>
                            </div>
                            <div>
                              <p className="font-bold text-[#0f172a] text-sm leading-tight">{m.nombreEquipo}</p>
                              <p className="text-xs text-[#64748b] mt-0.5">ID: #TLM-{m.mantenimientoID}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#0f172a] max-w-[300px] truncate" title={m.diagnostico}>
                          {m.diagnostico}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[10px] font-bold text-[#64748b] shrink-0">
                              {m.tecnico?.substring(0,2).toUpperCase() || 'AS'}
                            </div>
                            <span className="text-sm text-[#0f172a] font-medium">{m.tecnico || 'Asignado (Auto)'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-semibold text-[#0f172a]">
                          S/ {m.costo.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusChipClass(m.estado)}`}>
                            {m.estado}
                          </span>
                          {m.estado === 'EnProceso' && (
                            <button
                              onClick={() => openCompletarModal(m)}
                              className="bg-[#4f46e5] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#4338ca] transition-colors shadow-sm"
                            >
                              Finalizar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      {completarModalOpen && selectedMaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm transition-opacity" onClick={() => setCompletarModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e2e8f0] w-full max-w-[400px] relative z-10 transform transition-all overflow-hidden">
            <div className="p-6 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4f46e5]">task_alt</span>
                Finalizar Mantenimiento
              </h3>
              <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors" onClick={() => setCompletarModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCompletarSubmit}>
              <div className="p-6 flex flex-col gap-5">
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#4f46e5]">
                    <span className="material-symbols-outlined text-2xl">devices</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] text-sm leading-tight">{selectedMaint.nombreEquipo}</p>
                    <p className="text-xs text-[#64748b] mt-1">ID: #TLM-{selectedMaint.mantenimientoID} • EQ: {selectedMaint.equipoID}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Costo Final (S/.)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">S/</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={costoFinal}
                        onChange={(e) => setCostoFinal(e.target.value)}
                        className="min-input bg-white pl-9"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Notas de Resolución</label>
                    <textarea
                      value={notasResolucion}
                      onChange={(e) => setNotasResolucion(e.target.value)}
                      className="min-input bg-white h-24 resize-none"
                      placeholder="Detalles del trabajo realizado..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex gap-2 mt-2">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-medium hover:bg-[#f1f5f9] transition-colors"
                  onClick={() => setCompletarModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={completarLoading}
                  className="flex-1 py-2 bg-[#0f172a] text-white rounded-xl text-sm font-medium hover:bg-[#1e293b] shadow-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {completarLoading ? 'Guardando...' : 'Marcar Disponible'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
