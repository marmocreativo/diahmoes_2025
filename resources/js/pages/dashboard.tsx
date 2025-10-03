import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DashboardProps, type DashboardNotification } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Users, Building2, Package, AlertTriangle, CheckCircle, XCircle, Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface User {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    USUARIO_CORREO: string;
    USUARIO_TIPO: string;
    USUARIO_ESTADO: string;
}

interface ExtendedStats {
    // Estados de estudios
    estudios_pendientes: number;
    estudios_laboratorio_recepcion: number;
    estudios_laboratorio_completo: number;
    estudios_completados: number;
    estudios_cancelados: number;
    total_estudios: number;
    
    // Usuarios
    usuarios_pacientes: number;
    usuarios_medicos: number;
    usuarios_administradores: number;
    total_usuarios: number;
    
    // Entidades
    instituciones: number;
    instituciones_activas: number;
    mensajerias: number;
    
    // Métricas
    estudios_por_clave: Record<string, number>;
    estudios_urgentes: number;
    muestras_procesando: number;
}

interface MainCounter {
    count: number;
    label: string;
    color: string;
    url: string;
}

interface ChartData {
    estudios_diarios: Array<{
        fecha: string;
        total: number;
        fecha_completa: string;
    }>;
    estudios_por_tipo: Array<{
        name: string;
        value: number;
    }>;
    estudios_por_estado: Array<{
        name: string;
        value: number;
        estado_codigo: string;
    }>;
    tiempo_procesamiento_semanal: Array<{
        semana: string;
        promedio_dias: number;
        fecha_inicio: string;
    }>;
    instituciones_activas: Array<{
        name: string;
        value: number;
        nombre_completo: string;
    }>;
    metricas_rendimiento: {
        total_estudios: number;
        estudios_completados: number;
        eficiencia_porcentaje: number;
        tiempo_promedio_dias: number;
        estudios_urgentes: number;
    };
}

