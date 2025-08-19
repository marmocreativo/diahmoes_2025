import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, Filter, Eye, Edit, Trash2, ArrowRight, Download, ChevronDown, FileText, Calendar, TestTube, Microscope } from 'lucide-react';
import { type EstudioIndexProps, type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Estudios', href: '/estudios' },
];

export default function EstudiosIndex() {
    const props = usePage<EstudioIndexProps>().props;
    const { estudios, filters, medicos, instituciones, clientes, estados, tiposEstudio } = props;
    
    // Debug temporal
    console.log('Props recibidas:', props);
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/estudios', { 
            ...filters, 
            search: searchTerm,
            page: 1 
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string | null) => {
        router.get('/estudios', {
            ...filters,
            [key]: value || undefined,
            page: 1
        }, { preserveState: true });
    };

    const handleSort = (column: string) => {
        const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/estudios', {
            ...filters,
            sort: column,
            direction,
            page: 1
        }, { preserveState: true });
    };

    const getStatusColor = (estado: string | undefined) => {
        if (!estado) return 'bg-gray-100 text-gray-800 border-gray-200';
        
        switch (estado.toLowerCase()) {
            case 'completado':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'en_proceso':
            case 'en proceso':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'pendiente':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            case 'cancelado':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX');
    };

    // Función para determinar el siguiente paso basado en el estado del estudio
    const getNextStep = (estado: string | undefined) => {
        if (!estado) return 'recoleccion'; // Por defecto si no hay estado
        
        switch (estado) {
            case 'Solicitud Recolección':
                return 'recepcion';
            case 'Recepción Laboratorio':
                return 'laboratorio';
            case 'Resultados Completos':
                return 'informe';
            // Estados finales sin siguiente paso
            case 'Resultados Enviados':
            case 'Retorno Material':
            case 'Terminado':
            case 'No Adecuado':
            case 'Cancelado':
                return null;
            default:
                return 'recoleccion'; // Por defecto, comenzar desde recolección
        }
    };

    // Función para verificar si el estudio puede continuar (no ha sido enviado por correo)
    const canContinue = (estudio: any) => {
        return !estudio.FECHA_RESULTADOS_CORREO || estudio.FECHA_RESULTADOS_CORREO === '0000-00-00 00:00:00';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estudios - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Estudios</h1>
                        <p className="text-gray-600">Gestión de estudios médicos y diagnósticos</p>
                    </div>
                    <Link href="/estudios/create">
                        <Button className="bg-[#189BAF] hover:bg-[#157a8c]">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Estudio
                        </Button>
                    </Link>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Buscar Estudios</CardTitle>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Buscar por clave, folio, iniciales..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>

                        {/* Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <Select
                                    value={filters.estado || ''}
                                    onValueChange={(value) => handleFilterChange('estado', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos los estados</SelectItem>
                                        {Object.entries(estados || {}).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {String(label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.tipo_estudio || ''}
                                    onValueChange={(value) => handleFilterChange('tipo_estudio', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo de Estudio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos los tipos</SelectItem>
                                        {Object.entries(tiposEstudio || {}).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {String(label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.institucion?.toString() || ''}
                                    onValueChange={(value) => handleFilterChange('institucion', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Institución" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas las instituciones</SelectItem>
                                        {instituciones.map((institucion) => (
                                            <SelectItem key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION.toString()}>
                                                {institucion.INSTITUCION_NOMBRE}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.medico?.toString() || ''}
                                    onValueChange={(value) => handleFilterChange('medico', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Médico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos los médicos</SelectItem>
                                        {medicos.map((medico) => (
                                            <SelectItem key={medico.ID_USUARIO} value={medico.ID_USUARIO.toString()}>
                                                {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {estudios?.meta?.total || 0} estudio{(estudios?.meta?.total || 0) !== 1 ? 's' : ''} encontrado{(estudios?.meta?.total || 0) !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {estudios?.data?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th 
                                                className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('CLAVE_INTERNA')}
                                            >
                                                Folio
                                            </th>
                                            <th className="text-left p-3 font-semibold">Paciente</th>
                                            <th className="text-left p-3 font-semibold">Tipo Estudio</th>
                                            <th className="text-left p-3 font-semibold">Institución</th>
                                            <th 
                                                className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('FECHA_SOLICITUD_RECOLECCION')}
                                            >
                                                Fecha Solicitud
                                            </th>
                                            <th className="text-left p-3 font-semibold">Estado</th>
                                            <th className="text-center p-3 font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(estudios?.data || []).map((estudio) => (
                                            <tr key={estudio.ID} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-3 font-mono text-sm">
                                                    {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                                                </td>
                                                <td className="p-3">
                                                    {estudio.MUESTRA_INICIALES || 
                                                     (estudio.paciente ? `${estudio.paciente.USUARIO_NOMBRE} ${estudio.paciente.USUARIO_APELLIDOS}` : 'N/A')}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline">
                                                        {estudio.MUESTRA_TIPO_ESTUDIO}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    {estudio.institucion?.INSTITUCION_NOMBRE || 'N/A'}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {formatDate(estudio.FECHA_SOLICITUD_RECOLECCION)}
                                                </td>
                                                <td className="p-3">
                                                    <Badge className={getStatusColor(estudio.ESTUDIO_ESTADO || 'pendiente')}>
                                                        {estudio.ESTUDIO_ESTADO || 'Pendiente'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Botón de siguiente paso */}
                                                        {(() => {
                                                            const nextStep = canContinue(estudio) ? getNextStep(estudio.ESTUDIO_ESTADO) : null;
                                                            return nextStep && (
                                                                <Link href={`/estudios/${estudio.ID}/edit/${nextStep}`}>
                                                                    <Button 
                                                                        size="sm" 
                                                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                                                        title="Siguiente Paso"
                                                                    >
                                                                        <ArrowRight className="h-3 w-3 mr-1" />
                                                                        Sig
                                                                    </Button>
                                                                </Link>
                                                            );
                                                        })()}
                                                        
                                                        {/* Botón ver */}
                                                        <Link href={`/estudios/${estudio.ID}`}>
                                                            <Button size="sm" variant="outline" title="Ver detalles">
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                        
                                                        {/* Botón PDF */}
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            title="Descargar PDF"
                                                            onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}`, '_blank')}
                                                        >
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                        
                                                        {/* Dropdown de edición con los 4 pasos */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="outline" title="Editar Estudio">
                                                                    <Edit className="h-3 w-3 mr-1" />
                                                                    <ChevronDown className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/estudios/${estudio.ID}/edit/recoleccion`} className="w-full">
                                                                        <Calendar className="h-4 w-4 mr-2" />
                                                                        1. Recolección
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/estudios/${estudio.ID}/edit/recepcion`} className="w-full">
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        2. Recepción
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/estudios/${estudio.ID}/edit/laboratorio`} className="w-full">
                                                                        <TestTube className="h-4 w-4 mr-2" />
                                                                        3. Laboratorio
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/estudios/${estudio.ID}/edit/informe`} className="w-full">
                                                                        <Microscope className="h-4 w-4 mr-2" />
                                                                        4. Informe
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No se encontraron estudios con los filtros seleccionados.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {estudios?.links && estudios.links.length > 3 && (
                    <div className="flex justify-center gap-2">
                        {estudios.links.map((link, index) => {
                            if (link.url === null) {
                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        disabled
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    onClick={() => router.visit(link.url!)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}