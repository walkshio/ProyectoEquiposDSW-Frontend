import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
export default function Contrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestamo, setPrestamo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const loggedUser = JSON.parse(userStr);
    const fetchPrestamo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/prestamos/${id}`, {
          headers: {
            'X-Usuario-ID': loggedUser.usuarioID.toString(),
            'X-Usuario-Nombre': loggedUser.nombre,
            'X-Usuario-Rol': loggedUser.rol
          },
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('No se pudo cargar el contrato o no tienes permisos.');
        }
        const data = await response.json();
        setPrestamo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrestamo();
  }, [id, navigate]);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  if (loading) return <div className="p-8 text-center font-sans">Cargando contrato...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-sans">{error}</div>;
  if (!prestamo) return <div className="p-8 text-center font-sans">Contrato no encontrado.</div>;
  return (
    <div className="bg-white text-black min-h-screen font-serif p-4 md:p-10">
      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { 
            padding: 0; 
            background: white; 
            font-size: 14px; 
            line-height: 1.5; 
          }
          .no-print { display: none !important; }
          .contract-box { 
            border: none !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            max-width: 100% !important; 
          }
          h3 { font-size: 18px !important; margin-bottom: 16px !important; }
          h4 { font-size: 16px !important; margin-bottom: 12px !important; }
          .mb-8 { margin-bottom: 24px !important; }
          .mb-6 { margin-bottom: 16px !important; }
          .mb-4 { margin-bottom: 12px !important; }
          .mt-16 { margin-top: 60px !important; }
          .pt-8 { padding-top: 24px !important; }
          ul { margin-bottom: 16px !important; }
        }
      `}</style>
      <div className="no-print text-center mb-8 flex justify-center gap-4">
        <button 
          onClick={() => window.print()}
          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg font-sans font-semibold shadow transition-colors"
        >
          Imprimir Contrato (PDF)
        </button>
        <button 
          onClick={() => window.close()}
          className="bg-[#64748b] hover:bg-[#475569] text-white px-6 py-2 rounded-lg font-sans font-semibold shadow transition-colors"
        >
          Cerrar
        </button>
      </div>
      <div className="contract-box border-2 border-black p-8 rounded max-w-4xl mx-auto shadow-sm">
        <div className="text-center mb-6">
          <h4 className="font-bold text-lg">SISTEMA DE GESTIÓN DE PRÉSTAMOS DE EQUIPOS TECNOLÓGICOS</h4>
        </div>
        <h3 className="text-center font-bold uppercase mb-8 text-xl">
          CONTRATO DE PRÉSTAMO Y ALQUILER DE EQUIPOS TECNOLÓGICOS
        </h3>
        <p className="mb-4 text-justify">
          Con fecha <strong>{formatDate(prestamo.fechaSolicitud)}</strong>, se celebra el presente contrato de préstamo de equipo de uso institucional entre las partes:
        </p>
        <ul className="list-disc pl-8 mb-6">
          <li className="mb-2"><strong>EL PROVEEDOR:</strong> Oficina de Soporte Técnico y Control de Inventarios Tecnológicos Cibertec.</li>
          <li><strong>EL BENEFICIARIO:</strong> El usuario <strong>{prestamo.nombreUsuario}</strong>, identificado con correo electrónico <strong>{prestamo.correoUsuario}</strong>.</li>
        </ul>
        <div className="mb-6 text-justify">
          <span className="font-bold">PRIMERA: OBJETO DEL CONTRATO</span><br />
          EL PROVEEDOR entrega en calidad de préstamo/alquiler temporal de uso al BENEFICIARIO el equipo tecnológico con las siguientes especificaciones:
          <table className="w-full border-collapse border border-black mt-3">
            <tbody>
              <tr>
                <th className="border border-black p-2 text-left w-1/3 bg-gray-50">Nombre del Equipo:</th>
                <td className="border border-black p-2">{prestamo.nombreEquipo}</td>
              </tr>
              <tr>
                <th className="border border-black p-2 text-left bg-gray-50">Categoría/Tipo:</th>
                <td className="border border-black p-2">{prestamo.tipoEquipo}</td>
              </tr>
              <tr>
                <th className="border border-black p-2 text-left bg-gray-50">Estado de entrega:</th>
                <td className="border border-black p-2">Bueno / Disponible</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mb-6 text-justify">
          <span className="font-bold">SEGUNDA: PLAZO DE DEVOLUCIÓN</span><br />
          El préstamo se otorga por un plazo determinado que inicia con la fecha de entrega del equipo y vence indefectiblemente el día <strong>{formatShortDate(prestamo.fechaFin)}</strong>. El BENEFICIARIO se compromete a devolver el equipo en la fecha señalada en las mismas condiciones en las que le fue entregado.
        </div>
        <div className="mb-6 text-justify">
          <span className="font-bold">TERCERA: PENALIDADES Y MULTAS</span><br />
          En caso de retraso en la entrega del equipo tecnológico, se aplicará de forma automática una penalidad diaria de <strong>S/. 5.00 (Cinco Soles y 00/100)</strong> por cada día de mora posterior a la fecha de vencimiento pactada, sin perjuicio de las acciones administrativas correspondientes.<br />
          Asimismo, de presentarse daños físicos, roturas o accesorios faltantes en la devolución, EL BENEFICIARIO asumirá el costo total de la reparación o reposición determinado por soporte técnico, aplicándose las penalidades correspondientes en su cuenta de usuario.
        </div>
        <div className="mb-8 text-justify">
          <span className="font-bold">CUARTA: RESPONSABILIDAD</span><br />
          EL BENEFICIARIO declara recibir el equipo en buenas condiciones y asume total responsabilidad civil por la custodia, cuidado y uso correcto del mismo, liberando a Cibertec de toda responsabilidad por uso indebido.
        </div>
        <div className="flex justify-between mt-16 pt-8">
          <div className="text-center w-64">
            <div className="border-t border-black pt-2 text-sm">
              EL PROVEEDOR<br />
              Oficina de Soporte y Control
            </div>
          </div>
          <div className="text-center w-64">
            <div className="border-t border-black pt-2 text-sm">
              EL BENEFICIARIO<br />
              {prestamo.nombreUsuario}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
