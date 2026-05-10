import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, FileText } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditRecoleccionProps {
    estudio: any;
    medicos: any[];
    pacientes: any[];
    instituciones: any[];
    clientes: any[];
    mensajerias: any[];
    [key: string]: any;
}

interface InstitucionDataState {
    loading: boolean;
    data: {
        estudio: {
            MUESTRA_DIRECCION?: string;
            MUESTRA_NUMERO_EXT?: string;
            MUESTRA_NUMERO_INT?: string;
            MUESTRA_MUNICIPIO?: string;
            MUESTRA_COLONIA?: string;
            MUESTRA_ESTADO?: string;
            MUESTRA_ENVIO_TIPO?: string;
            MUESTRA_CODIGO_POSTAL?: string;
            MUESTRA_HORARIOS?: string;
        };
        medico?: any;
        paciente?: any;
        institucion?: any;
        cliente?: any;
    } | null;
    error: string | null;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: {
        estudio: any;
        medico?: any;
        paciente?: any;
        institucion?: any;
        cliente?: any;
    };
}

export default function EditRecoleccionOptimized() {
    const { estudio, medicos = [], pacientes = [], instituciones = [], clientes = [], mensajerias = [] } = usePage<EditRecoleccionProps>().props;

    // Referencias para inputs simples - no causan re-renders
    const formRef = useRef<HTMLFormElement>(null);
    
    // Estados para los buscadores
    const [institucionData, setInstitucionData] = useState<InstitucionDataState>({
        loading: false,
        data: null,
        error: null
    });

    const [medicoSearch, setMedicoSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedMedico: { ID_USUARIO: number; USUARIO_NOMBRE: string; USUARIO_APELLIDOS: string; USUARIO_CORREO: string; } | null;
    }>({
        isOpen: false,
        searchText: '',
        selectedMedico: null
    });

    const [institucionSearch, setInstitucionSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedInstitucion: { ID_INSTITUCION: number; INSTITUCION_NOMBRE: string; } | null;
    }>({
        isOpen: false,
        searchText: '',
        selectedInstitucion: null
    });
    
    // Solo estado mínimo para campos dependientes
    const [dependentFields, setDependentFields] = useState({
        NoAplica: estudio.MUESTRA_ENVIO === 'no aplica',
        processing: false,
        IdMedico: estudio.ID_MEDICO || 0,
        IdInstitucion: estudio.ID_INSTITUCION || 0,
        // Nuevos campos para mostrar/ocultar secciones
        showMedicoForm: false,
        showInstitucionForm: false,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: `/estudios?prefijo=${estudio.CLAVE || 'PRM'}` },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recolección', href: `/estudios/${estudio.ID}/edit/recoleccion` },
    ];

    // Función para obtener datos del último estudio de la institución
    const fetchUltimoEstudioInstitucion = async (idInstitucion: number): Promise<void> => {
        if (!idInstitucion || idInstitucion === 0) {
            setInstitucionData({ loading: false, data: null, error: null });
            return;
        }

        setInstitucionData({ loading: true, data: null, error: null });

        try {
            const response = await fetch(`/api/estudios/ultimo-por-institucion?id_institucion=${idInstitucion}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data: ApiResponse = await response.json();

            if (data.success && data.data) {
                console.log('Datos del último estudio:', data.data);
                
                setInstitucionData({ 
                    loading: false, 
                    data: data.data, 
                    error: null 
                });

                cargarDatosEnFormulario(data.data.estudio);
            } else {
                console.log('No se encontraron estudios para esta institución');
                setInstitucionData({ 
                    loading: false, 
                    data: null, 
                    error: data.message || 'No se encontraron estudios' 
                });
            }
        } catch (error) {
            console.error('Error al obtener datos de la institución:', error);
            setInstitucionData({ 
                loading: false, 
                data: null, 
                error: 'Error de conexión' 
            });
        }
    };

    // Función para cargar los datos en el formulario
    const cargarDatosEnFormulario = (estudioData: any): void => {
        const form = formRef.current;
        if (!form || !estudioData) return;

        // Mapeo de campos del estudio a campos del formulario
        const camposACargar: Record<string, string | undefined> = {
            'MUESTRA_DIRECCION': estudioData.MUESTRA_DIRECCION,
            'MUESTRA_NUMERO_EXT': estudioData.MUESTRA_NUMERO_EXT,
            'MUESTRA_NUMERO_INT': estudioData.MUESTRA_NUMERO_INT,
            'MUESTRA_MUNICIPIO': estudioData.MUESTRA_MUNICIPIO,
            'MUESTRA_COLONIA': estudioData.MUESTRA_COLONIA,
            'MUESTRA_ESTADO': estudioData.MUESTRA_ESTADO,
            'MUESTRA_ENVIO_TIPO': estudioData.MUESTRA_ENVIO_TIPO,
            'MUESTRA_CODIGO_POSTAL': estudioData.MUESTRA_CODIGO_POSTAL,
            'MUESTRA_HORARIOS': estudioData.MUESTRA_HORARIOS
        };

        // Cargar cada campo en el formulario
        Object.entries(camposACargar).forEach(([nombreCampo, valor]) => {
            const campo = form.querySelector(`[name="${nombreCampo}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            if (campo && valor) {
                campo.value = valor;
            }
        });

        console.log('Datos cargados en el formulario desde el último estudio');
    };

    // Función para obtener todos los valores del formulario
    const getFormData = useCallback(() => {
        const form = formRef.current;
        if (!form) return {};

        const formData = new FormData(form);
        const data: any = {};

        // Convertir FormData a objeto
        for (const [key, value] of formData.entries()) {
            const stringValue = value as string;
            
            // Manejar checkboxes
            if (key === 'NO_APLICA') {
                const checkbox = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
                data[key] = checkbox?.checked || false;
            }
            // Manejar números
            else if (['ID_CLIENTE', 'ID_MEDICO', 'ID_INSTITUCION'].includes(key)) {
                data[key] = parseInt(stringValue) || null;
            }
            // Strings normales
            else {
                data[key] = stringValue;
            }
        }

        // Combinar fecha y hora si están presentes
        if (data.FECHA_SOLICITUD_RECOLECCION && data.HORA_SOLICITUD_RECOLECCION) {
            data.FECHA_SOLICITUD_RECOLECCION = data.FECHA_SOLICITUD_RECOLECCION + ' ' + data.HORA_SOLICITUD_RECOLECCION + ':00';
        }

        return data;
    }, []);

    // Manejar cambios en campos dependientes
    const handleDependentFieldChange = useCallback((key: string, value: boolean | number) => {
        setDependentFields(prev => {
            const newState = {
                ...prev,
                [key]: value
            };

            // Lógica para mostrar/ocultar formularios
            if (key === 'IdMedico') {
                newState.showMedicoForm = value === 0;
            }
            if (key === 'IdInstitucion') {
                newState.showInstitucionForm = value === 0;
            }

            return newState;
        });
    }, []);

    const handleSave = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        
        if (dependentFields.processing) return;
        
        setDependentFields(prev => ({ ...prev, processing: true }));
        const formData = {
            ...getFormData(),
            _action: 'save' 
        };
        
        router.patch(`/estudios/${estudio.ID}/recoleccion`, formData, {
            onSuccess: () => {
                console.log('Datos guardados exitosamente');
            },
            onError: (errors) => {
                console.error('Error al guardar:', errors);
            },
            onFinish: () => {
                setDependentFields(prev => ({ ...prev, processing: false }));
            }
        });
    }, [estudio.ID, getFormData, dependentFields.processing]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        
        if (dependentFields.processing) return;
        
        setDependentFields(prev => ({ ...prev, processing: true }));
        const formData = { 
            ...getFormData(), 
            _next: 'recepcion',
            _action: 'save_and_next' // ← AGREGAR PARA CONSISTENCIA
        };
        
        router.patch(`/estudios/${estudio.ID}/recoleccion`, formData, {
            onSuccess: () => {
                router.visit(`/estudios/${estudio.ID}/edit/recepcion`);
            },
            onError: (errors) => {
                console.error('Error al guardar:', errors);
            },
            onFinish: () => {
                setDependentFields(prev => ({ ...prev, processing: false }));
            }
        });
    }, [estudio.ID, getFormData, dependentFields.processing]);

    const handleSaveAndExit = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        
        if (dependentFields.processing) return;
        
        setDependentFields(prev => ({ ...prev, processing: true }));
        const formData = {
            ...getFormData(),
            _action: 'save_and_exit' // ← AGREGAR ESTO
        };
        
        router.patch(`/estudios/${estudio.ID}/recoleccion`, formData, {
            onSuccess: () => {
                // El backend se encargará de redirigir con el prefijo correcto
                console.log('Datos guardados y regresando a lista');
            },
            onError: (errors) => {
                console.error('Error al guardar:', errors);
            },
            onFinish: () => {
                setDependentFields(prev => ({ ...prev, processing: false }));
            }
        });
    }, [estudio.ID, getFormData, dependentFields.processing]);

    // Preparar fecha y hora iniciales
    const fechaInicial = estudio.FECHA_SOLICITUD_RECOLECCION ? 
        estudio.FECHA_SOLICITUD_RECOLECCION.split('T')[0] : '';
    const horaInicial = estudio.FECHA_SOLICITUD_RECOLECCION ? 
        estudio.FECHA_SOLICITUD_RECOLECCION.split('T')[1].substring(0, 5) : '';

    // Inicializar buscadores con valores actuales
    useEffect(() => {
        // Inicializar médico
        if (estudio.ID_MEDICO) {
            const medico = medicos.find(m => m.ID_USUARIO === estudio.ID_MEDICO);
            if (medico) {
                setMedicoSearch({
                    isOpen: false,
                    searchText: `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`,
                    selectedMedico: medico
                });
            }
        }

        // Inicializar institución
        if (estudio.ID_INSTITUCION) {
            const institucion = instituciones.find(i => i.ID_INSTITUCION === estudio.ID_INSTITUCION);
            if (institucion) {
                setInstitucionSearch({
                    isOpen: false,
                    searchText: institucion.INSTITUCION_NOMBRE,
                    selectedInstitucion: institucion
                });
            }
        }
    }, [estudio, medicos, instituciones]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Recolección`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header con información del estudio y pasos */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-[#189BAF]" />
                                <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                            </div>
                        </div>
                        <Link href={`/estudios/${estudio.ID}`}>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Estudio
                            </Button>
                        </Link>
                    </div>
                    
                    {/* Pasos del proceso */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Badge className="bg-[#189BAF] text-white">1. Recolección</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">2. Recepción</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">3. Laboratorio</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">4. Informe</Badge>
                        </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Campos Hidden con datos automáticos */}
                <input type="hidden" name="UsuarioTipo" value="medico" />
                <input type="hidden" name="PassUsuario" value="135DIAHMOES" />

                {/* Formulario Principal - HTML Puro para performance */}
                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Columna Izquierda */}
                        <div className="space-y-6">
                            
                            {/* Información Básica */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Clave Interna
                                        </label>
                                        <input
                                            type="text"
                                            name="CLAVE_INTERNA"
                                            defaultValue={estudio.CLAVE_INTERNA || ''}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-gray-100 text-black text-base cursor-not-allowed"
                                        />
                                        <p className="text-sm text-red-500 mt-1 italic">
                                            Para mantener la continuidad la clave interna no puede ser modificada
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Folio Merck
                                        </label>
                                        <input
                                            type="text"
                                            name="FOLIO_MERCK"
                                            defaultValue={estudio.FOLIO_MERCK || ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha
                                            </label>
                                            <input
                                                type="date"
                                                name="FECHA_SOLICITUD_RECOLECCION"
                                                defaultValue={fechaInicial}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hora
                                            </label>
                                            <input
                                                type="time"
                                                name="HORA_SOLICITUD_RECOLECCION"
                                                defaultValue={horaInicial}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cliente */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Cliente</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cambiar Cliente
                                    </label>
                                    <select
                                        name="ID_CLIENTE"
                                        defaultValue={estudio.ID_CLIENTE || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                    >
                                        <option value="">Seleccionar cliente</option>
                                        {clientes.map((cliente: any) => (
                                            <option key={cliente.ID_CLIENTE} value={cliente.ID_CLIENTE}>
                                                {cliente.CLIENTE_NOMBRE}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Médico con Buscador */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Médico</h3>
                                
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cambiar Médico
                                    </label>
                                    <input
                                        type="text"
                                        value={medicoSearch.searchText}
                                        onChange={(e) => {
                                            setMedicoSearch({
                                                ...medicoSearch,
                                                searchText: e.target.value,
                                                isOpen: true
                                            });
                                        }}
                                        onFocus={() => setMedicoSearch({...medicoSearch, isOpen: true})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        placeholder="Buscar médico..."
                                    />
                                    
                                    {/* Lista desplegable */}
                                    {medicoSearch.isOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {/* Opción "Nuevo Médico" */}
                                            <div
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
                                                onClick={() => {
                                                    setMedicoSearch({
                                                        isOpen: false,
                                                        searchText: 'Nuevo Médico',
                                                        selectedMedico: null
                                                    });
                                                    handleDependentFieldChange('IdMedico', 0);
                                                }}
                                            >
                                                <strong>Nuevo Médico</strong>
                                            </div>
                                            
                                            {/* Médicos filtrados */}
                                            {medicos
                                                .filter(medico => 
                                                    `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`
                                                        .toLowerCase()
                                                        .includes(medicoSearch.searchText.toLowerCase())
                                                )
                                                .map(medico => (
                                                    <div
                                                        key={medico.ID_USUARIO}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => {
                                                            setMedicoSearch({
                                                                isOpen: false,
                                                                searchText: `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`,
                                                                selectedMedico: medico
                                                            });
                                                            handleDependentFieldChange('IdMedico', medico.ID_USUARIO);
                                                        }}
                                                    >
                                                        {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                                    </div>
                                                ))
                                            }
                                            
                                            {/* Mensaje si no hay resultados */}
                                            {medicos.filter(medico => 
                                                `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`
                                                    .toLowerCase()
                                                    .includes(medicoSearch.searchText.toLowerCase())
                                            ).length === 0 && medicoSearch.searchText && (
                                                <div className="px-3 py-2 text-gray-500 italic">
                                                    No se encontraron médicos
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Input hidden para el formulario */}
                                    <input
                                        type="hidden"
                                        name="ID_MEDICO"
                                        value={dependentFields.IdMedico}
                                    />
                                </div>

                                {/* Formulario de nuevo médico */}
                                {dependentFields.showMedicoForm && (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-md border mt-4">
                                        <h4 className="font-medium text-gray-800">Datos del Nuevo Médico</h4>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Nombre *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="USUARIO_NOMBRE"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Nombre"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Apellidos *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="USUARIO_APELLIDOS"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Apellidos"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Correo (Opcional)
                                            </label>
                                            <input
                                                type="email"
                                                name="USUARIO_CORREO"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="medico@ejemplo.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Teléfono (Opcional)
                                            </label>
                                            <input
                                                type="tel"
                                                name="USUARIO_TELEFONO"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="55-1234-5678"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Institución con Buscador */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Institución</h3>
                                
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cambiar Institución
                                    </label>
                                    <input
                                        type="text"
                                        value={institucionSearch.searchText}
                                        onChange={(e) => {
                                            setInstitucionSearch({
                                                ...institucionSearch,
                                                searchText: e.target.value,
                                                isOpen: true
                                            });
                                        }}
                                        onFocus={() => setInstitucionSearch({...institucionSearch, isOpen: true})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        placeholder="Buscar institución..."
                                    />
                                    
                                    {/* Lista desplegable */}
                                    {institucionSearch.isOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {/* Opción "Nueva Institución" */}
                                            <div
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
                                                onClick={() => {
                                                    setInstitucionSearch({
                                                        isOpen: false,
                                                        searchText: 'Nueva Institución',
                                                        selectedInstitucion: null
                                                    });
                                                    handleDependentFieldChange('IdInstitucion', 0);
                                                }}
                                            >
                                                <strong>Nueva Institución</strong>
                                            </div>
                                            
                                            {/* Instituciones filtradas */}
                                            {instituciones
                                                .filter(inst => 
                                                    inst.INSTITUCION_NOMBRE
                                                        .toLowerCase()
                                                        .includes(institucionSearch.searchText.toLowerCase())
                                                )
                                                .map(inst => (
                                                    <div
                                                        key={inst.ID_INSTITUCION}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={async () => {
                                                            setInstitucionSearch({
                                                                isOpen: false,
                                                                searchText: inst.INSTITUCION_NOMBRE,
                                                                selectedInstitucion: inst
                                                            });
                                                            handleDependentFieldChange('IdInstitucion', inst.ID_INSTITUCION);
                                                            
                                                            // Hacer fetch de los datos del último estudio
                                                            await fetchUltimoEstudioInstitucion(inst.ID_INSTITUCION);
                                                        }}
                                                    >
                                                        {inst.INSTITUCION_NOMBRE}
                                                    </div>
                                                ))
                                            }
                                            
                                            {/* Mensaje si no hay resultados */}
                                            {instituciones.filter(inst => 
                                                inst.INSTITUCION_NOMBRE
                                                    .toLowerCase()
                                                    .includes(institucionSearch.searchText.toLowerCase())
                                            ).length === 0 && institucionSearch.searchText && (
                                                <div className="px-3 py-2 text-gray-500 italic">
                                                    No se encontraron instituciones
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Input hidden para el formulario */}
                                    <input
                                        type="hidden"
                                        name="ID_INSTITUCION"
                                        value={dependentFields.IdInstitucion}
                                    />
                                </div>

                                {/* Formulario de nueva institución */}
                                {dependentFields.showInstitucionForm && (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-md border mt-4">
                                        <h4 className="font-medium text-gray-800">Datos de la Nueva Institución</h4>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Nombre de la Institución *
                                            </label>
                                            <input
                                                type="text"
                                                name="INSTITUCION_NOMBRE"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Nombre de la institución"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Correo de la Institución (Opcional)
                                            </label>
                                            <input
                                                type="email"
                                                name="INSTITUCION_CORREO"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="institucion@ejemplo.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Teléfono de la Institución (Opcional)
                                            </label>
                                            <input
                                                type="tel"
                                                name="INSTITUCION_TELEFONO"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="55-1234-5678"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Procedencia
                                            </label>
                                            <select
                                                name="INSTITUCION_PROCEDENCIA"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            >
                                                <option value="">No especificado</option>
                                                <option value="Privado">Privado</option>
                                                <option value="IMSS">IMSS</option>
                                                <option value="ISSSTE">ISSSTE</option>
                                                <option value="SSA">SSA</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha - Dirección de Recolección */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Dirección de Recolección</h3>
                                    
                                    {/* Indicador de carga */}
                                    {institucionData.loading && (
                                        <div className="flex items-center text-sm text-blue-600">
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                                            Cargando datos...
                                        </div>
                                    )}
                                    
                                    {/* Mensaje de éxito */}
                                    {institucionData.data && !institucionData.loading && (
                                        <div className="text-sm text-green-600">
                                            ✓ Datos cargados del último estudio
                                        </div>
                                    )}
                                    
                                    {/* Mensaje de error o no encontrado */}
                                    {institucionData.error && !institucionData.loading && (
                                        <div className="text-sm text-gray-500">
                                            {institucionData.error}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Checkbox No Aplica */}
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="NO_APLICA"
                                            defaultChecked={dependentFields.NoAplica}
                                            onChange={(e) => handleDependentFieldChange('NoAplica', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">No Aplica Envío</span>
                                    </label>
                                </div>

                                {/* Formulario de dirección */}
                                {!dependentFields.NoAplica && (
                                    <div className="space-y-4">
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Mensajería
                                            </label>
                                            <select
                                                name="MUESTRA_GUIA_MENSAJERIA"
                                                defaultValue={estudio.MUESTRA_GUIA_MENSAJERIA || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            >
                                                <option value="">Seleccionar mensajería</option>
                                                {mensajerias.map((mensajeria: any) => (
                                                    <option key={mensajeria.ID} value={mensajeria.NOMBRE}>
                                                        {mensajeria.NOMBRE}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Número de Guía
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_GUIA"
                                                defaultValue={estudio.MUESTRA_GUIA || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Número de guía"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Referencias
                                            </label>
                                            <textarea
                                                name="MUESTRA_REFERENCIAS"
                                                defaultValue={estudio.MUESTRA_REFERENCIAS || ''}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Referencias para encontrar la dirección"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección
                                            </label>
                                            <textarea
                                                name="MUESTRA_DIRECCION"
                                                defaultValue={estudio.MUESTRA_DIRECCION || ''}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Calle y número"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Número Exterior
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MUESTRA_NUMERO_EXT"
                                                    defaultValue={estudio.MUESTRA_NUMERO_EXT || ''}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Número Interior
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MUESTRA_NUMERO_INT"
                                                    defaultValue={estudio.MUESTRA_NUMERO_INT || ''}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Colonia
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_COLONIA"
                                                defaultValue={estudio.MUESTRA_COLONIA || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Municipio
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_MUNICIPIO"
                                                defaultValue={estudio.MUESTRA_MUNICIPIO || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ciudad
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_CIUDAD"
                                                defaultValue={estudio.MUESTRA_CIUDAD || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Estado
                                            </label>
                                            <select
                                                name="MUESTRA_ESTADO"
                                                defaultValue={estudio.MUESTRA_ESTADO || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            >
                                                <option value="">Seleccione estado</option>
                                                <option value="Aguascalientes">Aguascalientes</option>
                                                <option value="Baja California">Baja California</option>
                                                <option value="Baja California Sur">Baja California Sur</option>
                                                <option value="Campeche">Campeche</option>
                                                <option value="Chiapas">Chiapas</option>
                                                <option value="Chihuahua">Chihuahua</option>
                                                <option value="Coahuila">Coahuila</option>
                                                <option value="Colima">Colima</option>
                                                <option value="Ciudad de México">Ciudad de México</option>
                                                <option value="Durango">Durango</option>
                                                <option value="Estado de México">Estado de México</option>
                                                <option value="Guanajuato">Guanajuato</option>
                                                <option value="Guerrero">Guerrero</option>
                                                <option value="Hidalgo">Hidalgo</option>
                                                <option value="Jalisco">Jalisco</option>
                                                <option value="Michoacán">Michoacán</option>
                                                <option value="Morelos">Morelos</option>
                                                <option value="Nayarit">Nayarit</option>
                                                <option value="Nuevo León">Nuevo León</option>
                                                <option value="Oaxaca">Oaxaca</option>
                                                <option value="Puebla">Puebla</option>
                                                <option value="Querétaro">Querétaro</option>
                                                <option value="Quintana Roo">Quintana Roo</option>
                                                <option value="San Luis Potosí">San Luis Potosí</option>
                                                <option value="Sinaloa">Sinaloa</option>
                                                <option value="Sonora">Sonora</option>
                                                <option value="Tabasco">Tabasco</option>
                                                <option value="Tamaulipas">Tamaulipas</option>
                                                <option value="Tlaxcala">Tlaxcala</option>
                                                <option value="Veracruz">Veracruz</option>
                                                <option value="Yucatán">Yucatán</option>
                                                <option value="Zacatecas">Zacatecas</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Envío
                                            </label>
                                            <select
                                                name="MUESTRA_ENVIO_TIPO"
                                                defaultValue={estudio.MUESTRA_ENVIO_TIPO || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            >
                                                <option value="">Seleccionar tipo</option>
                                                <option value="Local">Local</option>
                                                <option value="Nacional">Nacional</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Código Postal
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_CODIGO_POSTAL"
                                                defaultValue={estudio.MUESTRA_CODIGO_POSTAL || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                pattern="[0-9]{5}"
                                                placeholder="12345"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Horarios de Atención
                                            </label>
                                            <textarea
                                                name="MUESTRA_HORARIOS"
                                                defaultValue={estudio.MUESTRA_HORARIOS || ''}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Ejemplo: Lunes a Viernes de 9:00 a 18:00"
                                            />
                                        </div>
                                        <hr/>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                ¿Requiere laboratorio auxiliar?
                                            </label>
                                            <select
                                                name="MUESTRA_REQUIERE_LABORATORIO_AUX"
                                                defaultValue={estudio.MUESTRA_REQUIERE_LABORATORIO_AUX || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            >
                                                <option value="">Sin especificar</option>
                                                <option value="si">Sí</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre del laboratorio auxiliar
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_NOMBRE_LABORATORIO_AUX"
                                                defaultValue={estudio.MUESTRA_NOMBRE_LABORATORIO_AUX || ''}
                                                placeholder="Nombre del laboratorio auxiliar (si aplica)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
                        <div className="flex justify-between">
                            <Button 
                                type="button"
                                variant="outline" 
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={handleSaveAndExit}
                                disabled={dependentFields.processing}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Guardar y Salir
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleSave}
                                    disabled={dependentFields.processing}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Solo Guardar
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    onClick={handleNext}
                                    disabled={dependentFields.processing}
                                >
                                    Guardar y Siguiente
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Eventos para cerrar búsquedas */}
                <div 
                    className={medicoSearch.isOpen ? "fixed inset-0 z-0" : "hidden"}
                    onClick={() => setMedicoSearch({...medicoSearch, isOpen: false})}
                ></div>
                <div 
                    className={institucionSearch.isOpen ? "fixed inset-0 z-0" : "hidden"}
                    onClick={() => setInstitucionSearch({...institucionSearch, isOpen: false})}
                ></div>
            </div>
        </AppLayout>
    );
}