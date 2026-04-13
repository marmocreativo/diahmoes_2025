import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Building2, MapPin, TestTube, Activity, Target, Users, Clock, CheckCircle, Download, HelpCircle, RotateCcw, LogOut, FlaskConical } from 'lucide-react';
import { useState } from 'react';

interface Filtros {
    muestra_estados: string[];
    tipos_estudio: string[];
    instituciones: Array<{ id: number; nombre: string }>;
}

interface FiltrosActivos {
    fecha_desde: string;
    fecha_hasta: string;
    muestra_estado?: string;
    tipo_estudio?: string;
    institucion?: string;
}

interface MetricasPrincipales {
    total_estudios: number;
    pendientes: number;
    completados: number;
}

interface GraficasPie {
    tipo_estudio: Array<{ name: string; value: number }>;
}

interface TopData {
    name: string;
    value: number;
}

interface ComparativaTipos {
    datos: Array<{ mes: string; fecha_completa: string; [key: string]: any }>;
    tipos_estudio: string[];
}

interface ComparativaMutacion {
    mutado: number;
    no_mutado: number;
    invalido: number;
}

interface Comparacion3Periodos {
    actual: number;
    hace_1_anio: number;
    hace_2_anios: number;
    cambio_1_anio: number;
    cambio_2_anios: number;
    comparacion_mensual: Array<{
        mes: string;
        estudios_actual: number;
        estudios_1_anio: number;
        estudios_2_anios: number;
    }>;
}

interface Predicciones {
    mes_siguiente: string;
    mes_siguiente_numero: number;
    prediccion_mes_siguiente: number;
    datos_historicos_mes: any[];
    anios_analizados: number;
}

interface EstudioFaltante {
    id: number;
    clave_interna: string;
    clave: string;
    anio: number;
    seriado: number;
    fecha_recepcion: string;
    tipo_estudio: string;
    estado: string;
    url: string;
    razon_faltante: string;
}

interface Datos {
    metricas_principales: MetricasPrincipales;
    graficas_pie: GraficasPie;
    top_instituciones: TopData[];
    todas_instituciones: TopData[];
    top_estados: TopData[];
    todos_estados: TopData[];
    tendencia_5_anios: Array<{ mes: string; total: number; fecha_completa: string }>;
    comparativa_tipos: ComparativaTipos;
    comparativa_mutacion: ComparativaMutacion;
    comparacion_3_periodos: Comparacion3Periodos;
    predicciones: Predicciones;
    estudios_faltantes: EstudioFaltante[];
}

interface SesionInfo {
    nombre: string;
    tipo: 'admin' | 'externo';
}

