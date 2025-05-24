import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserAuth } from '../context/AuthContext';

const Bitacora = () => {
  const [verificado, setVerificado] = useState(false);
  const { tipoUsuario } = UserAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bitacora, setBitacora] = useState([]);
  const [usuarios, setUsuarios] = useState({});

  useEffect(() => {
    if (tipoUsuario === null) return;
    if (tipoUsuario !== 7) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/');
      return;
    }
    setVerificado(true);
    cargarUsuarios();
    cargarBitacora();
  }, [tipoUsuario, navigate]);

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('id, nombre');
      if (error) throw error;
      const usuariosMap = {};
      data.forEach(u => { usuariosMap[u.id] = u.nombre; });
      setUsuarios(usuariosMap);
    } catch (err) {
      toast.error('Error al cargar usuarios: ' + err.message);
    }
  };

  const cargarBitacora = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bitacora')
        .select('id, id_usuario, tipo_accion, fecha_hora, ip_origen')
        .order('fecha_hora', { ascending: false });
      if (error) throw error;
      setBitacora(data || []);
    } catch (err) {
      toast.error('Error al cargar la bitácora: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!verificado) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <p className="text-center">Verificando acceso...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="text-dark mb-4">Bitácora del Sistema</h2>

        {loading ? (
          <p className="text-center">Cargando registros...</p>
        ) : (
          <div className="table-responsive shadow rounded">
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark text-center">
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Tipo de Acción</th>
                  <th>IP Origen</th>
                </tr>
              </thead>
              <tbody>
                {bitacora.map(registro => {
                  const dt = new Date(registro.fecha_hora);
                  const fechaHora = dt.toLocaleString();
                  const ipLimpia = registro.ip_origen.split('/')[0];

                  return (
                    <tr key={registro.id}>
                      <td className="text-center">{fechaHora}</td>
                      <td className="text-center">
                        {usuarios[registro.id_usuario] || 'Usuario Desconocido'}
                      </td>
                      <td className="text-center">{registro.tipo_accion}</td>
                      <td className="text-center">{ipLimpia}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Bitacora;
