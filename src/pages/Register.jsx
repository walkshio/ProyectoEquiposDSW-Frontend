import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contrasena, rol: 'Usuario' })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al registrar usuario');
      }
      setSuccess('Usuario registrado exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/Login/LoginExterno/Google`;
  };
  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex items-center justify-center p-6 antialiased">
      <div className="min-card w-full max-w-[400px] p-8 flex flex-col gap-6 mt-4 mb-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#4f46e5]/10 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[#4f46e5] text-2xl">person_add</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-[#64748b]">Regístrate hoy mismo.</p>
        </div>
        <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider" htmlFor="name">Nombre Completo</label>
            <input
              className="min-input"
              id="name"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider" htmlFor="email">Correo Electrónico</label>
            <input
              className="min-input"
              id="email"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider" htmlFor="password">Contraseña</label>
            <input
              className="min-input"
              id="password"
              type="password"
              minLength={6}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="badge-error w-full text-center py-2 mt-1">
              {error}
            </div>
          )}
          {success && (
            <div className="badge-success w-full text-center py-2 mt-1">
              {success}
            </div>
          )}
          <button
            className="min-btn-primary w-full mt-2 flex justify-center items-center gap-2"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creando Cuenta...' : 'Registrarse'}
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
          </button>
        </form>
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-[#e2e8f0]"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-medium text-[#94a3b8]">O</span>
          <div className="flex-grow border-t border-[#e2e8f0]"></div>
        </div>
        <button
          className="w-full bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f172a] text-sm font-medium py-2.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-3 shadow-sm active:scale-95"
          type="button"
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Registrarse con Google
        </button>
        <div className="text-center mt-2">
          <span className="text-sm text-[#64748b]">¿Ya tienes una cuenta?</span>
          <Link className="text-sm font-medium text-[#4f46e5] hover:text-[#4338ca] ml-2 transition-colors" to="/login">Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}
