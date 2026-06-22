import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Catalogo() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [fechaFin, setFechaFin] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalAdminAbierto, setModalAdminAbierto] = useState(false);
  const [equipoEdit, setEquipoEdit] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', categoriaID: '', estado: 'Disponible' });
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const navigate = useNavigate();
  async function fetchCatalog(categoryName) {
    setLoading(true);
    setError('');
    try {
      const url = `https://localhost:7124/api/equipos?tipoEquipo=${categoryName === 'Todos' ? '' : categoryName}`;
      const headers = usuario ? {
        'X-Usuario-ID': usuario.usuarioID.toString(),
        'X-Usuario-Nombre': usuario.nombre,
        'X-Usuario-Rol': usuario.rol
      } : {};
      const response = await fetch(url, { credentials: 'include', headers });
      if (!response.ok) throw new Error('Error al cargar catálogo');
      const data = await response.json();
      setEquipos(data.equipos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  async function fetchCategorias() {
    try {
      const response = await fetch('https://localhost:7124/api/equipos/categorias', { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategorias(data || []);
    } catch (err) {
      console.error(err);
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
    fetchCatalog(categoriaSeleccionada);
    fetchCategorias();
  }, [navigate]);
  const handleCategoryChange = (categoryName) => {
    setCategoriaSeleccionada(categoryName);
    fetchCatalog(categoryName);
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  const openLoanModal = (equipo) => {
    setEquipoSeleccionado(equipo);
    setFechaFin('');
    setModalError('');
    setModalSuccess('');
    setModalAbierto(true);
  };
  const closeLoanModal = () => {
    setModalAbierto(false);
    setEquipoSeleccionado(null);
  };
  const handleRequestLoanSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setModalLoading(true);
    try {
      const response = await fetch('https://localhost:7124/api/prestamos/solicitar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        credentials: 'include',
        body: JSON.stringify({
          equipoID: equipoSeleccionado.equipoID,
          fechaFin: fechaFin
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al procesar solicitud');
      }
      setModalSuccess('¡Solicitud registrada exitosamente!');
      fetchCatalog(categoriaSeleccionada);
      setTimeout(() => {
        closeLoanModal();
      }, 1500);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };
  const openAdminModal = (equipo = null) => {
    setEquipoEdit(equipo);
    if (equipo) {
      setFormData({ nombre: equipo.nombre, categoriaID: equipo.categoriaID, estado: equipo.estado });
    } else {
      setFormData({ nombre: '', categoriaID: categorias.length > 0 ? categorias[0].categoriaID : '', estado: 'Disponible' });
    }
    setImagenArchivo(null);
    setModalError('');
    setModalSuccess('');
    setModalAdminAbierto(true);
  };
  const closeAdminModal = () => {
    setModalAdminAbierto(false);
    setEquipoEdit(null);
  };
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      const form = new FormData();
      form.append('Nombre', formData.nombre);
      form.append('CategoriaID', formData.categoriaID);
      form.append('Estado', formData.estado);
      if (imagenArchivo) {
        form.append('imagenArchivo', imagenArchivo);
      }
      const url = equipoEdit ? `https://localhost:7124/api/equipos/${equipoEdit.equipoID}` : 'https://localhost:7124/api/equipos';
      const method = equipoEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        credentials: 'include',
        body: form
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al guardar equipo');
      setModalSuccess(equipoEdit ? 'Equipo actualizado exitosamente' : 'Equipo creado exitosamente');
      fetchCatalog(categoriaSeleccionada);
      setTimeout(() => closeAdminModal(), 1500);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este equipo?')) return;
    try {
      const response = await fetch(`https://localhost:7124/api/equipos/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Usuario-ID': usuario.usuarioID.toString(),
          'X-Usuario-Nombre': usuario.nombre,
          'X-Usuario-Rol': usuario.rol
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al eliminar equipo');
      fetchCatalog(categoriaSeleccionada);
    } catch(err) {
      alert(err.message);
    }
  };
  const equiposFiltrados = equipos.filter(e =>
    e.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );
  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Disponible':
        return <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-green-200 shadow-sm backdrop-blur-md">Disponible</span>;
      case 'Prestado':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-amber-200 shadow-sm backdrop-blur-md">Reservado</span>;
      case 'EnUso':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-blue-200 shadow-sm backdrop-blur-md">En Uso</span>;
      case 'Mantenimiento':
        return <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-red-200 shadow-sm backdrop-blur-md">Mantenimiento</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-slate-200 shadow-sm backdrop-blur-md">{estado}</span>;
    }
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
        <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xl">search</span>
            <input
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full bg-[#f1f5f9] border border-transparent rounded-full py-2 pl-10 pr-4 text-[#0f172a] text-sm focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
              placeholder="Buscar equipos..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-[#e2e8f0] flex items-center justify-center bg-[#f1f5f9] text-[#4f46e5] font-bold text-xs ml-2">
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
          <button className="flex items-center gap-3 bg-[#4f46e5] text-white p-3 rounded-xl text-left transition-colors text-sm font-medium shadow-sm">
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
          <button
            onClick={() => navigate('/historial')}
            className="flex items-center gap-3 text-[#64748b] p-3 hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl text-left transition-colors text-sm font-medium"
          >
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] mb-2">Equipos</h1>
          <p className="text-sm text-[#64748b] max-w-2xl mb-8">
            Encuentra y solicita el hardware que necesitas para tu trabajo.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('Todos')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  categoriaSeleccionada === 'Todos'
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] hover:text-[#0f172a]'
                }`}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.categoriaID}
                  onClick={() => handleCategoryChange(cat.nombre)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    categoriaSeleccionada === cat.nombre
                      ? 'bg-[#0f172a] text-white shadow-sm'
                      : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] hover:text-[#0f172a]'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
            {usuario?.rol === 'Administrador' && (
              <button 
                onClick={() => openAdminModal()}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Añadir Equipo
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5]"></div>
          </div>
        ) : error ? (
          <div className="badge-error p-4 text-center max-w-lg">
            {error}
          </div>
        ) : equiposFiltrados.length === 0 ? (
          <div className="text-center py-20 text-[#64748b] text-sm">
            No se encontraron resultados para tu búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equiposFiltrados.map((equipo) => {
              const isAvailable = equipo.estado === 'Disponible';
              return (
                <div
                  key={equipo.equipoID}
                  className={`min-card flex flex-col overflow-hidden ${!isAvailable && 'opacity-60 grayscale'}`}
                >
                  <div className="relative h-48 bg-white flex items-center justify-center p-6 border-b border-[#e2e8f0]/50 group">
                    <div className="absolute top-3 right-3 z-10">
                      {getStatusBadge(equipo.estado)}
                    </div>
                    {equipo.imagen ? (
                      <img
                        alt={equipo.nombre}
                        className={`w-full h-full object-contain transition-transform duration-500 ${isAvailable && 'group-hover:scale-110'}`}
                        src={equipo.imagen ? (equipo.imagen.startsWith('/') ? `https://localhost:7124${equipo.imagen}` : equipo.imagen) : ''}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-[#cbd5e1]">computer</span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 bg-[#fafafa]">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#4f46e5] mb-1">
                      {equipo.tipo}
                    </span>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0f172a] leading-tight">
                        {equipo.nombre}
                      </h3>
                      {usuario?.rol === 'Administrador' && (
                        <div className="flex gap-1">
                          <button onClick={() => openAdminModal(equipo)} className="text-[#64748b] hover:text-[#4f46e5] bg-white border border-[#e2e8f0] rounded p-1" title="Editar">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleEliminar(equipo.equipoID)} className="text-[#ef4444] hover:bg-[#fef2f2] border border-[#fca5a5] rounded p-1 bg-white" title="Eliminar">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#64748b] mb-4 flex-1">
                      Serie ID: #{equipo.equipoID.toString().padStart(4, '0')}
                    </p>
                    {usuario?.rol !== 'Administrador' && (
                      <button
                        onClick={() => isAvailable && openLoanModal(equipo)}
                        disabled={!isAvailable}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                          isAvailable 
                          ? 'bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-[#0f172a] hover:bg-[#0f172a] hover:text-white shadow-sm' 
                          : 'bg-transparent border border-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
                        }`}
                      >
                        {isAvailable ? 'Solicitar' : 'No Disponible'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      {modalAbierto && equipoSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm transition-opacity" onClick={closeLoanModal}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e2e8f0] w-full max-w-[400px] p-6 relative z-10 transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#0f172a] text-lg">calendar_month</span>
                </div>
                <h2 className="text-lg font-bold text-[#0f172a]">Solicitar Equipo</h2>
              </div>
              <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors" onClick={closeLoanModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 mb-5">
              <p className="text-xs text-[#64748b]">Equipo seleccionado:</p>
              <p className="text-sm font-bold text-[#0f172a]">{equipoSeleccionado.nombre}</p>
            </div>
            <form onSubmit={handleRequestLoanSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Devolución Esperada</label>
                <input
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="min-input bg-white"
                  type="date"
                  required
                />
              </div>
              {modalError && (
                <div className="badge-error text-center py-2 mb-4 block w-full">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="badge-success text-center py-2 mb-4 block w-full">
                  {modalSuccess}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-medium hover:bg-[#f1f5f9] transition-colors"
                  onClick={closeLoanModal}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  disabled={modalLoading}
                  className="flex-1 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-medium hover:bg-[#1e293b] shadow-sm transition-all disabled:opacity-50"
                  type="submit"
                >
                  {modalLoading ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalAdminAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm transition-opacity" onClick={closeAdminModal}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e2e8f0] w-full max-w-[500px] p-6 relative z-10 transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-[#0f172a]">{equipoEdit ? 'Editar Equipo' : 'Añadir Equipo'}</h2>
              <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors" onClick={closeAdminModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdminSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Nombre del Equipo</label>
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="min-input bg-white"
                  type="text"
                  placeholder="Ej: Laptop ASUS Vivobook 15"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Categoría</label>
                <select 
                  value={formData.categoriaID} 
                  onChange={(e) => setFormData({...formData, categoriaID: e.target.value})}
                  className="min-input bg-white"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.categoriaID} value={cat.categoriaID}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              {equipoEdit && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Estado</label>
                  <select 
                    value={formData.estado} 
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="min-input bg-white border-warning"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Prestado">Prestado</option>
                    <option value="EnUso">En Uso</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Imagen {equipoEdit ? '(Opcional)' : '(Obligatorio)'}</label>
                <input
                  type="file"
                  onChange={(e) => setImagenArchivo(e.target.files[0])}
                  className="w-full text-sm text-[#64748b] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4f46e5]/10 file:text-[#4f46e5] hover:file:bg-[#4f46e5]/20"
                  accept=".jpg,.jpeg,.png,.webp"
                  required={!equipoEdit}
                />
              </div>
              {modalError && <div className="badge-error text-center py-2 mb-4 block w-full">{modalError}</div>}
              {modalSuccess && <div className="badge-success text-center py-2 mb-4 block w-full">{modalSuccess}</div>}
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-medium hover:bg-[#f1f5f9] transition-colors"
                  onClick={closeAdminModal}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  disabled={modalLoading}
                  className="flex-1 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-medium hover:bg-[#1e293b] shadow-sm transition-all disabled:opacity-50"
                  type="submit"
                >
                  {modalLoading ? 'Guardando...' : 'Guardar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
