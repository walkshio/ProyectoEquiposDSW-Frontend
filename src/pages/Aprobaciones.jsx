import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Aprobaciones() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [pendientes, setPendientes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('Equipo no disponible');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [declineLoading, setDeclineLoading] = useState(false);
  const [fechaDevolucion, setFechaDevolucion] = useState(new Date().toISOString().split('T')[0]);
  const [condicion, setCondicion] = useState('Bueno - Sin incidentes');
  const [multaDanio, setMultaDanio] = useState(0);
  const [incidencia, setIncidencia] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  async function fetchData(userObj) {
    setLoading(true);
    setError('');
    try {
      const headers = {
        'X-Usuario-ID': userObj.usuarioID.toString(),
        'X-Usuario-Nombre': userObj.nombre,
        'X-Usuario-Rol': userObj.rol
      };
      const resPend = await fetch('https://localhost:7124/api/prestamos/pendientes', { credentials: 'include', headers });
      if (!resPend.ok) throw new Error('Error al cargar solicitudes pendientes');
      const dataPend = await resPend.json();
      setPendientes(dataPend || []);
      const resAct = await fetch('https://localhost:7124/api/prestamos/en-uso', { credentials: 'include', headers });
      if (!resAct.ok) throw new Error('Error al cargar préstamos activos');
      const dataAct = await resAct.json();
      setActivos(dataAct || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
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
    fetchData(loggedUser);
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  const handleApprove = async (id) => {
    if (!window.confirm('¿Está seguro de aprobar esta solicitud?')) return;
    try {
      const response = await fetch(`https://localhost:7124/api/prestamos/aprobar/${id}`, {
        method: 'POST',
        headers: {
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al aprobar la solicitud');
      alert('Solicitud aprobada con éxito');
      fetchData(usuario);
    } catch (err) {
      alert(err.message);
    }
  };
  const openDeclineModal = (loan) => {
    setSelectedLoan(loan);
    setMotivoRechazo('Equipo no disponible');
    setNotasAdicionales('');
    setDeclineModalOpen(true);
  };
  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    setDeclineLoading(true);
    const motivoFinal = notasAdicionales ? `${motivoRechazo}: ${notasAdicionales}` : motivoRechazo;
    try {
      const response = await fetch(`https://localhost:7124/api/prestamos/rechazar/${selectedLoan.prestamoID}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        body: JSON.stringify({ motivoRechazo: motivoFinal }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al declinar la solicitud');
      alert('Solicitud declinada con éxito');
      setDeclineModalOpen(false);
      fetchData(usuario);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeclineLoading(false);
    }
  };
  const handleDeliver = async (id) => {
    if (!window.confirm('¿Está seguro de registrar la entrega física de este equipo?')) return;
    try {
      const response = await fetch(`https://localhost:7124/api/prestamos/entregar/${id}`, {
        method: 'POST',
        headers: {
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al entregar el equipo');
      alert('Equipo entregado con éxito. Ahora se encuentra en estado En Uso.');
      fetchData(usuario);
    } catch (err) {
      alert(err.message);
    }
  };
  const openReturnModal = (loan) => {
    setSelectedLoan(loan);
    setFechaDevolucion(new Date().toISOString().split('T')[0]);
    setCondicion('Bueno - Sin incidentes');
    setMultaDanio(0);
    setIncidencia('');
    setReturnModalOpen(true);
  };
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnLoading(true);
    const notaFinal = incidencia ? `${condicion}: ${incidencia}` : condicion;
    try {
      const response = await fetch(`https://localhost:7124/api/prestamos/devolver/${selectedLoan.prestamoID}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        body: JSON.stringify({
          incidencia: notaFinal,
          multaDanio: parseFloat(multaDanio || 0)
        }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al procesar la devolución');
      alert(data.mensaje || 'Devolución procesada con éxito');
      setReturnModalOpen(false);
      fetchData(usuario);
    } catch (err) {
      alert(err.message);
    } finally {
      setReturnLoading(false);
    }
  };
  const getOverdueDetails = (fechaFin, returnDateStr) => {
    const fin = new Date(fechaFin);
    const ret = new Date(returnDateStr);
    fin.setHours(0,0,0,0);
    ret.setHours(0,0,0,0);
    const diffTime = ret - fin;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return {
        dias: diffDays,
        multa: diffDays * 5
      };
    }
    return { dias: 0, multa: 0 };
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const overdueInfo = selectedLoan ? getOverdueDetails(selectedLoan.fechaFin, fechaDevolucion) : { dias: 0, multa: 0 };
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
          <button className="flex items-center gap-3 bg-[#4f46e5] text-white p-3 rounded-xl text-left transition-colors text-sm font-medium shadow-sm">
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
            Aprobaciones
          </button>
          {usuario?.rol === 'Administrador' && (
            <button
              onClick={() => navigate('/mantenimiento')}
              className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">build</span>
              Mantenimiento
            </button>
          )}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] mb-2">Aprobaciones &amp; Devoluciones</h1>
          <p className="text-sm text-[#64748b] max-w-2xl">
            Gestiona las solicitudes de reserva pendientes y procesa los equipos devueltos.
          </p>
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <section className="xl:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f59e0b]">pending_actions</span>
                  Solicitudes Pendientes
                </h2>
                <span className="bg-[#f1f5f9] px-2.5 py-0.5 rounded-full text-xs font-bold text-[#64748b]">
                  {pendientes.length} Ítems
                </span>
              </div>
              {pendientes.length === 0 ? (
                <div className="min-card p-6 text-center text-[#64748b] text-sm py-12">
                  No hay solicitudes pendientes o por entregar.
                </div>
              ) : (
                pendientes.map((s) => (
                  <div key={s.detalleID} className="min-card p-5 group flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#4f46e5]">
                          <span className="material-symbols-outlined text-2xl">
                            {s.tipoEquipo === 'Laptop' ? 'laptop_mac' : 
                             s.tipoEquipo === 'Monitor' ? 'monitor' : 
                             s.tipoEquipo === 'Tablet' ? 'tablet_mac' : 
                             s.tipoEquipo === 'Parlante' ? 'speaker' : 'devices'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0f172a] leading-tight">{s.nombreEquipo}</h3>
                          <p className="text-xs text-[#64748b] mt-0.5">Por: {s.nombreUsuario} ({s.correoUsuario})</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#0f172a]">Límite: {formatDate(s.fechaFin)}</p>
                        <p className="text-[10px] text-[#94a3b8] mt-0.5">Solicitado: {formatDate(s.fechaSolicitud)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#f1f5f9]">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.estado === 'Aprobado' ? 'bg-[#e0e7ff] text-[#4f46e5]' : 'bg-[#fef3c7] text-[#d97706]'}`}>
                        {s.estado === 'Aprobado' ? 'Aprobado (Espera Entrega)' : 'Esperando Evaluación'}
                      </span>
                      <div className="flex gap-2">
                        {s.estado === 'Pendiente' ? (
                          <>
                            <button
                              onClick={() => openDeclineModal(s)}
                              className="px-4 py-1.5 border border-[#ef4444] text-[#ef4444] rounded-lg text-xs font-semibold hover:bg-[#fef2f2] transition-colors"
                            >
                              Declinar
                            </button>
                            <button
                              onClick={() => handleApprove(s.prestamoID)}
                              className="px-4 py-1.5 bg-[#4f46e5] text-white rounded-lg text-xs font-semibold hover:bg-[#4338ca] transition-colors"
                            >
                              Aprobar Solicitud
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => window.open(`/contrato/${s.prestamoID}`, '_blank')}
                              className="px-3 py-1.5 border border-[#e2e8f0] text-[#4f46e5] bg-[#e0e7ff] rounded-lg text-xs font-semibold hover:bg-[#c7d2fe] transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">description</span>
                              Contrato
                            </button>
                            <button
                              onClick={() => handleDeliver(s.prestamoID)}
                              className="px-4 py-1.5 bg-[#0f172a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e293b] transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">local_shipping</span>
                              Registrar Entrega
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
            <section className="xl:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3b82f6]">assignment_return</span>
                  Préstamos Activos
                </h2>
              </div>
              <div className="min-card overflow-hidden">
                {activos.length === 0 ? (
                  <div className="p-6 text-center text-[#64748b] text-sm py-12">
                    No hay equipos en préstamo actualmente.
                  </div>
                ) : (
                  activos.map((a, i) => {
                    const hoy = new Date();
                    const isOverdue = new Date(a.fechaFin) < hoy;
                    return (
                      <div key={a.detalleID} className={`p-4 hover:bg-[#f8fafc] transition-colors flex justify-between items-center group ${i !== activos.length -1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                        <div>
                          <h4 className="text-sm font-bold text-[#0f172a] leading-tight mb-0.5">{a.nombreEquipo}</h4>
                          <p className={`text-xs ${isOverdue ? 'text-[#ef4444] font-medium' : 'text-[#64748b]'}`}>
                            ID: TLP-{a.detalleID} • Límite: {formatDate(a.fechaFin)} {isOverdue && '(Atrasado)'}
                          </p>
                          <p className="text-[10px] text-[#94a3b8] mt-0.5">Usuario: {a.nombreUsuario}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => window.open(`/contrato/${a.prestamoID}`, '_blank')}
                            className="px-3 py-1.5 border border-[#e2e8f0] text-[#4f46e5] bg-[#e0e7ff] rounded-lg text-xs font-semibold hover:bg-[#c7d2fe]"
                          >
                            Contrato
                          </button>
                          <button
                            onClick={() => openReturnModal(a)}
                            className="px-3 py-1.5 border border-[#e2e8f0] text-[#0f172a] bg-white rounded-lg text-xs font-semibold hover:border-[#0f172a]"
                          >
                            Procesar Retorno
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </main>
      {declineModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm transition-opacity" onClick={() => setDeclineModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e2e8f0] w-full max-w-[400px] p-6 relative z-10 transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-[#0f172a]">Declinar Solicitud</h3>
              <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors" onClick={() => setDeclineModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleDeclineSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Motivo Principal</label>
                <select
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  className="min-input bg-white"
                >
                  <option>Equipo no disponible</option>
                  <option>Justificación insuficiente</option>
                  <option>Conflicto de calendario</option>
                  <option>Otros motivos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Notas Adicionales (Opcional)</label>
                <textarea
                  value={notasAdicionales}
                  onChange={(e) => setNotasAdicionales(e.target.value)}
                  className="min-input bg-white h-24 resize-none"
                  placeholder="Explique el motivo detalladamente..."
                ></textarea>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-medium hover:bg-[#f1f5f9] transition-colors"
                  onClick={() => setDeclineModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={declineLoading}
                  className="flex-1 py-2 rounded-xl bg-[#ef4444] text-white text-sm font-medium hover:bg-[#dc2626] shadow-sm transition-all disabled:opacity-50"
                >
                  {declineLoading ? 'Procesando...' : 'Confirmar Declinar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {returnModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm transition-opacity" onClick={() => setReturnModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e2e8f0] w-full max-w-[500px] p-6 relative z-10 transform transition-all">
            <div className="flex justify-between items-start mb-4 border-b border-[#e2e8f0] pb-3">
              <h3 className="text-lg font-bold text-[#0f172a]">Retorno: TLP-{selectedLoan.detalleID}</h3>
              <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors" onClick={() => setReturnModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReturnSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Real Devolución</label>
                  <input
                    type="date"
                    value={fechaDevolucion}
                    onChange={(e) => setFechaDevolucion(e.target.value)}
                    className="min-input bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Programada</label>
                  <input
                    type="date"
                    disabled
                    value={selectedLoan.fechaFin.split('T')[0]}
                    className="min-input bg-[#f8fafc] text-[#94a3b8]"
                  />
                </div>
              </div>
              {overdueInfo.multa > 0 && (
                <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[#ef4444] font-bold">Multa por Retraso Aplicable</p>
                    <p className="text-xs text-[#b91c1c]">{overdueInfo.dias} Días de atraso (S/. 5.00/día)</p>
                  </div>
                  <span className="text-xl font-bold text-[#ef4444]">S/ {overdueInfo.multa.toFixed(2)}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Estado de Recepción</label>
                <select
                  value={condicion}
                  onChange={(e) => setCondicion(e.target.value)}
                  className="min-input bg-white mb-2"
                >
                  <option>Bueno - Sin incidentes</option>
                  <option>Regular - Desgaste menor</option>
                  <option>Dañado - Requiere mantenimiento técnico</option>
                  <option>Accesorios faltantes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Multa por Daño Técnico (S/.)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">S/</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={multaDanio}
                    onChange={(e) => setMultaDanio(e.target.value)}
                    className="min-input bg-white pl-9"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-[#64748b] mt-1.5">
                  Si hay daño, el equipo se moverá a Mantenimiento.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Incidencia / Notas</label>
                <textarea
                  value={incidencia}
                  onChange={(e) => setIncidencia(e.target.value)}
                  className="min-input bg-white h-20 resize-none"
                  placeholder="Detalles sobre ralladuras, cables faltantes, etc..."
                ></textarea>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-medium hover:bg-[#f1f5f9] transition-colors"
                  onClick={() => setReturnModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={returnLoading}
                  className="flex-1 py-2 bg-[#0f172a] text-white rounded-xl text-sm font-medium hover:bg-[#1e293b] shadow-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {returnLoading ? 'Procesando...' : 'Finalizar Retorno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