export default function Dashboard() {
    const { auth, stats, recentStudies, notifications, chartData, mainCounters } = usePage<{ 
        auth: { user: User }; 
        stats: ExtendedStats;
        recentStudies: any[];
        notifications: DashboardNotification[];
        chartData: ChartData;
        mainCounters: Record<string, MainCounter>;
    }>().props;

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'Resultados Enviados':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Recepción Laboratorio':
            case 'Resultados Completos':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'Solicitud Recolección':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            case 'Retorno Material':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Terminado':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Cancelado':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCounterIcon = (label: string) => {
        switch (label) {
            case 'Solicitud Recolección':
                return <Calendar className="h-6 w-6" />;
            case 'Recepción Laboratorio':
                return <Package className="h-6 w-6" />;
            case 'Resultados Completos':
                return <CheckCircle className="h-6 w-6" />;
            case 'Resultados Enviados':
                return <TrendingUp className="h-6 w-6" />;
            default:
                return <Package className="h-6 w-6" />;
        }
    };

    const getCounterColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return {
                    text: 'text-blue-600',
                    bg: 'bg-blue-100',
                    border: 'border-blue-200'
                };
            case 'yellow':
                return {
                    text: 'text-[#D68B41]',
                    bg: 'bg-[#D68B41]/10',
                    border: 'border-[#D68B41]/20'
                };
            case 'green':
                return {
                    text: 'text-green-600',
                    bg: 'bg-green-100',
                    border: 'border-green-200'
                };
            case 'purple':
                return {
                    text: 'text-purple-600',
                    bg: 'bg-purple-100',
                    border: 'border-purple-200'
                };
            default:
                return {
                    text: 'text-gray-600',
                    bg: 'bg-gray-100',
                    border: 'border-gray-200'
                };
        }
    };

    const pieColors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899'];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.dataKey}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header de bienvenida */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                ¡Bienvenido, {auth.user.USUARIO_NOMBRE}!
                            </h1>
                            <p className="text-white/80 opacity-90">
                                Sistema de Gestión de Estudios Médicos - {auth.user.USUARIO_TIPO}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fila principal - Estados de estudios con enlaces */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Object.values(mainCounters).map((counter) => {
                        const colorClasses = getCounterColorClasses(counter.color);
                        return (
                            <Link key={counter.label} href={counter.url}>
                                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">{counter.label}</p>
                                                <p className={`text-3xl font-bold ${colorClasses.text}`}>
                                                    {counter.count}
                                                </p>
                                            </div>
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses.bg}`}>
                                                <div className={colorClasses.text}>
                                                    {getCounterIcon(counter.label)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <span className="text-xs text-gray-500 flex items-center">
                                                Ver todos 
                                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Métricas de rendimiento (últimos 30 días) */}
                {chartData?.metricas_rendimiento && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Métricas de Rendimiento (Últimos 30 días)
                            </CardTitle>
                            <CardDescription>
                                Análisis de eficiencia y tiempos de procesamiento
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Estudios</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {chartData.metricas_rendimiento.total_estudios}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Completados</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {chartData.metricas_rendimiento.estudios_completados}
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Eficiencia</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {chartData.metricas_rendimiento.eficiencia_porcentaje}%
                                    </p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Tiempo Promedio</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {chartData.metricas_rendimiento.tiempo_promedio_dias} días
                                    </p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Urgentes</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {chartData.metricas_rendimiento.estudios_urgentes}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Gráficas principales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfica de estudios diarios */}
                    {chartData?.estudios_diarios && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Estudios por Día (Últimos 30 días)</CardTitle>
                                <CardDescription>
                                    Tendencia de estudios solicitados diariamente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData.estudios_diarios}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="fecha" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="total" 
                                                stroke="#3B82F6" 
                                                fillOpacity={1} 
                                                fill="url(#colorTotal)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Gráfica de distribución por estado */}
                    {chartData?.estudios_por_estado && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribución por Estado</CardTitle>
                                <CardDescription>
                                    Estados actuales de todos los estudios
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData.estudios_por_estado}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.estudios_por_estado.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Segunda fila de gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfica de tipos de estudio */}
                    {chartData?.estudios_por_tipo && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tipos de Estudio Más Frecuentes</CardTitle>
                                <CardDescription>
                                    Top 10 de tipos de estudios (últimos 30 días)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData.estudios_por_tipo}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="name" 
                                                angle={-45} 
                                                textAnchor="end" 
                                                height={80}
                                                interval={0}
                                            />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#10B981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Gráfica de tiempo de procesamiento */}
                    {chartData?.tiempo_procesamiento_semanal && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tiempo de Procesamiento Semanal</CardTitle>
                                <CardDescription>
                                    Promedio de días por semana (últimos 30 días)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData.tiempo_procesamiento_semanal}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="semana" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line 
                                                type="monotone" 
                                                dataKey="promedio_dias" 
                                                stroke="#8B5CF6" 
                                                strokeWidth={3}
                                                dot={{ fill: '#8B5CF6' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Instituciones más activas */}
                {chartData?.instituciones_activas && chartData.instituciones_activas.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Instituciones Más Activas</CardTitle>
                            <CardDescription>
                                Instituciones con mayor número de estudios (últimos 30 días)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData.instituciones_activas} layout="horizontal">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={150} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#F59E0B" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notificaciones */}
                {notifications && notifications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Notificaciones Importantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.map((notification, index) => (
                                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                                        notification.type === 'warning' 
                                            ? 'bg-orange-50 border-orange-500' 
                                            : 'bg-blue-50 border-blue-500'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold">{notification.title}</h4>
                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                            </div>
                                            <Badge variant="outline" className="ml-2">
                                                {notification.count}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Estudios recientes */}
                {recentStudies && recentStudies.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Estudios Recientes</CardTitle>
                            <CardDescription>
                                Últimos 5 estudios registrados en el sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentStudies.map((estudio, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold">{estudio.id}</span>
                                                <span className="text-sm text-gray-600">{estudio.paciente}</span>
                                                <span className="text-sm text-gray-500">{estudio.tipo}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">{estudio.institucion}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-400">{estudio.fecha}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(estudio.estado)}>
                                            {estudio.estado}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}