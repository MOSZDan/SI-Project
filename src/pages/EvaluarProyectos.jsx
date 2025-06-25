import React, {useEffect, useState} from 'react';
import supabase from '../utils/supabaseClient';
import {useNavigate} from 'react-router-dom';
import {UserAuth} from '../context/AuthContext';
import {toast} from 'react-toastify';
import Navbar from '../components/Navbar';

const criterios = ['Originalidad', 'Claridad', 'Presentación'];

export default function EvaluarProyectos() {
    const {session, tipoUsuario} = UserAuth();
    const navigate = useNavigate();

    const [usuarioId, setUsuarioId] = useState(null);
    const [equiposAsignados, setEquiposAsignados] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState({});
    const [comentarios, setComentarios] = useState({});
    const [evaluacionesRealizadas, setEvaluacionesRealizadas] = useState({});

    // 1) obtener el ID de usuario del tribunal
    useEffect(() => {
        if (!session?.user?.email) return;
        supabase
            .from('usuario')
            .select('id')
            .eq('correo', session.user.email)
            .maybeSingle()
            .then(({data, error}) => {
                if (!error && data) setUsuarioId(data.id);
            });
    }, [session]);

    // 2) validar que el rol sea Tribunal (3) o Admin (7)
    useEffect(() => {
        if (tipoUsuario == null) return; // aún cargando
        if (![3, 7].includes(tipoUsuario)) {
            toast.error('Acceso no autorizado');
            navigate('/');
        }
    }, [tipoUsuario]);

    // 3) traer equipos asignados a este tribunal + evaluaciones previas
    useEffect(() => {
        if (!usuarioId) return;
        (async () => {
            // a) buscar en la tabla 'tribunal' los equipos asignados a este usuario
            const {data: asigns} = await supabase
                .from('tribunal')
                .select('id_equipo')
                .eq('id_usuario', usuarioId);
            const equipoIds = (asigns || []).map(a => a.id_equipo);

            if (!equipoIds.length) {
                setEquiposAsignados([]);
                return;
            }

            // b) Obtener los datos de esos equipos y el tipo de evento al que pertenecen
            const {data: equipos} = await supabase
                .from('equipo')
                .select('id, nombre, evento(id_tevento)')
                .in('id', equipoIds);
            setEquiposAsignados(equipos || []);

            // c) Cargar las evaluaciones que este tribunal ya haya realizado
            const {data: evals} = await supabase
                .from('evaluacion')
                .select('id_equipo, puntaje, comentario, fecha')
                .eq('id_usuario', usuarioId);

            const mapEval = {};
            (evals || []).forEach(e => {
                mapEval[e.id_equipo] = e;
            });
            setEvaluacionesRealizadas(mapEval);
        })();
    }, [usuarioId]);

    // Handlers para el formulario de calificación
    const handleEvaluacion = (equipoId, criterio, valor) => {
        setEvaluaciones(prev => ({
            ...prev,
            [equipoId]: {...prev[equipoId], [criterio]: Number(valor)}
        }));
    };
    const handleComentario = (equipoId, texto) => {
        setComentarios(prev => ({...prev, [equipoId]: texto}));
    };

    // Guardar la evaluación en la base de datos
    const guardarEvaluacion = async equipoId => {
        const evalObj = evaluaciones[equipoId];
        if (!evalObj || Object.keys(evalObj).length !== criterios.length) {
            return toast.error('Debes completar todos los criterios');
        }
        const total = Object.values(evalObj).reduce((a, b) => a + b, 0);
        const {error} = await supabase.from('evaluacion').insert({
            id_equipo: equipoId,
            id_usuario: usuarioId,
            puntaje: total,
            comentario: comentarios[equipoId]
        });
        if (error) {
            toast.error('Error al guardar evaluación');
        } else {
            toast.success('Evaluación guardada');
            setEvaluacionesRealizadas(prev => ({
                ...prev,
                [equipoId]: {
                    puntaje: total,
                    comentario: comentarios[equipoId],
                    fecha: new Date().toISOString()
                }
            }));
        }
    };

    // Renderiza la tarjeta de evaluación para un equipo
    const renderEvaluacion = equipo => {
        const prev = evaluacionesRealizadas[equipo.id];
        if (prev) {
            return (
                <div key={equipo.id} className="card mb-4 border-success">
                    <div className="card-header bg-success text-white">
                        {equipo.nombre} – Ya Evaluado
                    </div>
                    <div className="card-body">
                        <p><strong>Puntaje:</strong> {prev.puntaje}</p>
                        <p><strong>Comentario:</strong> {prev.comentario}</p>
                        <p><em>{new Date(prev.fecha).toLocaleString()}</em></p>
                    </div>
                </div>
            );
        }
        return (
            <div key={equipo.id} className="card mb-4">
                <div className="card-header fw-bold">{equipo.nombre}</div>
                <div className="card-body">
                    {criterios.map(c => (
                        <div key={c} className="mb-3">
                            <label className="form-label">{c}</label>
                            <select
                                className="form-select"
                                defaultValue=""
                                onChange={e => handleEvaluacion(equipo.id, c, e.target.value)}
                            >
                                <option value="" disabled>Selecciona puntaje (1-5)</option>
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    ))}
                    <div className="mb-3">
                        <label className="form-label">Comentarios</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            onChange={e => handleComentario(equipo.id, e.target.value)}
                            placeholder="Añade tu retroalimentación para el equipo..."
                        />
                    </div>
                    <button className="btn btn-success" onClick={() => guardarEvaluacion(equipo.id)}>
                        Guardar Evaluación
                    </button>
                </div>
            </div>
        );
    };

    // Separar equipos por tipo de evento (Feria vs Hackathon)
    const ferias = equiposAsignados.filter(e => e.evento?.id_tevento === 2);
    const hackatones = equiposAsignados.filter(e => e.evento?.id_tevento === 4);

    return (
        <>
            <Navbar/>
            <div className="container py-4">
                <h2>Evaluar Proyectos Asignados</h2>
                <hr/>

                <h4 className="text-primary mt-4">Equipos de Feria Expositiva</h4>
                {ferias.length > 0 ? ferias.map(renderEvaluacion) : <p className="text-muted">No tienes equipos de feria asignados.</p>}

                <h4 className="text-success mt-4">Equipos de Hackathon</h4>
                {hackatones.length > 0 ? hackatones.map(renderEvaluacion) : <p className="text-muted">No tienes equipos de hackathon asignados.</p>}
            </div>
        </>
    );
}