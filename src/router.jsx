import React from "react";
import {createBrowserRouter} from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CrearEvento from "./pages/CrearEvento.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import EditarPerfil from "./pages/editar-perfil.jsx";
import DetalleEvento from "./pages/DetalleEvento.jsx";
import MisEventos from "./pages/MisEventos.jsx";
import GestionarEventos from './pages/GestionarEventos';
import VerUsuarios from "./pages/ver-usuarios.jsx"; // ajustá el path si está en otro folder
import PerfilUsuario from './pages/PerfilUsuario';
import DarRol from './pages/DarRol';
import EliminarUsuario from './pages/eliminar-usuario';
import EventosPorTipo from './pages/EventosPorTipo';
import InscribirEquipo from "./pages/InscribirEquipo.jsx";
import EventosInscritos from './pages/EventosInscritos';
import PublicRoute from "./components/PublicRoute.jsx";
import DefinirProyecto from './pages/DefinirProyecto.jsx';
import DetalleEventoCreador from "./pages/DetalleEventoCreador.jsx";
import Bitacora from "./pages/Bitacora.jsx";
import Estadisticas from "./pages/Estadisticas.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        children: [

            {
                path: "iniciar-sesion",
                element: (
                    <PublicRoute>
                        <Login/>
                    </PublicRoute>
                )
            },
            {
                path: "registro",
                element: (
                    <PublicRoute>
                        <Register/>
                    </PublicRoute>
                )
            },
            {path: "update-password", element: <UpdatePassword/>},

            {
                index: true,
                element: (
                    <PrivateRoute>
                        <App/>
                    </PrivateRoute>
                )
            },
            {
                path: "dashboard",
                element: (
                    <PrivateRoute>
                        <Dashboard/>
                    </PrivateRoute>
                )
            },
            {
                path: "crear-evento",
                element: (
                    <PrivateRoute>
                        <CrearEvento/>
                    </PrivateRoute>
                )
            },
            {
                path: "gestionar-eventos",
                element: (
                    <PrivateRoute>
                        <GestionarEventos/>
                    </PrivateRoute>
                )
            },
            {
                path: "mis-eventos",
                element: (
                    <PrivateRoute>
                        <MisEventos/>
                    </PrivateRoute>
                )
            },
            {
                path: "eventos-inscritos",
                element: (
                    <PrivateRoute>
                        <EventosInscritos/>
                    </PrivateRoute>
                )
            },
            {
                path: "evento/:id",
                element: (
                    <PrivateRoute>
                        <DetalleEvento/>
                    </PrivateRoute>
                )
            },
            {
                path: "detalle-evento-creador/:id",
                element: (
                    <PrivateRoute>
                        <DetalleEventoCreador/>
                    </PrivateRoute>
                )
            },

            {
                path: "inscribir-equipo/:id",
                element: (
                    <PrivateRoute>
                        <InscribirEquipo/>
                    </PrivateRoute>
                )
            },
            {
                path: "eventos-tipo/:id",
                element: (
                    <PrivateRoute>
                        <EventosPorTipo/>
                    </PrivateRoute>
                )
            },
            {
                path: "ver-usuarios",
                element: (
                    <PrivateRoute>
                        <VerUsuarios/>
                    </PrivateRoute>
                )
            },
            {
                path: "perfil-usuario/:id",
                element: (
                    <PrivateRoute>
                        <PerfilUsuario/>
                    </PrivateRoute>
                )
            },
            {
                path: "dar-rol",
                element: (
                    <PrivateRoute>
                        <DarRol/>
                    </PrivateRoute>
                )
            },
            {
                path: "eliminar-usuario",
                element: (
                    <PrivateRoute>
                        <EliminarUsuario/>
                    </PrivateRoute>
                )
            },
            {
                path: "editar-perfil",
                element: (
                    <PrivateRoute>
                        <EditarPerfil/>
                    </PrivateRoute>
                )
            },
            {
                path: "definir-proyecto/:id",
                element: (
                    <PrivateRoute>
                        <DefinirProyecto/>
                    </PrivateRoute>
                )
            },
            {
                path: "bitacora",
                element: (
                    <PrivateRoute>
                        <Bitacora/>
                    </PrivateRoute>
                )
            },
            {
                path: "Estadisticas",
                element: (
                    <PrivateRoute>
                        <Estadisticas/>
                    </PrivateRoute>
                )
            }
        ]
    },
    // fallback 404
    {
        path: "*",
        element: <NotFound/>
    }
]);
