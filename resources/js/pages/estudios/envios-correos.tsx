import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Mail, Eye, Clock, CheckCircle, AlertCircle, ArrowLeft, Filter, Download, RefreshCw, Calendar, User } from 'lucide-react';

interface Usuario {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
}

interface EnvioCorreo {
    id: number;
    ID_ESTUDIO: number;
    ID_MEDICO: number;
    ID_USUARIO_ENVIO: number;
    NOMBRE_DESTINATARIO: string;
    CORREO_DESTINATARIO: string;
    TIPO_ENVIO: 'enlace' | 'adjunto';
    ESTADO: 'enviado' | 'leido';
    FECHA_ENVIO: string;
    FECHA_LECTURA: string | null;
    TOKEN_LECTURA: string;
    usuario_envio?: Usuario;
}

interface Estudio {
    ID: number;
    CLAVE_INTERNA: string;
    MUESTRA_INICIALES: string;
}

interface Estadisticas {
    total: number;
    enviados: number;
    leidos: number;
    porcentaje_lectura: number;
}

interface Props {
    estudio: Estudio;
    envios: EnvioCorreo[];
    estadisticas: Estadisticas;
}

type Filtro = 'todos' | 'enviado' | 'leido' | 'enlace' | 'adjunto';

export default function EnviosCorreosIndex({ estudio, envios, estadisticas }: Props) {
    const [filtroActivo, setFiltroActivo] = useState<Filtro>('todos');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Auto-refresh cada 30 segundos si está habilitado
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            window.location.reload();
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const enviosFiltrados = envios.filter(envio => {
        switch (filtroActivo) {
            case 'enviado':
                return envio.ESTADO === 'enviado';
            case 'leido':
                return envio.ESTADO === 'leido';
            case 'enlace':
                return envio.TIPO_ENVIO === 'enlace';
            case 'adjunto':
                return envio.TIPO_ENVIO === 'adjunto';
            default:
                return true;
        }
    });

    const formatearFecha = (fecha: string) => {
        const date = new Date(fecha);
        return {
            fecha: date.toLocaleDateString('es-ES'),
            hora: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getEstadoBadge = (estado: string) => {
        if (estado === 'leido') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Abierto
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Pendiente
            </span>
        );
    };

    const getTipoBadge = (tipo: string) => {
        if (tipo === 'adjunto') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    📎 Adjunto
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                🔗 Enlace
            </span>
        );
    };

    const handleExportar = () => {
        // Implementar exportación
        window.open(`/envios-correos/exportar?estudio_id=${estudio.ID}`, '_blank');
    };

    return (
        <AppLayout>
            <Head title={`Envíos de Correos - ${estudio.CLAVE_INTERNA}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Mail className="h-8 w-8" />
                                <h1 className="text-3xl font-bold">Envíos de Correos</h1>
                            </div>
                            <p className="text-white/80 opacity-90">
                                Estudio: <span className="font-medium">{estudio.CLAVE_INTERNA}</span> | 
                                Paciente: <span className="font-medium">{estudio.MUESTRA_INICIALES || 'N/A'}</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                                    autoRefresh 
                                        ? 'bg-white/20 hover:bg-white/30' 
                                        : 'bg-white/10 hover:bg-white/20'
                                }`}
                                title={autoRefresh ? 'Desactivar auto-actualización' : 'Activar auto-actualización'}
                            >
                                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                                <span>{autoRefresh ? 'Auto' : 'Manual'}</span>
                            </button>
                            
                            <Link 
                                href={`/estudios/${estudio.ID}`}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Volver al Estudio</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Mail className="h-8 w-8 text-blue-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Enviados
                                        </dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {estadisticas.total}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Abiertos
                                        </dt>
                                        <dd className="text-2xl font-bold text-green-600">
                                            {estadisticas.leidos}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Clock className="h-8 w-8 text-yellow-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Pendientes
                                        </dt>
                                        <dd className="text-2xl font-bold text-yellow-600">
                                            {estadisticas.enviados}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-8 w-8 text-[#189BAF]" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Tasa de Apertura
                                        </dt>
                                        <dd className="text-2xl font-bold text-[#189BAF]">
                                            {estadisticas.porcentaje_lectura}%
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y Tabla */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header de filtros */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Filter className="h-5 w-5 text-gray-400" />
                                <div className="flex space-x-2">
                                    {[
                                        { key: 'todos', label: `Todos (${estadisticas.total})`, icon: Mail },
                                        { key: 'enviado', label: `Pendientes (${estadisticas.enviados})`, icon: Clock },
                                        { key: 'leido', label: `Abiertos (${estadisticas.leidos})`, icon: CheckCircle },
                                        { key: 'enlace', label: 'Enlaces', icon: null },
                                        { key: 'adjunto', label: 'Adjuntos', icon: null }
                                    ].map(({ key, label, icon: Icon }) => (
                                        <button
                                            key={key}
                                            onClick={() => setFiltroActivo(key as Filtro)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                                                filtroActivo === key
                                                    ? 'bg-[#189BAF] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {Icon && <Icon className="h-4 w-4" />}
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <button
                                onClick={handleExportar}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                <span>Exportar</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabla */}
                    {enviosFiltrados.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Destinatario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Enviado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Abierto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Enviado por
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {enviosFiltrados.map((envio) => {
                                        const fechaEnvio = formatearFecha(envio.FECHA_ENVIO);
                                        const fechaLectura = envio.FECHA_LECTURA ? formatearFecha(envio.FECHA_LECTURA) : null;
                                        
                                        return (
                                            <tr key={envio.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {envio.NOMBRE_DESTINATARIO}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-mono">
                                                            {envio.CORREO_DESTINATARIO}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getTipoBadge(envio.TIPO_ENVIO)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getEstadoBadge(envio.ESTADO)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {fechaEnvio.fecha}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {fechaEnvio.hora}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {fechaLectura ? (
                                                        <div>
                                                            <div className="text-sm text-green-600">
                                                                {fechaLectura.fecha}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {fechaLectura.hora}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No abierto</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900">
                                                            {envio.usuario_envio?.USUARIO_NOMBRE || 'Sistema'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={`/envios-correos/${envio.id}`}
                                                        className="text-[#189BAF] hover:text-[#157a8c] transition-colors"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Mail className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay envíos</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filtroActivo === 'todos' 
                                    ? 'Aún no se han enviado correos para este estudio.'
                                    : `No hay envíos con el filtro "${filtroActivo}" aplicado.`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}