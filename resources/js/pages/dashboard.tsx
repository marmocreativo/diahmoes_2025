import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Building2, MapPin, TestTube, Activity, Target, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Institucion {
    ID_INSTITUCION: number;
    INSTITUCION_NOMBRE: string;
}

interface Filtros {
    instituciones: Institucion[];
    muestra_estados: string[];
}

interface FiltrosActivos {
    fecha_desde: string;
    fecha_hasta: string;
    institucion_id?: number;
    muestra_estado?: string;
}

interface GraficasPie {
    muestra_tipo: Array<{ name: string; value: number }>;
    sitio_lesion: Array<{ name: string; value: number }>;
    tipo_estudio: Array<{ name: string; value: number }>;
}

interface TopData {
    name: string;
    value: number;
}

interface ComparacionAnual {
    actual: number;
    anio_anterior: number;
    porcentaje_cambio: number;
    comparacion_mensual: Array<{
        mes: string;
        estudios_actual: number;
        estudios_anterior: number;
    }>;
}

interface Predicciones {
    promedio_mensual: number;
    tendencia: 'creciente' | 'decreciente' | 'estable';
    datos_historicos: any[];
    prediccion_siguiente_mes?: number;
}

interface Datos {
    graficas_pie: GraficasPie;
    top_instituciones: TopData[];
    top_estados: TopData[];
    tendencia_5_anios: Array<{
        mes: string;
        total: number;
        fecha_completa: string;
    }>;
    comparacion_anual: ComparacionAnual;
    predicciones: Predicciones;
}

