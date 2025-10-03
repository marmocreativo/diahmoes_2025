import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Search, X, Filter, Eye, Edit, Download, ArrowRight, Calendar, FileText, TestTube, Microscope, Plus, MessageCircle, Printer, Trash2, Mail, CheckCircle, Clock, ChevronDown, ChevronUp, Monitor, Smartphone, Settings, Wrench, AlertTriangle } from 'lucide-react';
import { EstudioIndexProps } from '@/types/estudios';
import WhatsAppDialog from '@/components/WhatsAppDialog';

export default function EstudiosIndex() {
    // Tipar correctamente las props
    const { estudios, filters, estados } = usePage<EstudioIndexProps>().props;
    
    // Estados para el buscador
    // Estados para el buscador
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [fechaDesde, setFechaDesde] = useState(filters?.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filters?.fecha_hasta || '');

    // NUEVO: Estado para controlar cuándo hacer búsqueda automática
    const [shouldAutoSearch, setShouldAutoSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Estado para manejar el dropdown de fechas
    const [expandedDateDropdown, setExpandedDateDropdown] = useState<number | null>(null)

    // Estado para manejar el dropdown
    const [showMaintenanceDropdown, setShowMaintenanceDropdown] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);

    // Estado para detectar móvil y alternar vistas
    const [isMobile, setIsMobile] = useState(false);
    const [forceDesktopView, setForceDesktopView] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    // Estado para el dialog de WhatsApp
    const [whatsappDialog, setWhatsappDialog] = useState<{
        isOpen: boolean;
        estudio: any;
    }>({
        isOpen: false,
        estudio: null
    });

    // Estado para el botón de eliminar
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Función para formatear fecha y hora
    const formatearFechaHora = (fechaString: string | null) => {
        if (!fechaString || fechaString === '0000-00-00 00:00:00') {
            return { fecha: 'N/A', hora: 'N/A' };
        }
        
        try {
            // Usar el mismo fix de zona horaria que implementamos
            const fecha = fechaString.split('T')[0];
            const hora = fechaString.split('T')[1]?.substring(0, 5) || 'N/A';
            
            // Formatear la fecha a formato legible
            const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            return { fecha: fechaFormateada, hora };
        } catch (error) {
            return { fecha: 'Error', hora: 'Error' };
        }
    };

    // Componente para el dropdown de fechas
    const FechasDropdown = ({ estudio }: { estudio: any }) => {
    const fechas = [
        {
            label: 'Solicitud Recolección',
            fecha: estudio.FECHA_SOLICITUD_RECOLECCION,
            icon: '📅',
            color: 'text-orange-600'
        },
        {
            label: 'Recepción',
            fecha: estudio.FECHA_RECEPCION,
            icon: '📦',
            color: 'text-blue-600'
        },
        {
            label: 'Recepción Laboratorio',
            fecha: estudio.FECHA_RECEPCION_LABORATORIO,
            icon: '🧪',
            color: 'text-purple-600'
        },
        {
            label: 'Obtención Resultados',
            fecha: estudio.FECHA_OBTENCION_RESULTADOS,
            icon: '📊',
            color: 'text-green-600'
        },
        {
            label: 'Resultados Enviados',
            fecha: estudio.FECHA_RESULTADOS_CORREO,
            icon: '📧',
            color: 'text-teal-600'
        }
    ];

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">
                        Historial de Fechas
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">
                        {estudio.CLAVE_INTERNA}
                    </span>
                </div>
                
                <div className="space-y-2">
                    {fechas.map((item, index) => {
                        const { fecha, hora } = formatearFechaHora(item.fecha);
                        const tieneValor = item.fecha && item.fecha !== '0000-00-00 00:00:00';
                        
                        return (
                            <div 
                                key={index}
                                className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                                    tieneValor ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-25 opacity-60'
                                }`}
                            >
                                <div className="flex items-center space-x-2 flex-1">
                                    <span className="text-sm">{item.icon}</span>
                                    <div className="flex-1">
                                        <div className={`text-xs font-medium ${item.color}`}>
                                            {item.label}
                                        </div>
                                        {tieneValor ? (
                                            <div className="text-xs text-gray-600">
                                                {fecha} • {hora}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400 italic">
                                                Pendiente
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {tieneValor && (
                                    <div className="text-green-500">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Footer con estadísticas */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>
                            Completado: {fechas.filter(f => f.fecha && f.fecha !== '0000-00-00 00:00:00').length}/5
                        </span>
                        <span>
                            {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

    // Función para reparar estudios
    const handleRepararEstudios = async () => {
        if (!window.confirm('¿Estás seguro de que deseas ejecutar la reparación de estudios?\n\nEsto actualizará fechas inválidas y estados legacy en todos los estudios.')) {
            return;
        }

        setIsRepairing(true);
        setShowMaintenanceDropdown(false);

        try {
            const response = await fetch('/estudios/reparar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                const { resumen } = data;
                const mensaje = `Reparación completada exitosamente:
                
    • Total de estudios procesados: ${resumen.total_estudios}
    • Estudios modificados: ${resumen.estudios_modificados}
    • Fechas reparadas: ${resumen.fechas_reparadas}
    • Estados legacy actualizados: ${resumen.estados_legacy_reparados}
    • Estados por fecha de correo: ${resumen.estados_por_fecha_correo}
    • Estados por envíos existentes: ${resumen.estados_por_envios}
    • Errores encontrados: ${resumen.total_errores}`;

                alert(mensaje);
                
                // Recargar la página para mostrar los cambios
                window.location.reload();
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error reparando estudios:', error);
            
            // Type narrowing para manejar el error correctamente
            let errorMessage = 'Error desconocido';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            alert('Error al reparar estudios: ' + errorMessage);
        } finally {
            setIsRepairing(false);
        }
    };

    

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Detectanto el estado para dar color
    
    const getEstadoClasses = (estado: string | undefined) => {
        switch (estado) {
            case 'Solicitud Recolección':
                return 'bg-orange-50 text-orange-800 border-orange-200';
            case 'Recepción Laboratorio':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'Resultados Completos':
                return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'Resultados Enviados':
                return 'bg-green-50 text-green-800 border-green-200';
            case 'Cancelado':
                return 'bg-gray-50 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    // Función para determinar el siguiente paso según el estado
    const getSiguientePaso = (estado: string | undefined) => {
        switch (estado) {
            case 'Solicitud Recolección':
                return {
                    href: 'recepcion',
                    texto: 'Recepción',
                    icono: <FileText className="h-4 w-4" />,
                    color: 'text-blue-600 hover:text-blue-700'
                };
            case 'Recepción Laboratorio':
                return {
                    href: 'laboratorio',
                    texto: 'Laboratorio',
                    icono: <TestTube className="h-4 w-4" />,
                    color: 'text-purple-600 hover:text-purple-700'
                };
            case 'Resultados Completos':
                return {
                    href: 'informe',
                    texto: 'Informe',
                    icono: <Microscope className="h-4 w-4" />,
                    color: 'text-green-600 hover:text-green-700'
                };
            case 'Resultados Enviados':
            default:
                return null; // No mostrar botón
        }
    };

    // Función para determinar si mostrar botones de edición y borrar
    const mostrarBotonesEdicion = (estado: string | undefined) => {
        return estado !== 'Resultados Enviados';
    };


    // Funciones existentes (sin cambios)
    const openWhatsAppDialog = (estudio: any) => {
        setWhatsappDialog({
            isOpen: true,
            estudio
        });
    };

    const closeWhatsAppDialog = () => {
        setWhatsappDialog({
            isOpen: false,
            estudio: null
        });
    };

    const handleDeleteEstudio = (estudio: any) => {
        const claveEstudio = estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`;
        
        const confirmMessage = `¿Estás seguro de que deseas eliminar el estudio ${claveEstudio}?\n\nEsta acción NO se puede deshacer y eliminará todos los datos asociados.`;
        
        if (window.confirm(confirmMessage)) {
            const finalConfirm = confirm('Esta es tu última oportunidad. ¿Realmente deseas eliminar este estudio?');
            
            if (finalConfirm) {
                setDeletingId(estudio.ID);
                
                router.delete(`/estudios/${estudio.ID}`, {
                    onSuccess: () => {
                        // El controlador ya redirige con mensaje de éxito
                    },
                    onError: (errors) => {
                        console.error('Error al eliminar estudio:', errors);
                        alert('Error al eliminar el estudio. Por favor, inténtalo de nuevo.');
                    },
                    onFinish: () => {
                        setDeletingId(null);
                    }
                });
            }
        }
    };

    // Búsqueda en tiempo real con debounce
    useEffect(() => {
        // Solo hacer búsqueda automática si el flag está activado Y ha cambiado el término
        if (!shouldAutoSearch || searchTerm === filters?.search) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (searchTerm !== filters?.search) {
                handleSearch(true); // true indica que es búsqueda automática
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, shouldAutoSearch]);

     const handleSearch = (isAutoSearch = false) => {
        setIsSearching(true);
        
        // Si es búsqueda automática (por typing), resetear a página 1
        // Si es búsqueda manual (botón), mantener página actual
        const searchParams = {
            search: searchTerm,
            estado: selectedEstado,
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
            // Solo resetear página en búsqueda automática
            ...(isAutoSearch ? {} : { page: estudios?.meta?.current_page || 1 })
        };

        router.get('/estudios', searchParams, {
            preserveState: true,
            preserveScroll: true,
            replace: false, // CAMBIADO: No reemplazar historial
            onFinish: () => {
                setIsSearching(false);
                // Después de la primera búsqueda, permitir auto-búsqueda
                setShouldAutoSearch(true);
            }
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedEstado('');
        setFechaDesde('');
        setFechaHasta('');
        setShouldAutoSearch(false); // Desactivar auto-búsqueda temporalmente
        
        router.get('/estudios', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: false,
            onFinish: () => {
                // Reactivar auto-búsqueda después de limpiar
                setTimeout(() => setShouldAutoSearch(true), 100);
            }
        });
    };

    // NUEVA: Función específica para manejar cambios en el input de búsqueda
    const handleSearchInputChange = (value: string) => {
        setSearchTerm(value);
        // Activar auto-búsqueda solo después del primer cambio
        if (!shouldAutoSearch) {
            setShouldAutoSearch(true);
        }
    };

    // CORREGIDA: Función para manejar paginación
    const handlePaginationClick = (url: string) => {
        setIsSearching(true);
        
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: false, // Hacer scroll arriba en paginación
            replace: false,
            onFinish: () => {
                setIsSearching(false);
            }
        });
    };

    // Función para alternar expansión de tarjetas móviles
    const toggleCardExpansion = (estudioId: number) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(estudioId)) {
            newExpanded.delete(estudioId);
        } else {
            newExpanded.add(estudioId);
        }
        setExpandedCards(newExpanded);
    };
    
    // Función para renderizar el estado de envíos
    const renderEstadoEnvios = (estadisticas: any) => {
    if (!estadisticas || estadisticas.total === 0) {
        return (
            <div className="text-center text-gray-400">
                <Mail className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Sin envíos</div>
            </div>
        );
    }

    return (
        <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-sm font-medium text-blue-600">
                    {estadisticas.total}
                </span>
                <Mail className="h-4 w-4 text-blue-500" />
            </div>
            
            <div className="text-xs text-gray-500">
                {estadisticas.total === 1 ? 'correo enviado' : 'correos enviados'}
            </div>
        </div>
    );
};
    // NUEVA: Componente de tarjeta móvil
    const MobileEstudioCard = ({ estudio }: { estudio: any }) => {
        const isExpanded = expandedCards.has(estudio.ID);
        
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
                {/* Header de la tarjeta - siempre visible */}
                <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="font-mono text-sm font-bold text-gray-900 mb-1">
                                {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                            </div>
                            {estudio.FOLIO_MERCK && (
                                <div className="text-xs text-gray-500 mb-2">Merck: {estudio.FOLIO_MERCK}</div>
                            )}
                            <div className="text-sm font-medium text-gray-900">
                                {estudio.paciente?.USUARIO_NOMBRE || 'N/A'} {estudio.paciente?.USUARIO_APELLIDOS || ''} 
                                <span className="font-bold ml-1">{estudio.MUESTRA_INICIALES || 'N/A'}</span>
                            </div>
                        </div>
                        
                        {/* Estado y toggle */}
                        <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoClasses(estudio.ESTUDIO_ESTADO)}`}>
                                {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                            </span>
                            <button
                                onClick={() => toggleCardExpansion(estudio.ID)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Información básica siempre visible */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                {estudio.MUESTRA_TIPO_ESTUDIO || 'N/A'}
                            </span>
                            <div className="text-xs text-gray-500">
                                {estudio.FECHA_SOLICITUD_RECOLECCION && estudio.FECHA_SOLICITUD_RECOLECCION !== '0000-00-00 00:00:00' 
                                    ? new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toLocaleDateString('es-MX')
                                    : 'N/A'
                                }
                            </div>
                        </div>

                        {/* Acciones rápidas - siempre visibles */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={`/estudios/${estudio.ID}`}
                                    className="text-[#189BAF] hover:text-[#157a8c] transition-colors"
                                    title="Ver estudio"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                {/* BOTÓN DE SIGUIENTE PASO */}
                                {(() => {
                                    const siguientePaso = getSiguientePaso(estudio.ESTUDIO_ESTADO);
                                    return siguientePaso ? (
                                        <Link
                                            href={`/estudios/${estudio.ID}/edit/${siguientePaso.href}`}
                                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                            title={`Ir a ${siguientePaso.texto}`}
                                        >
                                            {siguientePaso.icono}
                                            <span>{siguientePaso.texto}</span>
                                        </Link>
                                    ) : null;
                                })()}
                            </div>

                            {/* Estado de envíos compacto */}
                            <div className="text-xs">
                                {renderEstadoEnvios(estudio.estadisticas_envios)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido expandible */}
                {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="space-y-3">
                            {/* Información adicional */}
                            {estudio.medico && (
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Médico</div>
                                    <div className="text-sm text-gray-900">
                                        {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                                    </div>
                                </div>
                            )}

                            {estudio.institucion && (
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Institución</div>
                                    <div className="text-sm text-gray-900">
                                        {estudio.institucion.INSTITUCION_NOMBRE}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Estudio Solicitado</div>
                                <div className="text-sm text-gray-900">
                                    {estudio.R_ESTUDIO_SOLICITADO || 'No especificado'}
                                </div>
                            </div>

                            {/* Todas las acciones expandidas */}
                            <div>
                                
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Todas las Acciones</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Link
                                            href={`/estudios/${estudio.ID}`}
                                            className="w-full mb-2 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                                            title="Ver estudio"
                                        >
                                            <Eye className="h-5 w-5" />
                                            <span>Ver estudio</span>
                                        </Link>
                                        
                                        <button 
                                            onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}`, '_blank')}
                                            className="w-full mb-2 flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                                            title="Descargar PDF"
                                        >
                                            <Download className="h-5 w-5" />
                                            <span>PDF</span>
                                        </button>

                                        <button 
                                            onClick={() => openWhatsAppDialog(estudio)}
                                            className="w-full mb-2 flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                                            title="Enviar por WhatsApp"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            <span> WhatsApp</span>
                                        </button>
                                        <button 
                                            onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}&imprimir=si`, '_blank')}
                                            className="w-full mb-2 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                        >
                                            <Printer className="h-4 w-4" />
                                            <span>Imprimir</span>
                                        </button>
                                        <Link
                                            href={`/estudios/${estudio.ID}/envios-correos`}
                                            className="w-full mb-2 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span>Envíos</span>
                                        </Link>
                                    </div>
                                    <div>
                                        <Link
                                            href={`/estudios/${estudio.ID}/edit/recoleccion`}
                                            className="mb-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            <span>Recolección</span>
                                        </Link>

                                        <Link
                                            href={`/estudios/${estudio.ID}/edit/recepcion`}
                                            className="mb-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>Recepción</span>
                                        </Link>

                                        <Link
                                            href={`/estudios/${estudio.ID}/edit/laboratorio`}
                                            className="mb-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors"
                                        >
                                            <TestTube className="h-4 w-4" />
                                            <span>Laboratorio</span>
                                        </Link>

                                        <Link
                                            href={`/estudios/${estudio.ID}/edit/informe`}
                                            className="mb-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                                        >
                                            <Microscope className="h-4 w-4" />
                                            <span>Informe</span>
                                        </Link>

                                        {/* Botón de eliminar */}
                                        <button
                                            onClick={() => handleDeleteEstudio(estudio)}
                                            disabled={deletingId === estudio.ID}
                                            className="mb-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deletingId === estudio.ID ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                            <span>Eliminar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const hasActiveFilters = searchTerm || selectedEstado || fechaDesde || fechaHasta;
    const showMobileView = isMobile && !forceDesktopView;

    return (
        <AppLayout>
            <Head title="Estudios - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Gestión de Estudios</h1>
                            <p className="text-white/80 opacity-90">
                                Administra estudios médicos y diagnósticos del sistema DIAHMOES
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Toggle de vista para móviles */}
                            {isMobile && (
                                <button
                                    onClick={() => setForceDesktopView(!forceDesktopView)}
                                    className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                                    title={forceDesktopView ? "Cambiar a vista móvil" : "Cambiar a vista escritorio"}
                                >
                                    {forceDesktopView ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                </button>
                            )}
                            
                            {/* Dropdown de Funciones de Mantenimiento */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMaintenanceDropdown(!showMaintenanceDropdown)}
                                    className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                                    title="Funciones de mantenimiento"
                                >
                                    <Settings className="h-4 w-4" />
                                    {!showMobileView && <span className="text-sm">Mantenimiento</span>}
                                </button>

                                {/* Dropdown Menu */}
                                {showMaintenanceDropdown && (
                                    <>
                                        {/* Overlay para cerrar el dropdown */}
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setShowMaintenanceDropdown(false)}
                                        ></div>
                                        
                                        {/* Menu Items */}
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                            <div className="py-2">
                                                {/* Header del dropdown */}
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Funciones de Mantenimiento
                                                    </div>
                                                </div>
                                                
                                                {/* Opción: Reparar Estudios */}
                                                <button
                                                    onClick={handleRepararEstudios}
                                                    disabled={isRepairing}
                                                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isRepairing ? (
                                                        <div className="h-4 w-4 mr-3 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                                                    ) : (
                                                        <Wrench className="h-4 w-4 mr-3 text-orange-500" />
                                                    )}
                                                    <div className="text-left">
                                                        <div className="font-medium">Reparar Estudios</div>
                                                        <div className="text-xs text-gray-500">
                                                            Corregir fechas inválidas y estados legacy
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Separador para futuras opciones */}
                                                <div className="border-t border-gray-100 my-1"></div>
                                                
                                                {/* Placeholder para futuras opciones */}
                                                <div className="px-4 py-3 text-xs text-gray-400 italic">
                                                    Más funciones próximamente...
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <Link 
                                href="/estudios/create"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span className={showMobileView ? "hidden sm:inline" : ""}>Nuevo Estudio</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Buscador Principal - Responsive */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className={`flex items-center ${showMobileView ? 'flex-col' : ''} space-x-4 ${showMobileView ? 'space-x-0 space-y-4' : ''}`}>
                        {/* Campo de búsqueda principal */}
                        <div className={`${showMobileView ? 'w-full' : 'flex-1'} relative`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchInputChange(e.target.value)} // CAMBIADO
                                placeholder={showMobileView ? "Buscar estudios..." : "Buscar por clave, folio Merck, médico, paciente o institución..."}
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                disabled={isSearching} // NUEVO: Deshabilitar durante búsqueda
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => handleSearchInputChange('')} // ← CAMBIAR de setSearchTerm a handleSearchInputChange
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className={`flex items-center space-x-2 ${showMobileView ? 'w-full justify-between' : ''}`}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                                    showFilters || hasActiveFilters
                                        ? 'border-[#189BAF] bg-[#189BAF]/5 text-[#189BAF]'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="h-5 w-5" />
                                <span>Filtros</span>
                                {hasActiveFilters && (
                                    <span className="bg-[#189BAF] text-white text-xs px-2 py-1 rounded-full">
                                        {[searchTerm, selectedEstado, fechaDesde, fechaHasta].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearSearch}
                                    className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                                    title="Limpiar filtros"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filtros adicionales colapsables */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className={`grid grid-cols-1 ${showMobileView ? 'gap-4' : 'md:grid-cols-3 gap-4'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                    <select
                                        value={selectedEstado}
                                        onChange={(e) => setSelectedEstado(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                    >
                                        <option value="">Todos los estados</option>
                                        {Object.entries(estados || {}).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                                    <input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                                    <input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => handleSearch(false)} // ← AGREGAR (false)
                                    disabled={isSearching} // ← AGREGAR disabled
                                    className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? 'Buscando...' : 'Aplicar Filtros'} {/* ← CAMBIAR texto dinámico */}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Indicadores de búsqueda activa */}
                    {searchTerm && (
                        <div className="mt-4 flex items-center text-sm text-gray-600">
                            <Search className="h-4 w-4 mr-1" />
                            <span className={showMobileView ? "text-xs" : ""}>
                                Buscando: "{searchTerm}" {!showMobileView && "en clave, folio, médico, paciente e institución"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Resultados - Vista Condicional */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Contador de resultados */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {estudios?.meta?.total || 0} estudios encontrados
                                {searchTerm && ` para "${searchTerm}"`}
                            </div>
                            <div className="text-xs text-gray-500">
                                Página {estudios?.meta?.current_page || 1} de {estudios?.meta?.last_page || 1}
                            </div>
                        </div>
                    </div>

                    {/* VISTA MÓVIL - TARJETAS */}
                    {showMobileView ? (
                        <div className="p-4">
                            {estudios?.data?.map((estudio) => (
                                <MobileEstudioCard key={estudio.ID} estudio={estudio} />
                            ))}
                            
                            {(!estudios?.data || estudios.data.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No se encontraron estudios</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* VISTA DESKTOP - TABLA ORIGINAL */
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Clave / Folio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paciente / Institución
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estudio Solicitado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Solicitud
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Envíos
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estudios?.data?.map((estudio) => (
                                        <tr key={estudio.ID} className="hover:bg-gray-50">
                                            {/* Aquí va toda tu tabla original sin cambios */}
                                            {/* [Mantener exactamente el mismo código de la tabla original] */}
                                            
                                            {/* Clave / Folio */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 font-mono">
                                                    {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                                                </div>
                                                {estudio.FOLIO_MERCK && (
                                                    <div className="text-sm text-gray-500">Merck: {estudio.FOLIO_MERCK}</div>
                                                )}
                                            </td>

                                            {/* Paciente / Institución */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {estudio.paciente?.USUARIO_NOMBRE || 'N/A'} {estudio.paciente?.USUARIO_APELLIDOS || ''} <b>{estudio.MUESTRA_INICIALES || 'N/A'}</b>
                                                    </div>
                                                    
                                                    {estudio.medico && (
                                                        <div className="text-xs text-gray-600">
                                                            {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                                                        </div>
                                                    )}
                                                    
                                                    {estudio.institucion && (
                                                        <div className="text-xs text-gray-500">
                                                            {estudio.institucion.INSTITUCION_NOMBRE}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Tipo */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                                    {estudio.MUESTRA_TIPO_ESTUDIO || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Estudio Solicitado */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {estudio.R_ESTUDIO_SOLICITADO ? 
                                                        (estudio.R_ESTUDIO_SOLICITADO.length > 40 ? 
                                                            estudio.R_ESTUDIO_SOLICITADO.substring(0, 40) + '...' : 
                                                            estudio.R_ESTUDIO_SOLICITADO
                                                        ) : 'No especificado'
                                                    }
                                                </div>
                                            </td>

                                            {/* Fecha Solicitud */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                                                <div 
                                                    className="cursor-pointer hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedDateDropdown(
                                                            expandedDateDropdown === estudio.ID ? null : estudio.ID
                                                        );
                                                    }}
                                                    title="Ver historial de fechas"
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {estudio.FECHA_SOLICITUD_RECOLECCION && estudio.FECHA_SOLICITUD_RECOLECCION !== '0000-00-00 00:00:00' 
                                                                ? (() => {
                                                                    const { fecha, hora } = formatearFechaHora(estudio.FECHA_SOLICITUD_RECOLECCION);
                                                                    return `${fecha} ${hora}`;
                                                                })()
                                                                : 'N/A'
                                                            }
                                                        </span>
                                                        <ChevronDown className={`h-3 w-3 transition-transform ${
                                                            expandedDateDropdown === estudio.ID ? 'rotate-180' : ''
                                                        }`} />
                                                    </div>
                                                </div>

                                                {/* Dropdown de fechas */}
                                                {expandedDateDropdown === estudio.ID && (
                                                    <>
                                                        {/* Overlay para cerrar */}
                                                        <div 
                                                            className="fixed inset-0 z-10" 
                                                            onClick={() => setExpandedDateDropdown(null)}
                                                        />
                                                        <FechasDropdown estudio={estudio} />
                                                    </>
                                                )}
                                            </td>

                                            {/* Estado */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoClasses(estudio.ESTUDIO_ESTADO)}`}>
                                                    {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                                                </span>
                                            </td>

                                            {/* Estado de Envíos */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderEstadoEnvios(estudio.estadisticas_envios)}
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/estudios/${estudio.ID}`}
                                                        className="text-[#189BAF] hover:text-[#157a8c] transition-colors"
                                                        title="Ver estudio"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>
                                                    
                                                    <button 
                                                        onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}`, '_blank')}
                                                        className="text-green-600 hover:text-green-700 transition-colors"
                                                        title="Descargar PDF"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}&imprimir=si`, '_blank')}
                                                        className="text-gray-600 hover:text-gray-700 transition-colors"
                                                        title="PDF para impresión"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </button>

                                                    <button 
                                                        onClick={() => openWhatsAppDialog(estudio)}
                                                        className="text-green-600 hover:text-green-700 transition-colors"
                                                        title="Enviar por WhatsApp"
                                                    >
                                                        <MessageCircle className="h-5 w-5" />
                                                    </button>
                                                    
                                                    <Link
                                                        href={`/estudios/${estudio.ID}/envios-correos`}
                                                        className="text-blue-600 hover:text-blue-700 transition-colors"
                                                        title="Ver envíos de correos"
                                                    >
                                                        <Mail className="h-5 w-5" />
                                                    </Link>
                                                    
                                                    {/* BOTÓN DE SIGUIENTE PASO */}
                                                    {(() => {
                                                        const siguientePaso = getSiguientePaso(estudio.ESTUDIO_ESTADO);
                                                        return siguientePaso ? (
                                                            <Link
                                                                href={`/estudios/${estudio.ID}/edit/${siguientePaso.href}`}
                                                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                                                title={`Ir a ${siguientePaso.texto}`}
                                                            >
                                                                {siguientePaso.icono}
                                                                <span>{siguientePaso.texto}</span>
                                                            </Link>
                                                        ) : null;
                                                    })()}
                                                    
                                                    {/* BOTONES DE EDICIÓN Y BORRAR (solo si no es "Resultados Enviados") */}
                                                    {mostrarBotonesEdicion(estudio.ESTUDIO_ESTADO) && (
                                                        <>
                                                            <div className="relative group">
                                                                <button className="text-[#D68B41] hover:text-[#b8763a] transition-colors">
                                                                    <Edit className="h-5 w-5" />
                                                                </button>
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                                    <Link
                                                                        href={`/estudios/${estudio.ID}/edit/recoleccion`}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <Calendar className="h-4 w-4 mr-2" />
                                                                        1. Recolección
                                                                    </Link>
                                                                    <Link
                                                                        href={`/estudios/${estudio.ID}/edit/recepcion`}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        2. Recepción
                                                                    </Link>
                                                                    <Link
                                                                        href={`/estudios/${estudio.ID}/edit/laboratorio`}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <TestTube className="h-4 w-4 mr-2" />
                                                                        3. Laboratorio
                                                                    </Link>
                                                                    <Link
                                                                        href={`/estudios/${estudio.ID}/edit/informe`}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <Microscope className="h-4 w-4 mr-2" />
                                                                        4. Informe
                                                                    </Link>
                                                                </div>
                                                            </div>

                                                            {/* BOTÓN DE ELIMINAR */}
                                                            <button
                                                                onClick={() => handleDeleteEstudio(estudio)}
                                                                disabled={deletingId === estudio.ID}
                                                                className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Eliminar estudio"
                                                            >
                                                                {deletingId === estudio.ID ? (
                                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                                                ) : (
                                                                    <Trash2 className="h-5 w-5" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Paginación - Responsive */}
                    {estudios?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className={`flex items-center ${showMobileView ? 'flex-col space-y-2' : 'justify-between'}`}>
                                <div className="text-sm text-gray-700">
                                    Mostrando {estudios?.meta?.from || 0} - {estudios?.meta?.to || 0} de {estudios?.meta?.total || 0} resultados
                                    {isSearching && (
                                        <span className="ml-2 text-xs text-gray-500">(Buscando...)</span>
                                    )}
                                </div>
                                <div className={`flex items-center space-x-2 ${showMobileView ? 'flex-wrap justify-center' : ''}`}>
                                    {estudios.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && handlePaginationClick(link.url)} // CAMBIADO
                                            disabled={!link.url || isSearching} // CAMBIADO: Deshabilitar durante búsqueda
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${showMobileView ? 'text-xs' : ''} ${
                                                link.active
                                                    ? 'bg-[#189BAF] text-white'
                                                    : link.url && !isSearching
                                                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* WhatsApp Dialog */}
            {whatsappDialog.isOpen && (
                <WhatsAppDialog
                    estudio={whatsappDialog.estudio}
                    isOpen={whatsappDialog.isOpen}
                    onClose={closeWhatsAppDialog}
                />
            )}
        </AppLayout>
    );
}