export default function ReportesIndex() {
    const { filtros, datos, filtrosActivos, sesionInfo } = usePage<{
        filtros: Filtros;
        datos: Datos;
        filtrosActivos: FiltrosActivos;
        sesionInfo: SesionInfo;
    }>().props;

    const [fechaDesde, setFechaDesde] = useState(filtrosActivos.fecha_desde);
    const [fechaHasta, setFechaHasta] = useState(filtrosActivos.fecha_hasta);
    const [muestraEstado, setMuestraEstado] = useState<string>(filtrosActivos.muestra_estado || '');
    const [tipoEstudio, setTipoEstudio] = useState<string>(filtrosActivos.tipo_estudio || '');
    const [institucion, setInstitucion] = useState<string>(filtrosActivos.institucion || '');

    const aplicarFiltros = () => {
        const params: any = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        if (muestraEstado) params.muestra_estado = muestraEstado;
        if (tipoEstudio)   params.tipo_estudio   = tipoEstudio;
        if (institucion)   params.institucion    = institucion;
        router.get('/reportes', params, { preserveState: true });
    };

    const limpiarFiltros = () => {
        const hoy       = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const desde     = primerDia.toISOString().split('T')[0];
        const hasta     = hoy.toISOString().split('T')[0];

        setFechaDesde(desde);
        setFechaHasta(hasta);
        setMuestraEstado('');
        setTipoEstudio('');
        setInstitucion('');

        router.get('/reportes', { fecha_desde: desde, fecha_hasta: hasta });
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (fechaDesde)   params.append('fecha_inicio', fechaDesde);
        if (fechaHasta)   params.append('fecha_fin', fechaHasta);
        if (muestraEstado) params.append('muestra_estado', muestraEstado);
        if (tipoEstudio)  params.append('tipo_estudio', tipoEstudio);
        if (institucion)  params.append('institucion', institucion);
        window.open(`/reportes/export-excel?${params.toString()}`, '_blank');
    };

    const handleLogout = () => {
        router.post(route('reportes.logout'));
    };

    const formatearPeriodo = () => {
        const desde = new Date(fechaDesde + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const hasta = new Date(fechaHasta + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${desde} — ${hasta}`;
    };

    const pieColors   = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6'];
    const lineColors  = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg border-gray-200">
                    <p className="font-semibold text-gray-900">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <TooltipProvider>
            <Head title="Reporte Analítico — DIAHMOES" />

            <div className="min-h-screen bg-slate-50">

                {/* Navbar superior simple */}
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#189BAF]">
                            <FlaskConical className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-800 text-lg">DIAHMOES</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 text-sm">Reporte Analítico</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-700">{sesionInfo.nombre}</p>
                            <p className="text-xs text-slate-400">
                                {sesionInfo.tipo === 'admin' ? 'Administrador' : 'Acceso externo'}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Cerrar sesión</span>
                        </Button>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="flex flex-col gap-6 p-4 lg:p-6">

                    {/* Header con filtros */}
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-[#189BAF] to-[#157a8c]">
                        <CardContent className="p-6 text-white">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                                        Dashboard Analítico
                                    </h1>
                                    <p className="text-white/90 text-lg">
                                        {formatearPeriodo()}
                                    </p>
                                    <p className="text-white/80 text-sm mt-1">
                                        Análisis completo de estudios e instituciones
                                    </p>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                        <div className="col-span-2 lg:col-span-1">
                                            <Input
                                                type="date"
                                                value={fechaDesde}
                                                onChange={(e) => setFechaDesde(e.target.value)}
                                                className="bg-white text-black border-gray-300"
                                            />
                                        </div>
                                        <div className="col-span-2 lg:col-span-1">
                                            <Input
                                                type="date"
                                                value={fechaHasta}
                                                onChange={(e) => setFechaHasta(e.target.value)}
                                                className="bg-white text-black border-gray-300"
                                            />
                                        </div>
                                        <div className="col-span-2 lg:col-span-1">
                                            <Select value={muestraEstado || 'todos'} onValueChange={(v) => setMuestraEstado(v === 'todos' ? '' : v)}>
                                                <SelectTrigger className="bg-white text-black border-gray-300">
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todos los estados</SelectItem>
                                                    {filtros.muestra_estados.map((e) => (
                                                        <SelectItem key={e} value={e}>{e}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 lg:col-span-1">
                                            <Select value={tipoEstudio || 'todos'} onValueChange={(v) => setTipoEstudio(v === 'todos' ? '' : v)}>
                                                <SelectTrigger className="bg-white text-black border-gray-300">
                                                    <SelectValue placeholder="Tipo de Estudio" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todos los tipos</SelectItem>
                                                    {filtros.tipos_estudio.map((t) => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 lg:col-span-2">
                                            <Select value={institucion || 'todas'} onValueChange={(v) => setInstitucion(v === 'todas' ? '' : v)}>
                                                <SelectTrigger className="bg-white text-black border-gray-300">
                                                    <SelectValue placeholder="Institución" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todas">Todas las instituciones</SelectItem>
                                                    {filtros.instituciones.map((i) => (
                                                        <SelectItem key={i.id} value={String(i.id)}>{i.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 justify-end">
                                        <Button onClick={aplicarFiltros} className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Calendar className="h-4 w-4" /> Filtrar
                                        </Button>
                                        <Button onClick={limpiarFiltros} className="bg-gray-600 hover:bg-gray-700 text-white">
                                            <RotateCcw className="h-4 w-4" /> Reiniciar
                                        </Button>
                                        <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white">
                                            <Download className="h-4 w-4" /> Descargar reporte
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Métricas principales */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-2">
                            <Card className="border-2 border-blue-100 h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        Total
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-3 w-3 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>Total de estudios en el período</p></TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">{datos.metricas_principales.total_estudios}</div>
                                    <p className="text-xs text-gray-500 mt-1">Estudios</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <Card className="border-2 border-orange-100 h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-orange-600" />
                                        En Laboratorio
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-3 w-3 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>Estudios en proceso</p></TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-orange-600">{datos.metricas_principales.pendientes}</div>
                                    <p className="text-xs text-gray-500 mt-1">En proceso</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <Card className="border-2 border-green-100 h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Resultados Enviados
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-3 w-3 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>Estudios finalizados</p></TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{datos.metricas_principales.completados}</div>
                                    <p className="text-xs text-gray-500 mt-1">Finalizados</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tipo de Estudio */}
                        <div className="lg:col-span-3">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Activity className="h-5 w-5" />
                                        Tipo de Estudio
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>Distribución de estudios por tipo</p></TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="w-full bg-gray-200 rounded-full h-8 flex overflow-hidden">
                                            {datos.graficas_pie.tipo_estudio.map((tipo, index) => {
                                                const pct = (tipo.value / datos.metricas_principales.total_estudios) * 100;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="h-full flex items-center justify-center text-white text-xs font-medium"
                                                        style={{ width: `${pct}%`, backgroundColor: pieColors[index % pieColors.length] }}
                                                        title={`${tipo.name}: ${tipo.value} (${Math.round(pct)}%)`}
                                                    >
                                                        {pct > 10 && `${Math.round(pct)}%`}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="space-y-2">
                                            {datos.graficas_pie.tipo_estudio.map((tipo, index) => {
                                                const pct = (tipo.value / datos.metricas_principales.total_estudios) * 100;
                                                return (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                                                            <span className="text-sm font-medium">{tipo.name}</span>
                                                        </div>
                                                        <span className="text-sm font-bold">{tipo.value} ({Math.round(pct)}%)</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Estado de Mutación */}
                        <div className="lg:col-span-3">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <TestTube className="h-5 w-5" />
                                        Estado de Mutación
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>Distribución por estado de mutación (KRAS, NRAS, BRAF)</p></TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(() => {
                                            const total = datos.comparativa_mutacion.mutado + datos.comparativa_mutacion.no_mutado + datos.comparativa_mutacion.invalido;
                                            const datosGrafica = [
                                                { name: 'Mutado',           value: datos.comparativa_mutacion.mutado,    color: '#EF4444' },
                                                { name: 'No Mutado',        value: datos.comparativa_mutacion.no_mutado, color: '#10B981' },
                                                { name: 'Inválido/Sin Datos', value: datos.comparativa_mutacion.invalido, color: '#6B7280' },
                                            ].filter(item => item.value > 0);

                                            return (
                                                <>
                                                    <div className="w-full bg-gray-200 rounded-full h-8 flex overflow-hidden">
                                                        {datosGrafica.map((item, index) => {
                                                            const pct = total > 0 ? (item.value / total) * 100 : 0;
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="h-full flex items-center justify-center text-white text-xs font-medium"
                                                                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                                                                    title={`${item.name}: ${item.value} (${Math.round(pct)}%)`}
                                                                >
                                                                    {pct > 10 && `${Math.round(pct)}%`}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {datosGrafica.map((item, index) => {
                                                            const pct = total > 0 ? (item.value / total) * 100 : 0;
                                                            return (
                                                                <div key={index} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                                        <span className="text-sm font-medium">{item.name}</span>
                                                                    </div>
                                                                    <span className="text-sm font-bold">{item.value} ({Math.round(pct)}%)</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Top Instituciones y Estados */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Top 10 Instituciones
                                </CardTitle>
                                <CardDescription>Instituciones con mayor número de estudios</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datos.top_instituciones}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10 }} />
                                            <YAxis />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                        Todas las Instituciones ({datos.todas_instituciones.length})
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {datos.todas_instituciones.map((item, index) => {
                                            const total = datos.todas_instituciones.reduce((s, i) => s + i.value, 0);
                                            const pct   = ((item.value / total) * 100).toFixed(1);
                                            return (
                                                <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm hover:bg-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold min-w-[30px] text-center">{index + 1}</span>
                                                        <span className="font-medium">{item.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-[#189BAF]">{item.value}</span>
                                                        <span className="text-gray-500 text-xs ml-2">({pct}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                        Total: {datos.todas_instituciones.reduce((s, i) => s + i.value, 0)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Top 10 Estados
                                </CardTitle>
                                <CardDescription>Estados con mayor número de estudios</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datos.top_estados}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11 }} />
                                            <YAxis />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#10B981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                        Todos los Estados ({datos.todos_estados.length})
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {datos.todos_estados.map((item, index) => {
                                            const total = datos.todos_estados.reduce((s, i) => s + i.value, 0);
                                            const pct   = ((item.value / total) * 100).toFixed(1);
                                            return (
                                                <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm hover:bg-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold min-w-[30px] text-center">{index + 1}</span>
                                                        <span className="font-medium">{item.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-green-600">{item.value}</span>
                                                        <span className="text-gray-500 text-xs ml-2">({pct}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                        Total: {datos.todos_estados.reduce((s, i) => s + i.value, 0)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Análisis Histórico */}
                    <div className="border-t pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Análisis Histórico</h2>
                            <p className="text-gray-600">Datos de los últimos 5 años con filtros aplicados</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Tendencia Histórica (Últimos 5 años)
                            </CardTitle>
                            <CardDescription>Evolución mensual de estudios aplicando los filtros actuales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={datos.tendencia_5_anios}>
                                        <defs>
                                            <linearGradient id="colorTendencia" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.8} />
                                                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                        <XAxis dataKey="mes" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                                        <YAxis />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTendencia)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Comparativa por Tipos de Estudio (Últimos 5 años)
                            </CardTitle>
                            <CardDescription>Evolución mensual separada por cada tipo de estudio</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={datos.comparativa_tipos.datos}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                                        <YAxis />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        {datos.comparativa_tipos.tipos_estudio.map((tipo, index) => (
                                            <Line key={tipo} type="monotone" dataKey={tipo} stroke={lineColors[index % lineColors.length]} strokeWidth={2} dot={{ r: 3 }} name={tipo} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comparativa y Predicción */}
                    <div className="border-t pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comparativa y Predicción</h2>
                            <p className="text-gray-600">Análisis comparativo con datos históricos y proyecciones futuras</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Comparación con hace 2 años
                                </CardTitle>
                                <CardDescription>Comparación con el mismo período hace 2 años</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Período Actual</p>
                                            <p className="text-2xl font-bold text-blue-600">{datos.comparacion_3_periodos.actual}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Hace 1 año</p>
                                            <p className="text-2xl font-bold text-gray-600">{datos.comparacion_3_periodos.hace_1_anio}</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Hace 2 años</p>
                                            <p className="text-2xl font-bold text-gray-700">{datos.comparacion_3_periodos.hace_2_anios}</p>
                                        </div>
                                    </div>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={datos.comparacion_3_periodos.comparacion_mensual}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                                <YAxis />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Bar dataKey="estudios_actual"  fill="#3B82F6" name="Actual" />
                                                <Bar dataKey="estudios_1_anio"  fill="#10B981" name="Hace 1 año" />
                                                <Bar dataKey="estudios_2_anios" fill="#9CA3AF" name="Hace 2 años" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Análisis Predictivo
                                </CardTitle>
                                <CardDescription>Proyección para el siguiente mes basada en patrones históricos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-[#189BAF]/10 to-[#157a8c]/10 p-6 rounded-lg border border-[#189BAF]/20">
                                        <div className="text-center space-y-3">
                                            <p className="text-sm text-gray-600">Predicción para</p>
                                            <p className="text-xl font-semibold text-[#189BAF]">{datos.predicciones.mes_siguiente}</p>
                                            <div className="space-y-2">
                                                <p className="text-5xl font-bold text-[#189BAF]">{datos.predicciones.prediccion_mes_siguiente}</p>
                                                <p className="text-sm text-gray-600">estudios estimados</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Años analizados</p>
                                            <p className="text-2xl font-bold text-purple-600">{datos.predicciones.anios_analizados}</p>
                                            <p className="text-xs text-gray-500 mt-1">Datos históricos</p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Mes objetivo</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {new Date().toLocaleDateString('es-ES', { month: 'long' }).charAt(0).toUpperCase() +
                                                 new Date().toLocaleDateString('es-ES', { month: 'long' }).slice(1)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date().getFullYear() + 1}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-3">Metodología de Predicción</h4>
                                        <div className="text-xs text-gray-700 space-y-2">
                                            <p>• <strong>Análisis estacional:</strong> Se analizan los datos del mismo mes en años anteriores</p>
                                            <p>• <strong>Filtros aplicados:</strong> La predicción respeta todos los filtros activos actuales</p>
                                            <p>• <strong>Promedio histórico:</strong> Se calcula el promedio de estudios en el mes objetivo</p>
                                            <div className="border-t pt-2 mt-3">
                                                <p className="text-blue-700 bg-blue-50 p-2 rounded">
                                                    <strong>Nota:</strong> La predicción se basa en el promedio de {datos.predicciones.anios_analizados} años de datos históricos para el mes de {datos.predicciones.mes_siguiente.split(' ')[0]}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-4 pb-6 text-center">
                        <p className="text-xs text-slate-400">
                            DIAHMOES · Reporte generado el {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                </div>
            </div>
        </TooltipProvider>
    );
}