export default function Dashboard() {
    const { filtros, datos, filtrosActivos } = usePage<{
        filtros: Filtros;
        datos: Datos;
        filtrosActivos: FiltrosActivos;
    }>().props;

    const [fechaDesde, setFechaDesde] = useState(filtrosActivos.fecha_desde);
    const [fechaHasta, setFechaHasta] = useState(filtrosActivos.fecha_hasta);
    const [institucionId, setInstitucionId] = useState<string>(filtrosActivos.institucion_id?.toString() || '');
    const [muestraEstado, setMuestraEstado] = useState<string>(filtrosActivos.muestra_estado || '');

    const aplicarFiltros = () => {
        const params: any = {
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
        };

        if (institucionId) params.institucion_id = institucionId;
        if (muestraEstado) params.muestra_estado = muestraEstado;

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
        setInstitucionId(''); // Esto se mostrará como "todas"
        setMuestraEstado(''); // Esto se mostrará como "todos"
        
        router.get('/dashboard', {
            fecha_desde: fechaDesdeDefault,
            fecha_hasta: fechaHastaDefault,
        });
    };

    // Colores para las gráficas
    const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6'];

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

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // No mostrar etiquetas para segmentos muy pequeños
        
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize="12"
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
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

    {/* Función helper para formatear etiquetas */}
    const formatearEtiquetaPie = ({ name, percent, value }: any) => {
        const porcentaje = (percent * 100).toFixed(0);
        if (name === 'Otros') {
            return `Otros: ${porcentaje}%`;
        }
        // Para nombres largos, cortamos y agregamos el porcentaje
        const nombreCorto = name.length > 20 ? name.slice(0, 17) + '...' : name;
        return `${nombreCorto}: ${porcentaje}%`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-4 lg:p-6 text-white">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                                Dashboard Analítico
                            </h1>
                            <p className="text-white/80 opacity-90">
                                Análisis de estudios e instituciones - DIAHMOES
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6" />
                            <span className="text-sm">Datos en tiempo real</span>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Filtros de Análisis
                        </CardTitle>
                        <CardDescription>
                            Configure el período y filtros para el análisis de datos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fecha Desde</label>
                                <Input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fecha Hasta</label>
                                <Input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Institución</label>
                                <Select value={institucionId || "todas"} onValueChange={(value) => setInstitucionId(value === "todas" ? "" : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las instituciones" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todas">Todas las instituciones</SelectItem>
                                        {filtros.instituciones.map((inst) => (
                                            <SelectItem key={inst.ID_INSTITUCION} value={inst.ID_INSTITUCION.toString()}>
                                                {inst.INSTITUCION_NOMBRE}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <Select value={muestraEstado || "todos"} onValueChange={(value) => setMuestraEstado(value === "todos" ? "" : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los estados</SelectItem>
                                        {filtros.muestra_estados.map((estado) => (
                                            <SelectItem key={estado} value={estado}>
                                                {estado}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex flex-col gap-2 justify-end">
                                <Button onClick={aplicarFiltros} className="bg-[#189BAF] hover:bg-[#157a8c]">
                                    Aplicar Filtros
                                </Button>
                                <Button variant="outline" onClick={limpiarFiltros} size="sm">
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gráficas Pie - Primera fila con tablas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tipo de Muestra */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TestTube className="h-5 w-5" />
                                Tipo de Muestra
                            </CardTitle>
                            <CardDescription>
                                Distribución por tipo de muestra (elementos &lt;10% agrupados en "Otros")
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={datos.graficas_pie.muestra_tipo}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {datos.graficas_pie.muestra_tipo.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Tabla de datos */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                    Desglose Numérico
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {datos.graficas_pie.muestra_tipo.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                                />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                    Total: {datos.graficas_pie.muestra_tipo.reduce((sum, item) => sum + item.value, 0)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    

                    {/* Sitio de Lesión - ejemplo actualizado */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Target className="h-5 w-5" />
                                Sitio de Lesión
                            </CardTitle>
                            <CardDescription>
                                Distribución por sitio de lesión (elementos &lt;10% agrupados en "Otros")
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={datos.graficas_pie.sitio_lesion}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={formatearEtiquetaPie}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {datos.graficas_pie.sitio_lesion.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Tabla de datos actualizada */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                    Desglose Numérico
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {datos.graficas_pie.sitio_lesion.map((item, index) => {
                                        const total = datos.graficas_pie.sitio_lesion.reduce((sum, i) => sum + i.value, 0);
                                        const porcentaje = ((item.value / total) * 100).toFixed(1);
                                        
                                        return (
                                            <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                                    />
                                                    <span className={`font-medium ${item.name === 'Otros' ? 'italic text-gray-600' : ''}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold">{item.value}</span>
                                                    <span className="text-gray-500 text-xs ml-2">({porcentaje}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                    Total: {datos.graficas_pie.sitio_lesion.reduce((sum, item) => sum + item.value, 0)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tipo de Estudio */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5" />
                                Tipo de Estudio
                            </CardTitle>
                            <CardDescription>
                                Distribución por tipo de estudio
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={datos.graficas_pie.tipo_estudio}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {datos.graficas_pie.tipo_estudio.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Tabla de datos */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                    Desglose Numérico
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {datos.graficas_pie.tipo_estudio.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                                />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                    Total: {datos.graficas_pie.tipo_estudio.reduce((sum, item) => sum + item.value, 0)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top 10 - Segunda fila */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
{/* Top Instituciones - Gráfica de barras verticales */}
<Card>
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top 10 Instituciones
        </CardTitle>
        <CardDescription>
            Instituciones con mayor número de estudios
        </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datos.top_instituciones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        interval={0}
                        tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#3B82F6">
                        {datos.top_instituciones.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        {/* Tabla de instituciones */}
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                Ranking de Instituciones
            </div>
            <div className="max-h-40 overflow-y-auto">
                {datos.top_instituciones.map((item, index) => {
                    const total = datos.top_instituciones.reduce((sum, i) => sum + i.value, 0);
                    const porcentaje = ((item.value / total) * 100).toFixed(1);
                    
                    return (
                        <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                                    #{index + 1}
                                </span>
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                />
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
                Total: {datos.top_instituciones.reduce((sum, item) => sum + item.value, 0)}
            </div>
        </div>
    </CardContent>
</Card>

                    {/* Top Estados con tabla */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Top 10 Estados
                            </CardTitle>
                            <CardDescription>
                                Estados con mayor número de estudios
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={datos.top_estados}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="name" 
                                            angle={-45} 
                                            textAnchor="end" 
                                            height={80}
                                            interval={0}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#10B981">
                                            {datos.top_estados.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Tabla de estados */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                                    Ranking de Estados
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {datos.top_estados.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                                                    #{index + 1}
                                                </span>
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-green-600">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 px-4 py-2 font-bold text-sm">
                                    Total: {datos.top_estados.reduce((sum, item) => sum + item.value, 0)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tendencia Histórica 5 Años - Nueva fila antes de comparaciones */}
<Card>
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia Histórica (Últimos 5 años)
        </CardTitle>
        <CardDescription>
            Evolución mensual de estudios aplicando los filtros actuales
        </CardDescription>
    </CardHeader>
    <CardContent>
        <div className="h-96">
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
                        interval="preserveStartEnd"
                    />
                    <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#6b7280' }}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTendencia)"
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        
        {/* Estadísticas rápidas de la tendencia */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total 5 años</p>
                <p className="text-2xl font-bold text-blue-600">
                    {datos.tendencia_5_anios.reduce((sum, item) => sum + item.total, 0)}
                </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Promedio mensual</p>
                <p className="text-2xl font-bold text-green-600">
                    {Math.round(datos.tendencia_5_anios.reduce((sum, item) => sum + item.total, 0) / datos.tendencia_5_anios.length)}
                </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Mes más alto</p>
                <p className="text-2xl font-bold text-purple-600">
                    {Math.max(...datos.tendencia_5_anios.map(item => item.total))}
                </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Mes más bajo</p>
                <p className="text-2xl font-bold text-orange-600">
                    {Math.min(...datos.tendencia_5_anios.map(item => item.total))}
                </p>
            </div>
        </div>
    </CardContent>
</Card>

                {/* Comparación Anual y Predicciones - Tercera fila */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Comparación Anual */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Comparación Anual
                            </CardTitle>
                            <CardDescription>
                                Comparación con el mismo período del año anterior
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Métricas principales */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Período Actual</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {datos.comparacion_anual.actual}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Año Anterior</p>
                                        <p className="text-2xl font-bold text-gray-600">
                                            {datos.comparacion_anual.anio_anterior}
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-lg ${datos.comparacion_anual.porcentaje_cambio >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <p className="text-sm text-gray-600">Cambio</p>
                                        <p className={`text-2xl font-bold ${datos.comparacion_anual.porcentaje_cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {datos.comparacion_anual.porcentaje_cambio >= 0 ? '+' : ''}{datos.comparacion_anual.porcentaje_cambio}%
                                        </p>
                                    </div>
                                </div>

                                {/* Gráfica comparativa mensual */}
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datos.comparacion_anual.comparacion_mensual}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="estudios_actual" fill="#3B82F6" name="Actual" />
                                            <Bar dataKey="estudios_anterior" fill="#9CA3AF" name="Año Anterior" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Predicciones con fechas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Análisis y Predicciones
                            </CardTitle>
                            <CardDescription>
                                Tendencias y proyecciones basadas en datos históricos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Métricas de predicción */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Promedio Mensual Histórico</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {datos.predicciones.promedio_mensual} estudios
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Basado en últimos 12 meses
                                        </p>
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg ${getTendenciaColor(datos.predicciones.tendencia)}`}>
                                        <div className="flex items-center gap-2">
                                            {getTendenciaIcon(datos.predicciones.tendencia)}
                                            <p className="text-sm">Tendencia Actual</p>
                                        </div>
                                        <p className="text-xl font-bold capitalize">
                                            {datos.predicciones.tendencia}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Últimos 3 meses de análisis
                                        </p>
                                    </div>
                                </div>

                                {datos.predicciones.prediccion_siguiente_mes && (
                                    <div className="bg-gradient-to-r from-[#189BAF]/10 to-[#157a8c]/10 p-6 rounded-lg border border-[#189BAF]/20">
                                        <div className="text-center space-y-2">
                                            <p className="text-sm text-gray-600">Predicción para</p>
                                            <p className="text-lg font-semibold text-[#189BAF]">
                                                {(() => {
                                                    const nextMonth = new Date();
                                                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                                                    return nextMonth.toLocaleDateString('es-ES', { 
                                                        month: 'long', 
                                                        year: 'numeric' 
                                                    });
                                                })()}
                                            </p>
                                            <p className="text-4xl font-bold text-[#189BAF]">
                                                {datos.predicciones.prediccion_siguiente_mes}
                                            </p>
                                            <p className="text-sm text-gray-600">estudios esperados</p>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-[#189BAF]/20">
                                            <div className="grid grid-cols-3 gap-4 text-center text-xs">
                                                <div>
                                                    <p className="text-gray-500">Fecha estimada</p>
                                                    <p className="font-semibold">
                                                        {(() => {
                                                            const nextMonth = new Date();
                                                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                                                            return `1 - ${new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()} ${nextMonth.toLocaleDateString('es-ES', { month: 'short' })}`;
                                                        })()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Confianza</p>
                                                    <p className="font-semibold text-yellow-600">Media</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Método</p>
                                                    <p className="font-semibold">Media móvil</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Información adicional */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2">Información del Análisis Predictivo</h4>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <p>• Predicción basada en promedio móvil de los últimos 3 meses</p>
                                        <p>• Análisis de tendencia considera variaciones estacionales básicas</p>
                                        <p>• Los resultados son estimaciones y pueden variar según factores externos</p>
                                        <p>• Precisión estimada: ±15-20% según datos históricos</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}