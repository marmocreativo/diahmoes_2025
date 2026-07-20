import { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Search, X, Filter, Eye, Edit, Download, ArrowRight, Calendar, FileText, TestTube, Microscope, Plus, MessageCircle, Printer, Trash2, Mail, CheckCircle, Clock, ChevronDown, ChevronUp, Monitor, Smartphone, Settings, Wrench, AlertTriangle, Link2 } from 'lucide-react';
import { EstudioIndexProps } from '@/types/estudios';
import WhatsAppDialog from '@/components/WhatsAppDialog';

export default function EstudiosIndex() {
    // Tipar correctamente las props
    const { estudios, filters, estados, prefijo, instituciones, estadisticas } = usePage<EstudioIndexProps>().props;
    
    // Estados para el buscador
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [fechaDesde, setFechaDesde] = useState(filters?.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filters?.fecha_hasta || '');

    // Estado para manejar el dropdown de fechas
    const [expandedDateDropdown, setExpandedDateDropdown] = useState<number | null>(null)

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [pacienteIniciales, setPacienteIniciales] = useState(filters?.paciente_iniciales || '');
    const [pacienteNombre, setPacienteNombre] = useState(filters?.paciente_nombre || '');
    const [pacienteApellidos, setPacienteApellidos] = useState(filters?.paciente_apellidos || '');
    const [medicoNombre, setMedicoNombre] = useState(filters?.medico_nombre || '');
    const [medicoApellidos, setMedicoApellidos] = useState(filters?.medico_apellidos || '');
    const [institucionId, setInstitucionId] = useState(filters?.institucion_id || '');
    const [claveInterna, setClaveInterna] = useState(filters?.clave_interna || '');
    const [folioMerck, setFolioMerck] = useState(filters?.folio_merck || '');
    const [muestraClave, setMuestraClave] = useState(filters?.muestra_clave || '');
    const [muestraFolioSobre, setMuestraFolioSobre] = useState(filters?.muestra_folio_sobre || '');
    const [muestraFolioKitBl, setMuestraFolioKitBl] = useState(filters?.muestra_folio_kit_bl || '');
    const [muestraTipoEstudio, setMuestraTipoEstudio] = useState(filters?.muestra_tipo_estudio || '');

    // Estados para cambio de destinatario
    const [correoDestinatario, setCorreoDestinatario] = useState('');
    const [nuevoNombreDestinatario, setNuevoNombreDestinatario] = useState('');
    const [isChangingDestinatario, setIsChangingDestinatario] = useState(false);

    // Estado para manejar el dropdown
    const [showMaintenanceDropdown, setShowMaintenanceDropdown] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);

    // Estado para detectar móvil y alternar vistas
    const [isMobile, setIsMobile] = useState(false);
    const [forceDesktopView, setForceDesktopView] = useState(false);
    const showMobileView = isMobile && !forceDesktopView;
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    // Estados para finalización por año
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1); // Año anterior por defecto

    // Estados de Vinculaciónd e Folios
    const [isVinculandoFolios, setIsVinculandoFolios] = useState(false);

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
    // Estado que indica busqueda
    const [isSearching, setIsSearching] = useState(false);

    // Función para verificar si una fecha es de días hábiles atrás
    const esDiaHabilAtras = (fecha: string, diasHabiles: number) => {
        if (!fecha || fecha === '0000-00-00 00:00:00') return false;
        
        const fechaEstudio = new Date(fecha.split('T')[0] + 'T00:00:00');
        const ahora = new Date();
        
        let diasContados = 0;
        let fechaTemp = new Date(fechaEstudio);
        
        while (fechaTemp < ahora && diasContados < diasHabiles) {
            fechaTemp.setDate(fechaTemp.getDate() + 1);
            const diaSemana = fechaTemp.getDay();
            if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a Viernes
                diasContados++;
            }
        }
        
        return diasContados >= diasHabiles;
    };

    const handleCambiarDestinatario = async () => {
        if (!correoDestinatario || !nuevoNombreDestinatario) {
            alert('Por favor completa ambos campos.');
            return;
        }

        if (!window.confirm(`¿Cambiar el nombre de "${correoDestinatario}" a "${nuevoNombreDestinatario}" en todos los registros?`)) {
            return;
        }

        setIsChangingDestinatario(true);
        setShowMaintenanceDropdown(false);

        try {
            const response = await fetch('/estudios/cambiar-destinatario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    correo: correoDestinatario,
                    nuevo_nombre: nuevoNombreDestinatario,
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`Listo: ${data.correos_copia_actualizados} correos de copia y ${data.envios_actualizados} envíos actualizados.`);
                setCorreoDestinatario('');
                setNuevoNombreDestinatario('');
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            alert('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        } finally {
            setIsChangingDestinatario(false);
        }
    };

    // Función para verificar si han pasado más de 24 horas
    const hanPasado24Horas = (fecha: string) => {
        if (!fecha || fecha === '0000-00-00 00:00:00') return false;
        
        const fechaEstudio = new Date(fecha);
        const ahora = new Date();
        const diferenciaHoras = (ahora.getTime() - fechaEstudio.getTime()) / (1000 * 60 * 60);
        
        return diferenciaHoras > 24;
    };

    // Función para verificar si han pasado más de 1 día hábil
    const hanPasadoUnDiaHabil = (fecha: string) => {
        return esDiaHabilAtras(fecha, 1);
    };

    // Función para obtener alertas de un estudio
    const obtenerAlertas = (estudio: any) => {
        const alertas = [];
        
        // Alerta 1: Solicitud Recolección + 24 horas en FECHA_RECEPCION
        if (estudio.ESTUDIO_ESTADO === 'Solicitud Recolección' && 
            hanPasado24Horas(estudio.FECHA_RECEPCION)) {
            alertas.push({
                tipo: 'recepcion',
                mensaje: '>24h en recepción',
                color: 'bg-orange-100 text-orange-800 border-orange-300'
            });
        }
        
        // Alerta 2: Recepción Laboratorio + Biopsia Líquida + 3 días hábiles
        if (estudio.ESTUDIO_ESTADO === 'Recepción Laboratorio' && 
            estudio.MUESTRA_TIPO_ESTUDIO === 'Biopsia Líquida' && 
            esDiaHabilAtras(estudio.FECHA_RECEPCION_LABORATORIO, 3)) {
            alertas.push({
                tipo: 'laboratorio_liquida',
                mensaje: '>3d lab líquida',
                color: 'bg-blue-100 text-blue-800 border-blue-300'
            });
        }
        
        // Alerta 3: Recepción Laboratorio + Biopsia Sólida + 5 días hábiles
        if (estudio.ESTUDIO_ESTADO === 'Recepción Laboratorio' && 
            estudio.MUESTRA_TIPO_ESTUDIO === 'Biopsia Sólida' && 
            esDiaHabilAtras(estudio.FECHA_RECEPCION_LABORATORIO, 5)) {
            alertas.push({
                tipo: 'laboratorio_solida',
                mensaje: '>5d lab sólida',
                color: 'bg-purple-100 text-purple-800 border-purple-300'
            });
        }
        
        // Alerta 4: Resultados Completos + 1 día hábil
        if (estudio.ESTUDIO_ESTADO === 'Resultados Completos' && 
            hanPasadoUnDiaHabil(estudio.FECHA_OBTENCION_RESULTADOS)) {
            alertas.push({
                tipo: 'envio_pendiente',
                mensaje: '>1d sin enviar',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
            });
        }
        
        return alertas;
    };

    // Función para generar años disponibles (últimos 10 años)
    const getAvailableYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear - 1; year >= currentYear - 10; year--) {
            years.push(year);
        }
        return years;
    };

    // Función para finalizar estudios antiguos
    const handleFinalizarEstudiosAntiguos = async () => {
        if (!window.confirm(`¿Estás seguro de que deseas finalizar todos los estudios del año ${selectedYear} y anteriores?\n\nEsto cambiará el estado a "Resultados Enviados" y rellenará fechas faltantes.`)) {
            return;
        }

        setIsFinalizing(true);
        setShowMaintenanceDropdown(false);

        try {
            const response = await fetch('/estudios/finalizar-antiguos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    anio: selectedYear
                })
            });

            const data = await response.json();

            if (data.success) {
                const { reporte } = data;
                const mensaje = `Finalización completada exitosamente:
                
    - Año procesado: ${reporte.anio_procesado}
    - Estudios encontrados: ${reporte.estudios_encontrados}
    - Estudios actualizados: ${reporte.estudios_actualizados}
    - Fechas rellenadas: ${reporte.fechas_rellenadas}
    - Errores: ${reporte.errores.length}`;

                alert(mensaje);
                
                // Recargar la página para mostrar los cambios
                window.location.reload();
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error finalizando estudios:', error);
            
            let errorMessage = 'Error desconocido';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            alert('Error al finalizar estudios: ' + errorMessage);
        } finally {
            setIsFinalizing(false);
        }
    };

    // Función para vincular folios kits sin estudio
    const handleVincularFoliosKits = async () => {
        if (!window.confirm('¿Ejecutar la vinculación automática de folios kits con estudios?\n\nEsto buscará folios sin estudio asignado y los relacionará según coincidencia en MUESTRA_FOLIO_KIT_BL.')) {
            return;
        }

        setIsVinculandoFolios(true);
        setShowMaintenanceDropdown(false);

        try {
            const response = await fetch('/folios-kits/vincular-estudios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                const { reporte } = data;
                let mensaje = `Vinculación completada exitosamente:
                
    • Folios sin estudio encontrados: ${reporte.folios_sin_estudio_encontrados}
    • Folios vinculados: ${reporte.folios_vinculados}
    • Sin coincidencia: ${reporte.folios_sin_coincidencia}
    • Duplicados detectados: ${reporte.total_duplicados}`;

                if (reporte.total_duplicados > 0) {
                    mensaje += `\n\n⚠️ Revisa la consola para ver el detalle de los folios duplicados.`;
                    console.warn('Folios duplicados encontrados:', reporte.duplicados);
                }

                alert(mensaje);
                window.location.reload();
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error vinculando folios kits:', error);
            
            let errorMessage = 'Error desconocido';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            alert('Error al vincular folios kits: ' + errorMessage);
        } finally {
            setIsVinculandoFolios(false);
        }
    };

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

    // Componente para el dropdown de fechas (ACTUALIZADO)
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

        // Detectar si debe aparecer por arriba o por abajo
        const [showAbove, setShowAbove] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - rect.top;
                const dropdownHeight = 320; // Altura aproximada del dropdown
                
                // Si no hay suficiente espacio abajo, mostrar arriba
                setShowAbove(spaceBelow < dropdownHeight);
            }
        }, []);

        return (
            <div 
                ref={dropdownRef}
                className={`absolute right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 ${
                    showAbove ? 'bottom-full mb-2' : 'top-full mt-2'
                }`}
            >
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


     const handleSearch = (isAdvanced = false) => {
        setIsSearching(true);
        
        const searchParams: any = {
            prefijo: prefijo || 'PRM',
        };
        
        // Búsqueda rápida
        if (!isAdvanced && searchTerm) {
            searchParams.search = searchTerm;
        }
        
        // Búsqueda avanzada
        if (isAdvanced) {
            if (pacienteIniciales) searchParams.paciente_iniciales = pacienteIniciales;
            if (pacienteNombre) searchParams.paciente_nombre = pacienteNombre;
            if (pacienteApellidos) searchParams.paciente_apellidos = pacienteApellidos;
            if (medicoNombre) searchParams.medico_nombre = medicoNombre;
            if (medicoApellidos) searchParams.medico_apellidos = medicoApellidos;
            if (institucionId) searchParams.institucion_id = institucionId;
            if (claveInterna) searchParams.clave_interna = claveInterna;
            if (folioMerck) searchParams.folio_merck = folioMerck;
            if (muestraClave) searchParams.muestra_clave = muestraClave;
            if (muestraFolioSobre) searchParams.muestra_folio_sobre = muestraFolioSobre;
            if (muestraFolioKitBl) searchParams.muestra_folio_kit_bl = muestraFolioKitBl;
            if (muestraTipoEstudio) searchParams.muestra_tipo_estudio = muestraTipoEstudio;
        }
        
        // Filtros adicionales
        if (selectedEstado) searchParams.estado = selectedEstado;
        if (fechaDesde) searchParams.fecha_desde = fechaDesde;
        if (fechaHasta) searchParams.fecha_hasta = fechaHasta;

        router.get('/estudios', searchParams, {
            preserveState: true,
            preserveScroll: true,
            replace: false,
            onFinish: () => {
                setIsSearching(false);
                if (isAdvanced) {
                    setShowAdvancedSearch(false);
                }
            }
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedEstado('');
        setFechaDesde('');
        setFechaHasta('');
        // Limpiar campos de búsqueda avanzada
        setPacienteIniciales('');
        setPacienteNombre('');
        setPacienteApellidos('');
        setMedicoNombre('');
        setMedicoApellidos('');
        setInstitucionId('');
        setClaveInterna('');
        setFolioMerck('');
        setMuestraClave('');
        setMuestraFolioSobre('');
        setMuestraFolioKitBl('');
        setMuestraTipoEstudio('');
        
        router.get('/estudios', { 
            prefijo: prefijo || 'PRM'
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: false
        });
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
    const renderEstadoEnvios = (estadisticas: any, estudio: any) => {
    if (!estadisticas || estadisticas.total === 0) {
        return (
            <div className="text-center text-gray-400">
                <a href={`/estudios/${estudio.ID}/envios-correos`}>
                    <Mail className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-xs">Sin envíos</div>
                </a>
            </div>
        );
    }

    return (
        <div className="text-center">
            <a href={`/estudios/${estudio.ID}/edit/informe`}>
                <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-sm font-medium text-blue-600">
                        {estadisticas.total}
                    </span>
                    <Mail className="h-4 w-4 text-blue-500" />
                </div>
                
                <div className="text-xs text-gray-500">
                    {estadisticas.total === 1 ? 'correo enviado' : 'correos enviados'}
                </div>
            </a>
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
                                {renderEstadoEnvios(estudio.estadisticas_envios, estudio)}
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
                                            href={`/estudios/${estudio.ID}/edit/informe`}
                                            className="w-full mb-2 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span>Reenviar</span>
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

    const hasActiveFilters = searchTerm || selectedEstado || fechaDesde || fechaHasta || 
    pacienteIniciales || pacienteNombre || pacienteApellidos || medicoNombre || 
    medicoApellidos || institucionId || claveInterna || folioMerck || 
    muestraClave || muestraFolioSobre || muestraFolioKitBl || muestraTipoEstudio;

    return (
        <AppLayout>
            <Head title="Estudios - DIAHMOES" />
            
            <div className="flex flex-1 flex-col gap-6 p-6" style={{height: 'calc(100vh - 64px)', overflow: 'auto'}}>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Gestión de Estudios {prefijo && `[${prefijo}]`}
                            </h1>
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

                                                {/* Separador */}
                                                <div className="border-t border-gray-100 my-1"></div>
                                                
                                                {/* NUEVA OPCIÓN: Finalizar Estudios Antiguos */}
                                                <div className="px-4 py-3">
                                                    <div className="flex items-start space-x-3">
                                                        {isFinalizing ? (
                                                            <div className="h-4 w-4 mt-1 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 mt-1 text-blue-500" />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm text-gray-700 mb-2">
                                                                Finalizar Estudios Antiguos
                                                            </div>
                                                            <div className="text-xs text-gray-500 mb-3">
                                                                Cambiar estado a "Resultados Enviados" y rellenar fechas
                                                            </div>
                                                            
                                                            <div className="flex items-center space-x-2">
                                                                <label className="text-xs text-gray-600">Año:</label>
                                                                <select
                                                                    value={selectedYear}
                                                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                                                    disabled={isFinalizing}
                                                                    className="text-xs text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    {getAvailableYears().map(year => (
                                                                        <option className='text-gray-900' key={year} value={year}>{year}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    onClick={handleFinalizarEstudiosAntiguos}
                                                                    disabled={isFinalizing}
                                                                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isFinalizing ? 'Procesando...' : 'Finalizar'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Separador */}
                                                <div className="border-t border-gray-100 my-1"></div>

                                                {/* Cambiar nombre de destinatario */}
                                                <div className="px-4 py-3">
                                                    <div className="flex items-start space-x-3">
                                                        {isChangingDestinatario ? (
                                                            <div className="h-4 w-4 mt-1 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
                                                        ) : (
                                                            <Mail className="h-4 w-4 mt-1 text-teal-500" />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm text-gray-700 mb-1">
                                                                Cambiar Nombre de Destinatario
                                                            </div>
                                                            <div className="text-xs text-gray-500 mb-3">
                                                                Actualiza el nombre asociado a un correo en todos los registros
                                                            </div>
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="email"
                                                                    placeholder="Correo a buscar"
                                                                    value={correoDestinatario}
                                                                    onChange={(e) => setCorreoDestinatario(e.target.value)}
                                                                    disabled={isChangingDestinatario}
                                                                    className="w-full text-xs text-gray-900 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Nuevo nombre"
                                                                    value={nuevoNombreDestinatario}
                                                                    onChange={(e) => setNuevoNombreDestinatario(e.target.value)}
                                                                    disabled={isChangingDestinatario}
                                                                    className="w-full text-xs text-gray-900 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                                />
                                                                <button
                                                                    onClick={handleCambiarDestinatario}
                                                                    disabled={isChangingDestinatario || !correoDestinatario || !nuevoNombreDestinatario}
                                                                    className="w-full text-xs bg-teal-500 text-white px-3 py-1.5 rounded hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isChangingDestinatario ? 'Actualizando...' : 'Actualizar Nombre'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Separador */}
                                                <div className="border-t border-gray-100 my-1"></div>

                                                {/* Vincular Folios Kits */}
                                                <button
                                                    onClick={handleVincularFoliosKits}
                                                    disabled={isVinculandoFolios}
                                                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isVinculandoFolios ? (
                                                        <div className="h-4 w-4 mr-3 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                                                    ) : (
                                                        <Link2 className="h-4 w-4 mr-3 text-indigo-500" />
                                                    )}
                                                    <div className="text-left">
                                                        <div className="font-medium">Vincular Folios Kits</div>
                                                        <div className="text-xs text-gray-500">
                                                            Asociar folios sin estudio por coincidencia de folio
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Placeholder para futuras opciones */}
                                                <div className="border-t border-gray-100 mt-1"></div>
                                                <div className="px-4 py-3 text-xs text-gray-400 italic">
                                                    Más funciones próximamente...
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <Link 
                                href={`/estudios/create?prefijo=${prefijo || 'PRM'}`}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span className={showMobileView ? "hidden sm:inline" : ""}>Nuevo Estudio</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de Estadísticas Clickeables */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {/* Total de Estudios */}
                    <button
                        onClick={() => {
                            // Limpiar TODOS los filtros y solo mantener prefijo
                            router.get('/estudios', { prefijo });
                        }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl hover:border-blue-300 transition-all duration-200 text-left"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-2xl font-bold text-gray-900">
                                    {estadisticas?.total_estudios || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Estudios Totales
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Detenidos en Recepción */}
                    <button
                        onClick={() => {
                            // Limpiar TODOS los filtros y solo aplicar el específico
                            router.get('/estudios', { 
                                prefijo,
                                detenidos_recepcion: 'true'
                            });
                        }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl hover:border-orange-300 transition-all duration-200 text-left"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-2xl font-bold text-gray-900">
                                    {estadisticas?.detenidos_recepcion || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Detenidos Recepción
                                    <div className="text-xs text-orange-600">&gt;24 horas</div>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Detenidos Lab - Biopsia Líquida */}
                    <button
                        onClick={() => {
                            // Limpiar TODOS los filtros y solo aplicar el específico
                            router.get('/estudios', { 
                                prefijo,
                                detenidos_lab_liquida: 'true'
                            });
                        }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl hover:border-blue-300 transition-all duration-200 text-left"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <TestTube className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-2xl font-bold text-gray-900">
                                    {estadisticas?.detenidos_lab_liquida || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Lab Biopsia Líquida
                                    <div className="text-xs text-blue-600">&gt;3 días hábiles</div>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Detenidos Lab - Biopsia Sólida */}
                    <button
                        onClick={() => {
                            // Limpiar TODOS los filtros y solo aplicar el específico
                            router.get('/estudios', { 
                                prefijo,
                                detenidos_lab_solida: 'true'
                            });
                        }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl hover:border-purple-300 transition-all duration-200 text-left"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <Microscope className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-2xl font-bold text-gray-900">
                                    {estadisticas?.detenidos_lab_solida || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Lab Biopsia Sólida
                                    <div className="text-xs text-purple-600">&gt;5 días hábiles</div>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Falta Enviar Resultados */}
                    <button
                        onClick={() => {
                            // Limpiar TODOS los filtros y solo aplicar el específico
                            router.get('/estudios', { 
                                prefijo,
                                falta_enviar_resultados: 'true'
                            });
                        }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl hover:border-green-300 transition-all duration-200 text-left"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-2xl font-bold text-gray-900">
                                    {estadisticas?.falta_enviar_resultados || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Falta Enviar
                                    <div className="text-xs text-green-600">&gt;1 día hábil</div>
                                </div>
                            </div>
                        </div>
                    </button>
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
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(false);
                                    }
                                }}
                                placeholder={showMobileView ? "Búsqueda rápida..." : "Búsqueda rápida en clave, folio, médico, paciente e institución..."}
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                disabled={isSearching}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className={`flex items-center space-x-2 ${showMobileView ? 'w-full justify-between' : ''}`}>
                            {/* Botón de búsqueda rápida */}
                            <button
                                onClick={() => handleSearch(false)}
                                disabled={isSearching}
                                className="flex items-center space-x-2 px-4 py-3 bg-[#189BAF] text-white rounded-lg transition-colors hover:bg-[#157a8c] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Search className="h-5 w-5" />
                                <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
                            </button>
                            
                            {/* Botón de búsqueda avanzada */}
                            <button
                                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                                    showAdvancedSearch
                                        ? 'border-[#189BAF] bg-[#189BAF]/5 text-[#189BAF]'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="h-5 w-5" />
                                <span>Búsqueda Avanzada</span>
                            </button>

                            {/* Botón limpiar */}
                            <button
                                onClick={clearSearch}
                                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                                title="Limpiar búsqueda"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {showAdvancedSearch && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">

                            {/* Paciente */}
                            <input
                                type="text"
                                value={pacienteIniciales}
                                onChange={(e) => setPacienteIniciales(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Iniciales paciente"
                            />
                            <input
                                type="text"
                                value={pacienteNombre}
                                onChange={(e) => setPacienteNombre(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Nombre paciente"
                            />
                            <input
                                type="text"
                                value={pacienteApellidos}
                                onChange={(e) => setPacienteApellidos(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Apellidos paciente"
                            />
                            <input
                                type="text"
                                value={medicoNombre}
                                onChange={(e) => setMedicoNombre(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Nombre médico"
                            />
                            <input
                                type="text"
                                value={medicoApellidos}
                                onChange={(e) => setMedicoApellidos(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Apellidos médico"
                            />
                            <select
                                value={institucionId}
                                onChange={(e) => setInstitucionId(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Institución</option>
                                {instituciones?.map((i) => (
                                    <option key={i.ID_INSTITUCION} value={i.ID_INSTITUCION}>{i.INSTITUCION_NOMBRE}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={claveInterna}
                                onChange={(e) => setClaveInterna(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Clave interna"
                            />
                            <input
                                type="text"
                                value={folioMerck}
                                onChange={(e) => setFolioMerck(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Folio Merck"
                            />
                            <input
                                type="text"
                                value={muestraClave}
                                onChange={(e) => setMuestraClave(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Clave muestra"
                            />
                            <input
                                type="text"
                                value={muestraFolioSobre}
                                onChange={(e) => setMuestraFolioSobre(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Folio sobre"
                            />
                            <input
                                type="text"
                                value={muestraFolioKitBl}
                                onChange={(e) => setMuestraFolioKitBl(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                placeholder="Folio Kit BL"
                            />
                            <select
                                value={muestraTipoEstudio}
                                onChange={(e) => setMuestraTipoEstudio(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Tipo de estudio</option>
                                <option value="Biopsia Sólida">Biopsia Sólida</option>
                                <option value="Biopsia Líquida">Biopsia Líquida</option>
                            </select>

                            <select
                                value={selectedEstado}
                                onChange={(e) => setSelectedEstado(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Estado</option>
                                {Object.entries(estados || {}).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                title="Fecha desde"
                            />
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                title="Fecha hasta"
                            />

                            {/* Botón buscar ocupa el espacio restante */}
                            <button
                                onClick={() => handleSearch(true)}
                                disabled={isSearching}
                                className="col-span-2 bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSearching ? 'Buscando...' : 'Buscar con filtros'}
                            </button>
                        </div>
                    </div>
                )}
                </div>

                {/* Resultados - Vista Condicional */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">

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
                        <div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Clave / Paciente
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Médico / Institución
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo / Estudio
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha / Estado
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Envíos
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estudios?.data?.map((estudio) => (
                                        <tr key={estudio.ID} className="hover:bg-gray-50">
                                            {/* Clave / Paciente */}
                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    <div className="text-lg font-bold text-gray-900 font-mono">
                                                        {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {estudio.paciente?.USUARIO_NOMBRE || 'N/A'} {estudio.paciente?.USUARIO_APELLIDOS || ''} 
                                                        <span className="font-bold ml-1">{estudio.MUESTRA_INICIALES || 'N/A'}</span>
                                                    </div>
                                                    {estudio.FOLIO_MERCK && (
                                                        <div className="text-xs text-gray-500">Merck: {estudio.FOLIO_MERCK}</div>
                                                    )}
                                                    {estudio.MUESTRA_FOLIO_KIT_BL && (
                                                        <div className="text-sm text-gray-500">Folio de Kit: {estudio.MUESTRA_FOLIO_KIT_BL}</div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Médico / Institución */}
                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    {estudio.medico && (
                                                        <div className="text-sm text-gray-900">
                                                            {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                                                        </div>
                                                    )}
                                                    {estudio.institucion && (
                                                        <div className="text-xs text-gray-500">
                                                            {estudio.institucion.INSTITUCION_NOMBRE.length > 25 ? 
                                                                estudio.institucion.INSTITUCION_NOMBRE.substring(0, 25) + '...' : 
                                                                estudio.institucion.INSTITUCION_NOMBRE
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Tipo / Estudio */}
                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                                        {estudio.MUESTRA_TIPO_ESTUDIO || 'N/A'}
                                                    </span>
                                                    <div className="text-xs text-gray-900">
                                                        {estudio.R_ESTUDIO_SOLICITADO ? 
                                                            (estudio.R_ESTUDIO_SOLICITADO.length > 25 ? 
                                                                estudio.R_ESTUDIO_SOLICITADO.substring(0, 25) + '...' : 
                                                                estudio.R_ESTUDIO_SOLICITADO
                                                            ) : 'No especificado'
                                                        }
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Fecha / Estado */}
                                            <td className="px-3 py-3">
                                                <div className="space-y-2">
                                                    {/* NUEVO: Etiquetas de Alerta */}
                                                    {(() => {
                                                        const alertas = obtenerAlertas(estudio);
                                                        return alertas.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {alertas.map((alerta, index) => (
                                                                    <div key={index} className="flex items-center space-x-1">
                                                                        <span className={`flex px-2 py-1 rounded text-xs font-medium border ${alerta.color} animate-[pulse_2s_ease-in-out_infinite]`}>
                                                                            <AlertTriangle className="h-3 w-3 me-2 text-red-500 animate-pulse" />
                                                                            {alerta.mensaje}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                    {/* Fecha con dropdown */}
                                                    <div className="relative">
                                                        <div 
                                                            className="cursor-pointer hover:text-gray-700 hover:bg-gray-50 px-1 py-1 rounded transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedDateDropdown(
                                                                    expandedDateDropdown === estudio.ID ? null : estudio.ID
                                                                );
                                                            }}
                                                            title="Ver historial de fechas"
                                                        >
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span className="text-xs text-gray-500">
                                                                    {estudio.FECHA_SOLICITUD_RECOLECCION && estudio.FECHA_SOLICITUD_RECOLECCION !== '0000-00-00 00:00:00' 
                                                                        ? (() => {
                                                                            const { fecha } = formatearFechaHora(estudio.FECHA_SOLICITUD_RECOLECCION);
                                                                            return fecha;
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
                                                                <div 
                                                                    className="fixed inset-0 z-10" 
                                                                    onClick={() => setExpandedDateDropdown(null)}
                                                                />
                                                                <FechasDropdown estudio={estudio} />
                                                            </>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Estado */}
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getEstadoClasses(estudio.ESTUDIO_ESTADO)}`}>
                                                        {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                                                    </span>
                                                    
                                                    
                                                </div>
                                            </td>

                                            {/* Estado de Envíos */}
                                            <td className="px-3 py-3 text-center">
                                                {renderEstadoEnvios(estudio.estadisticas_envios, estudio)}
                                            </td>

                                            {/* Acciones - EN DOS FILAS */}
                                            <td className="px-3 py-3">
                                                <div className="space-y-2">
                                                    {/* PRIMERA FILA DE ACCIONES */}
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <Link
                                                            href={`/estudios/${estudio.ID}`}
                                                            className="text-[#189BAF] hover:text-[#157a8c] transition-colors p-1"
                                                            title="Ver estudio"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        
                                                        <button 
                                                            onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}`, '_blank')}
                                                            className="text-green-600 hover:text-green-700 transition-colors p-1"
                                                            title="Descargar PDF"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}&imprimir=si`, '_blank')}
                                                            className="text-gray-600 hover:text-gray-700 transition-colors p-1"
                                                            title="PDF para impresión"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </button>

                                                        <button 
                                                            onClick={() => openWhatsAppDialog(estudio)}
                                                            className="text-green-600 hover:text-green-700 transition-colors p-1"
                                                            title="Enviar por WhatsApp"
                                                        >
                                                            <MessageCircle className="h-4 w-4" />
                                                        </button>
                                                        
                                                        <Link
                                                            href={`/estudios/${estudio.ID}/edit/informe`}
                                                            className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                                                            title="Reenviar reporte"
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                    
                                                    {/* SEGUNDA FILA DE ACCIONES */}
                                                    <div className="flex items-center justify-center space-x-1">
                                                        {/* BOTÓN DE SIGUIENTE PASO */}
                                                        {(() => {
                                                            const siguientePaso = getSiguientePaso(estudio.ESTUDIO_ESTADO);
                                                            return siguientePaso ? (
                                                                <Link
                                                                    href={`/estudios/${estudio.ID}/edit/${siguientePaso.href}`}
                                                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                                                    title={`Ir a ${siguientePaso.texto}`}
                                                                >
                                                                    {siguientePaso.icono}
                                                                    <span>{siguientePaso.texto}</span>
                                                                </Link>
                                                            ) : (
                                                                <div className="px-2 py-1 text-xs text-gray-400">
                                                                    Completado
                                                                </div>
                                                            );
                                                        })()}
                                                        
                                                        {/* BOTONES DE EDICIÓN Y BORRAR (solo si no es "Resultados Enviados") */}
                                                        {mostrarBotonesEdicion(estudio.ESTUDIO_ESTADO) && (
                                                            <div className="flex items-center space-x-1">
                                                                <div className="relative group">
                                                                    <button className="text-[#D68B41] hover:text-[#b8763a] transition-colors p-1">
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                                        <Link
                                                                            href={`/estudios/${estudio.ID}/edit/recoleccion`}
                                                                            className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                                                        >
                                                                            <Calendar className="h-3 w-3 mr-2" />
                                                                            1. Recolección
                                                                        </Link>
                                                                        <Link
                                                                            href={`/estudios/${estudio.ID}/edit/recepcion`}
                                                                            className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                                                        >
                                                                            <FileText className="h-3 w-3 mr-2" />
                                                                            2. Recepción
                                                                        </Link>
                                                                        <Link
                                                                            href={`/estudios/${estudio.ID}/edit/laboratorio`}
                                                                            className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                                                        >
                                                                            <TestTube className="h-3 w-3 mr-2" />
                                                                            3. Laboratorio
                                                                        </Link>
                                                                        <Link
                                                                            href={`/estudios/${estudio.ID}/edit/informe`}
                                                                            className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                                                        >
                                                                            <Microscope className="h-3 w-3 mr-2" />
                                                                            4. Informe
                                                                        </Link>
                                                                    </div>
                                                                </div>

                                                                {/* BOTÓN DE ELIMINAR */}
                                                                <button
                                                                    onClick={() => handleDeleteEstudio(estudio)}
                                                                    disabled={deletingId === estudio.ID}
                                                                    className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
                                                                    title="Eliminar estudio"
                                                                >
                                                                    {deletingId === estudio.ID ? (
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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