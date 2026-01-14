import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Building2, MapPin, TestTube, Activity, Target, BarChart3, Users, Clock, CheckCircle, Download, HelpCircle, RotateCcw  } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Filtros {
    muestra_estados: string[];
    tipos_estudio: string[];
    prefijos: string[];
}

interface FiltrosActivos {
    fecha_desde: string;
    fecha_hasta: string;
    muestra_estado?: string;
    tipo_estudio?: string;
    prefijo?: string;
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
    datos: Array<{
        mes: string;
        fecha_completa: string;
        [key: string]: any; // Para los tipos de estudio dinámicos
    }>;
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
    tendencia_5_anios: Array<{
        mes: string;
        total: number;
        fecha_completa: string;
    }>;
    comparativa_tipos: ComparativaTipos;
    comparativa_mutacion: ComparativaMutacion;
    comparacion_3_periodos: Comparacion3Periodos;
    predicciones: Predicciones;
    estudios_faltantes: EstudioFaltante[];
}


export default function Dashboard() {

    const handleExportExcel = () => {
        // Construir URL con los filtros actuales del estado
        const params = new URLSearchParams();
        
        if (fechaDesde) params.append('fecha_inicio', fechaDesde);
        if (fechaHasta) params.append('fecha_fin', fechaHasta);
        if (muestraEstado) params.append('muestra_estado', muestraEstado);
        if (tipoEstudio) params.append('tipo_estudio', tipoEstudio);
        if (prefijo) params.append('prefijo', prefijo);
        
        // Abrir en nueva ventana para descargar
        window.open(`/dashboard/export-excel?${params.toString()}`, '_blank');
    };

    const { filtros, datos, filtrosActivos } = usePage<{
        filtros: Filtros;
        datos: Datos;
        filtrosActivos: FiltrosActivos;
    }>().props;

    const [fechaDesde, setFechaDesde] = useState(filtrosActivos.fecha_desde);
    const [fechaHasta, setFechaHasta] = useState(filtrosActivos.fecha_hasta);
    const [muestraEstado, setMuestraEstado] = useState<string>(filtrosActivos.muestra_estado || '');
    const [tipoEstudio, setTipoEstudio] = useState<string>(filtrosActivos.tipo_estudio || '');
    const [prefijo, setPrefijo] = useState<string>(filtrosActivos.prefijo || '');

    const aplicarFiltros = () => {
        const params: any = {
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
        };

        if (muestraEstado) params.muestra_estado = muestraEstado;
        if (tipoEstudio) params.tipo_estudio = tipoEstudio;
        if (prefijo) params.prefijo = prefijo;

        router.get('/dashboard', params, {
            preserveState: true,
        });
    };

    const limpiarFiltros = () => {
        const hoy = new Date();
        const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        const fechaDesdeDefault = primerDiaDelMes.toISOString().split('T')[0];
        const fechaHastaDefault = hoy.toISOString().split('T')[0];
        
        setFechaDesde(fechaDesdeDefault);
        setFechaHasta(fechaHastaDefault);
        setMuestraEstado('');
        setTipoEstudio('');
        setPrefijo('');
        
        router.get('/dashboard', {
            fecha_desde: fechaDesdeDefault,
            fecha_hasta: fechaHastaDefault,
        });
    };

    // Colores para las gráficas
    const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6'];
    const lineColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

    const getTendenciaColor = (tendencia: string) => {
        switch (tendencia) {
            case 'creciente':
                return 'text-green-600 bg-green-100';
            case 'decreciente':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-blue-600 bg-blue-100';
        }
    };

    const getTendenciaIcon = (tendencia: string) => {
        switch (tendencia) {
            case 'creciente':
                return <TrendingUp className="h-4 w-4" />;
            case 'decreciente':
                return <TrendingDown className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getConfianzaColor = (confianza: string) => {
        switch (confianza) {
            case 'alta':
                return 'text-green-600 bg-green-100';
            case 'media':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-red-600 bg-red-100';
        }
    };

    const formatearPeriodo = () => {
        const desde = new Date(fechaDesde).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const hasta = new Date(fechaHasta).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        return `${desde} - ${hasta}`;
    };

    return (
        <TooltipProvider>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard - DIAHMOES" />
                
                <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                    {/* Header Minimalista */}
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
                                
                                {/* Filtros en una sola fila */}
                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
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
                                            <Select value={muestraEstado || "todos"} onValueChange={(value) => setMuestraEstado(value === "todos" ? "" : value)}>
                                                <SelectTrigger className="bg-white text-black border-gray-300">
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todos los estados</SelectItem>
                                                    {filtros.muestra_estados.map((estado) => (
                                                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 lg:col-span-1">
                                            <Select value={tipoEstudio || "todos"} onValueChange={(value) => setTipoEstudio(value === "todos" ? "" : value)}>
                                                <SelectTrigger className="bg-white text-black border-gray-300">
                                                    <SelectValue placeholder="Tipo de Estudio" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todos los tipos</SelectItem>
                                                    {filtros.tipos_estudio.map((tipo) => (
                                                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 lg:col-span-1">
                                            <Select value={prefijo || "todos"} onValueChange={(value) => setPrefijo(value === "todos" ? "" : value)}>
                                                <SelectTrigger className="bg-white text-black border-gray-300">
                                                    <SelectValue placeholder="Prefijo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todos los prefijos</SelectItem>
                                                    {filtros.prefijos.map((pref) => (
                                                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
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

                    {/* Métricas Principales y Gráficas - Segunda fila con layout mejorado */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Métricas principales en columnas más pequeñas */}
                        <div className="lg:col-span-2">
                            <Card className="border-2 border-blue-100 h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        Total
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-3 w-3 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Total de estudios en el período</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {datos.metricas_principales.total_estudios}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Estudios
                                    </p>
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
                                            <TooltipTrigger>
                                                <HelpCircle className="h-3 w-3 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Estudios en proceso</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-orange-600">
                                        {datos.metricas_principales.pendientes}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        En proceso
                                    </p>
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
                                            <TooltipTrigger>
                                                <HelpCircle className="h-3 w-3 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Estudios finalizados</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        {datos.metricas_principales.completados}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Finalizados
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tipo de Estudio - Card más grande */}
                        <div className="lg:col-span-3">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Activity className="h-5 w-5" />
                                        Tipo de Estudio
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-4 w-4 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Distribución de estudios por tipo</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Contenido existente de tipo de estudio */}
                                    <div className="space-y-4">
                                        <div className="w-full bg-gray-200 rounded-full h-8 flex overflow-hidden">
                                            {datos.graficas_pie.tipo_estudio.map((tipo, index) => {
                                                const porcentaje = (tipo.value / datos.metricas_principales.total_estudios) * 100;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="h-full flex items-center justify-center text-white text-xs font-medium"
                                                        style={{
                                                            width: `${porcentaje}%`,
                                                            backgroundColor: pieColors[index % pieColors.length]
                                                        }}
                                                        title={`${tipo.name}: ${tipo.value} (${Math.round(porcentaje)}%)`}
                                                    >
                                                        {porcentaje > 10 && `${Math.round(porcentaje)}%`}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {datos.graficas_pie.tipo_estudio.map((tipo, index) => {
                                                const porcentaje = (tipo.value / datos.metricas_principales.total_estudios) * 100;
                                                return (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                                            />
                                                            <span className="text-sm font-medium">{tipo.name}</span>
                                                        </div>
                                                        <span className="text-sm font-bold">
                                                            {tipo.value} ({Math.round(porcentaje)}%)
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Estado de Mutación - Card más grande */}
                        <div className="lg:col-span-3">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <TestTube className="h-5 w-5" />
                                        Estado de Mutación
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-4 w-4 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Distribución por estado de mutación (KRAS, NRAS, BRAF)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Los datos ahora vienen directamente como totales */}
                                        {(() => {
                                            const total = datos.comparativa_mutacion.mutado + datos.comparativa_mutacion.no_mutado + datos.comparativa_mutacion.invalido;
                                            
                                            const datosGrafica = [
                                                { name: 'Mutado', value: datos.comparativa_mutacion.mutado, color: '#EF4444' },
                                                { name: 'No Mutado', value: datos.comparativa_mutacion.no_mutado, color: '#10B981' },
                                                { name: 'Inválido/Sin Datos', value: datos.comparativa_mutacion.invalido, color: '#6B7280' }
                                            ].filter(item => item.value > 0);

                                            return (
                                                <>
                                                    <div className="w-full bg-gray-200 rounded-full h-8 flex overflow-hidden">
                                                        {datosGrafica.map((item, index) => {
                                                            const porcentaje = total > 0 ? (item.value / total) * 100 : 0;
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="h-full flex items-center justify-center text-white text-xs font-medium"
                                                                    style={{
                                                                        width: `${porcentaje}%`,
                                                                        backgroundColor: item.color
                                                                    }}
                                                                    title={`${item.name}: ${item.value} (${Math.round(porcentaje)}%)`}
                                                                >
                                                                    {porcentaje > 10 && `${Math.round(porcentaje)}%`}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {datosGrafica.map((item, index) => {
                                                            const porcentaje = total > 0 ? (item.value / total) * 100 : 0;
                                                            return (
                                                                <div key={index} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div 
                                                                            className="w-3 h-3 rounded-full"
                                                                            style={{ backgroundColor: item.color }}
                                                                        />
                                                                        <span className="text-sm font-medium">{item.name}</span>
                                                                    </div>
                                                                    <span className="text-sm font-bold">
                                                                        {item.value} ({Math.round(porcentaje)}%)
                                                                    </span>
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

                    {/* Top 10 - Tercera fila */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Instituciones con tabla completa */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Top 10 Instituciones
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Las 10 instituciones con más estudios en el período</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardTitle>
                                <CardDescription>
                                    Instituciones con mayor número de estudios
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datos.top_instituciones}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="name" 
                                                angle={-45} 
                                                textAnchor="end" 
                                                height={80}
                                                interval={0}
                                                tick={{ fontSize: 10 }}
                                            />
                                            <YAxis />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                {/* Tabla completa de todas las instituciones */}
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                        Todas las Instituciones ({datos.todas_instituciones.length})
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {datos.todas_instituciones.map((item, index) => {
                                            const total = datos.todas_instituciones.reduce((sum, i) => sum + i.value, 0);
                                            const porcentaje = ((item.value / total) * 100).toFixed(1);
                                            
                                            return (
                                                <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm hover:bg-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold min-w-[30px] text-center">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-medium">{item.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-[#189BAF]">{item.value}</span>
                                                        <span className="text-gray-500 text-xs ml-2">({porcentaje}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                        Total: {datos.todas_instituciones.reduce((sum, item) => sum + item.value, 0)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Estados con tabla completa */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Top 10 Estados
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Los 10 estados con más estudios en el período</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardTitle>
                                <CardDescription>
                                    Estados con mayor número de estudios
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datos.top_estados}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="name" 
                                                angle={-45} 
                                                textAnchor="end" 
                                                height={60}
                                                interval={0}
                                                tick={{ fontSize: 11 }}
                                            />
                                            <YAxis />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#10B981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                {/* Tabla completa de todos los estados */}
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                        Todos los Estados ({datos.todos_estados.length})
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {datos.todos_estados.map((item, index) => {
                                            const total = datos.todos_estados.reduce((sum, i) => sum + i.value, 0);
                                            const porcentaje = ((item.value / total) * 100).toFixed(1);
                                            
                                            return (
                                                <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm hover:bg-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold min-w-[30px] text-center">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-medium">{item.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-green-600">{item.value}</span>
                                                        <span className="text-gray-500 text-xs ml-2">({porcentaje}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                        Total: {datos.todos_estados.reduce((sum, item) => sum + item.value, 0)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Título para separar - Análisis Histórico */}
                    <div className="border-t pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Análisis Histórico</h2>
                            <p className="text-gray-600">Datos de los últimos 5 años con filtros aplicados</p>
                        </div>
                    </div>

                    {/* Tendencia Histórica 5 Años - Cuarta fila */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Tendencia Histórica (Últimos 5 años)
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Evolución mensual de estudios aplicando los filtros actuales</p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <CardDescription>
                                Evolución mensual de estudios aplicando los filtros actuales
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={datos.tendencia_5_anios}>
                                        <defs>
                                            <linearGradient id="colorTendencia" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                        <XAxis 
                                            dataKey="mes" 
                                            tick={{ fontSize: 11 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="total" 
                                            stroke="#3B82F6" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorTendencia)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comparativa por Tipos de Estudio */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Comparativa por Tipos de Estudio (Últimos 5 años)
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Evolución mensual separada por cada tipo de estudio</p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <CardDescription>
                                Evolución mensual separada por cada tipo de estudio
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={datos.comparativa_tipos.datos}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="mes"
                                            tick={{ fontSize: 10 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        {datos.comparativa_tipos.tipos_estudio.map((tipo, index) => (
                                            <Line 
                                                key={tipo}
                                                type="monotone" 
                                                dataKey={tipo} 
                                                stroke={lineColors[index % lineColors.length]}
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                                name={tipo}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Título para separar - Comparativa y Predicción */}
                    <div className="border-t pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Posibles errores</h2>
                            <p className="text-gray-600">Busqueda de estudios con datos no capturados</p>
                        </div>
                    </div>

                    {/* Estudios Faltantes - Nueva sección */}
                        {datos.estudios_faltantes && datos.estudios_faltantes.length > 0 && (
                            <>
                                <div className="border-t pt-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-red-700 mb-2">⚠️ Estudios Faltantes Detectados</h2>
                                        <p className="text-gray-600">
                                            Se detectaron {datos.estudios_faltantes.length} estudios que deberían aparecer en los resultados pero fueron filtrados
                                        </p>
                                    </div>
                                </div>

                                <Card className="border-red-200 bg-red-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-red-700">
                                            <Activity className="h-5 w-5" />
                                            Estudios que no aparecen en los filtros actuales
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle className="h-4 w-4 text-red-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Estos estudios están en secuencias numéricas de los resultados pero no aparecen por diferencias en fechas u otros campos</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </CardTitle>
                                        <CardDescription>
                                            Estudios que forman parte de la secuencia numérica pero no cumplen con los filtros aplicados
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b border-red-200">
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Clave Interna</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Prefijo</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Año</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Seriado</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Fecha Recepción</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Tipo Estudio</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Estado</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Razón</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-red-700">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {datos.estudios_faltantes.map((estudio, index) => (
                                                        <tr key={index} className="border-b border-red-100 hover:bg-red-100">
                                                            <td className="py-2 px-3 font-mono text-sm">{estudio.clave_interna}</td>
                                                            <td className="py-2 px-3">{estudio.clave}</td>
                                                            <td className="py-2 px-3">{estudio.anio}</td>
                                                            <td className="py-2 px-3 font-bold">{estudio.seriado}</td>
                                                            <td className="py-2 px-3 text-sm">
                                                                {estudio.fecha_recepcion ? 
                                                                    new Date(estudio.fecha_recepcion).toLocaleDateString('es-ES') : 
                                                                    'Sin fecha'
                                                                }
                                                            </td>
                                                            <td className="py-2 px-3 text-sm">{estudio.tipo_estudio}</td>
                                                            <td className="py-2 px-3 text-sm">{estudio.estado}</td>
                                                            <td className="py-2 px-3 text-xs text-red-600">{estudio.razon_faltante}</td>
                                                            <td className="py-2 px-3">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                                                    onClick={() => window.open(estudio.url, '_blank')}
                                                                >
                                                                    Ver Estudio
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                <strong>💡 Sugerencia:</strong> Estos estudios no aparecen en los resultados actuales porque no cumplen con uno o más filtros. 
                                                Revisa las fechas de recepción, tipos de estudio o estados para determinar si necesitan corrección.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                    {/* Título para separar - Comparativa y Predicción */}
                    <div className="border-t pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comparativa y Predicción</h2>
                            <p className="text-gray-600">Análisis comparativo con datos históricos y proyecciones futuras</p>
                        </div>
                    </div>

                    {/* Comparación y Predicciones - Quinta fila */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Comparación 2 años */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Comparación con hace 2 años
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Comparación del período actual vs el mismo período hace 2 años</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardTitle>
                                <CardDescription>
                                    Comparación con el mismo período hace 2 años
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Métricas principales */}
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

                                    {/* Gráfica comparativa mensual */}
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={datos.comparacion_3_periodos.comparacion_mensual}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                                <YAxis />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Bar dataKey="estudios_actual" fill="#3B82F6" name="Actual" />
                                                <Bar dataKey="estudios_1_anio" fill="#10B981" name="Hace 1 año" />
                                                <Bar dataKey="estudios_2_anios" fill="#9CA3AF" name="Hace 2 años" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Predicciones mejoradas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Análisis Predictivo
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Predicción para el siguiente mes basada en datos históricos</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardTitle>
                                <CardDescription>
                                    Proyección para el siguiente mes basada en patrones históricos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Predicción del mes siguiente */}
                                    <div className="bg-gradient-to-r from-[#189BAF]/10 to-[#157a8c]/10 p-6 rounded-lg border border-[#189BAF]/20">
                                        <div className="text-center space-y-3">
                                            <p className="text-sm text-gray-600">Predicción para</p>
                                            <p className="text-xl font-semibold text-[#189BAF]">
                                                {datos.predicciones.mes_siguiente}
                                            </p>
                                            <div className="space-y-2">
                                                <p className="text-5xl font-bold text-[#189BAF]">
                                                    {datos.predicciones.prediccion_mes_siguiente}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    estudios estimados
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estadísticas del análisis */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Años analizados</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {datos.predicciones.anios_analizados}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Datos históricos
                                            </p>
                                        </div>
                                        
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Mes objetivo</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {new Date().toLocaleDateString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + 
                                                new Date().toLocaleDateString('es-ES', { month: 'long' }).slice(1)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date().getFullYear() + 1}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Descripción del método */}
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


                </div>
            </AppLayout>
        </TooltipProvider>
    );
}