import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Dashboard() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [kpis, setKpis] = useState({
    TotalEquipos: 0,
    Disponibles: 0,
    Reservados: 0,
    EnUso: 0,
    Mantenimiento: 0,
    TotalMultas: 0
  });
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  async function fetchDashboardData(userObj) {
    setLoading(true);
    setError('');
    try {
      const headers = {
        'X-Usuario-ID': userObj.usuarioID.toString(),
        'X-Usuario-Nombre': userObj.nombre,
        'X-Usuario-Rol': userObj.rol
      };
      const response = await fetch('https://localhost:7124/api/equipos/dashboard', {
        credentials: 'include', headers
      });
      if (!response.ok) throw new Error('Error al cargar datos del panel de administración');
      const data = await response.json();
      if (data.kpis) {
        setKpis(data.kpis);
      }
      setActividades(data.actividades || []);
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
    if (loggedUser.rol !== 'Administrador') {
      navigate('/catalogo');
      return;
    }
    setTimeout(() => setUsuario(loggedUser), 0);
    fetchDashboardData(loggedUser);
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const total = kpis.TotalEquipos || 1;
  const disponiblesPct = Math.round((kpis.Disponibles / total) * 100);
  const enPrestamoPct = Math.round(((kpis.Reservados + kpis.EnUso) / total) * 100);
  const mantenimientoPct = Math.round((kpis.Mantenimiento / total) * 100);
  const getActivityDetails = (act) => {
    const estado = act.EstadoDetalle ? act.EstadoDetalle.toLowerCase() : '';
    if (estado === 'pendiente') {
      return {
        text: `Solicitud de ${act.Equipo} registrada por ${act.Usuario}`,
        icon: 'pending_actions',
        colorClass: 'bg-amber-100 text-amber-700'
      };
    }
    if (estado === 'aprobado') {
      return {
        text: `Solicitud de ${act.Equipo} aprobada para ${act.Usuario} (Por retirar)`,
        icon: 'check_circle',
        colorClass: 'bg-blue-100 text-blue-700'
      };
    }
    if (estado === 'enuso') {
      return {
        text: `${act.Equipo} entregado físicamente a ${act.Usuario}`,
        icon: 'arrow_outward',
        colorClass: 'bg-primary/10 text-primary'
      };
    }
    if (estado === 'devuelto') {
      const damageText = act.MultaDanio > 0 ? ` (Incidencia: S/. ${act.MultaDanio.toFixed(2)})` : '';
      return {
        text: `${act.Equipo} devuelto por ${act.Usuario}${damageText}`,
        icon: 'keyboard_return',
        colorClass: 'bg-slate-100 text-slate-700'
      };
    }
    return {
      text: `Transacción #${act.DetalleID} de ${act.Equipo} por ${act.Usuario}`,
      icon: 'sync_alt',
      colorClass: 'bg-slate-100 text-slate-700'
    };
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
          <button className="flex items-center gap-3 bg-[#4f46e5] text-white p-3 rounded-xl text-left transition-colors text-sm font-medium shadow-sm">
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
          <button
            onClick={() => navigate('/mantenimiento')}
            className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
          >
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
            <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] mb-2">Resumen General</h1>
            <p className="text-sm text-[#64748b]">Estado del sistema y salud del inventario.</p>
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
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="min-card p-6 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#4f46e5]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#4f46e5]/10 transition-colors"></div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Inventario Total</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5]">
                    <span className="material-symbols-outlined text-sm">devices</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-auto">
                  <span className="text-4xl font-bold text-[#0f172a] tracking-tight">{kpis.TotalEquipos}</span>
                  <span className="text-sm font-semibold text-[#4f46e5]">Equipos</span>
                </div>
              </div>
              <div className="min-card p-6 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#10b981]/10 transition-colors"></div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Disponibles</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-auto">
                  <span className="text-4xl font-bold text-[#0f172a] tracking-tight">{kpis.Disponibles}</span>
                  <span className="text-sm font-bold text-[#10b981]">Equipos</span>
                </div>
              </div>
              <div className="min-card p-6 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#f59e0b]/10 transition-colors"></div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">En Reparación</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                    <span className="material-symbols-outlined text-sm">build</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-auto">
                  <span className="text-4xl font-bold text-[#0f172a] tracking-tight">{kpis.Mantenimiento}</span>
                  <span className="text-sm font-bold text-[#f59e0b]">Equipos</span>
                </div>
              </div>
              <div className="min-card p-6 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ef4444]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#ef4444]/10 transition-colors"></div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Multas Totales</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444]">
                    <span className="material-symbols-outlined text-sm">warning</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-auto">
                  <span className="text-4xl font-bold text-[#0f172a] tracking-tight">S/ {kpis.TotalMultas.toFixed(2)}</span>
                  <span className="text-sm font-semibold text-[#ef4444]">Recaudado</span>
                </div>
              </div>
            </section>
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 min-card p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0f172a] mb-1">Estado del Inventario</h2>
                  <p className="text-sm text-[#64748b]">Distribución actual de equipos.</p>
                </div>
                <div className="mt-8 flex flex-col items-center justify-center">
                  <div 
                    className="relative w-48 h-48 rounded-full shadow-sm" 
                    style={{
                      background: `conic-gradient(
                        #4f46e5 0% ${disponiblesPct}%, 
                        #94a3b8 ${disponiblesPct}% ${disponiblesPct + enPrestamoPct}%, 
                        #f59e0b ${disponiblesPct + enPrestamoPct}% 100%
                      )`
                    }}
                  >
                    <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <div className="text-center">
                        <span className="block text-3xl font-black text-[#0f172a]">{total}</span>
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Total</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4f46e5]"></div>
                      <span className="text-sm font-medium text-[#64748b]">Disponibles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#94a3b8]"></div>
                      <span className="text-sm font-medium text-[#64748b]">En Préstamo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                      <span className="text-sm font-medium text-[#64748b]">Mantenimiento</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-card p-6 flex flex-col">
                <div className="mb-6 pb-4 border-b border-[#e2e8f0]">
                  <h2 className="text-lg font-bold text-[#0f172a]">Actividad Reciente</h2>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-[400px]">
                  {actividades.length === 0 ? (
                    <div className="text-center text-[#64748b] py-12 text-sm">
                      No hay transacciones registradas recientemente.
                    </div>
                  ) : (
                    actividades.map((act) => {
                      const details = getActivityDetails(act);
                      return (
                        <div key={act.DetalleID} className="flex gap-4 items-start group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                            details.icon === 'pending_actions' ? 'bg-[#fef3c7] border-[#fde68a] text-[#d97706]' :
                            details.icon === 'check_circle' ? 'bg-[#e0e7ff] border-[#c7d2fe] text-[#4f46e5]' :
                            details.icon === 'arrow_outward' ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#16a34a]' :
                            'bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b]'
                          }`}>
                            <span className="material-symbols-outlined text-[18px]">{details.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0f172a] leading-tight">{details.text}</p>
                            <p className="text-xs text-[#64748b] mt-1 font-mono text-[11px]">Ref: #TLP-{act.DetalleID} • {formatDate(act.FechaDevolucion || act.FechaInicio || act.FechaFin)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
