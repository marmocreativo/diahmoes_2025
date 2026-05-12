import { useState, useRef, useCallback } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { type BreadcrumbItem, type EstudioCreateProps, type EstudioFormData } from '@/types';



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


export default function CrearEstudio() {
    const { medicos, pacientes, instituciones, clientes, mensajerias, tiposMuestra, tiposEstudio, generos, tiposEnvio, datosAutomaticos } = 
        usePage<EstudioCreateProps>().props;

    //Obtener prefijo de los datos automáticos
    const prefijo = datosAutomaticos.Prefijo || 'PRM';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: `/estudios?prefijo=${prefijo}` }, // ← CAMBIO AQUÍ
        { title: `Crear Estudio ${prefijo}`, href: `/estudios/create?prefijo=${prefijo}` }, // ← CAMBIO AQUÍ
    ];

    // Referencias para inputs simples - no causan re-renders
    const formRef = useRef<HTMLFormElement>(null);

    const [institucionData, setInstitucionData] = useState<InstitucionDataState>({
        loading: false,
        data: null,
        error: null
    });
    const [medicoSearch, setMedicoSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedMedico: { 
            ID_USUARIO: number; 
            USUARIO_NOMBRE: string; 
            USUARIO_APELLIDOS: string; 
            USUARIO_CORREO: string;
            USUARIO_TELEFONO?: string;  // ← AGREGAR
            PREFIJO?: string;           // ← AGREGAR
        } | null;
    }>({
        isOpen: false,
        searchText: '',
        selectedMedico: null
    });

    // Agrega este estado junto con medicoSearch (después del estado medicoSearch)
    const [institucionSearch, setInstitucionSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedInstitucion: { 
            ID_INSTITUCION: number; 
            INSTITUCION_NOMBRE: string;
            INSTITUCION_CORREO?: string;
            INSTITUCION_TELEFONO?: string;
            INSTITUCION_ESTADO?: string;
            INSTITUCION_CIUDAD?: string;
            INSTITUCION_PROCEDENCIA?: string;
        } | null;
    }>({
        isOpen: false,
        searchText: '',
        selectedInstitucion: null
    });
        
    // Solo estado mínimo para campos dependientes que requieren procesamiento inmediato
    const [dependentFields, setDependentFields] = useState({
        IdCliente: 0,
        IdMedico: 0,
        IdInstitucion: 0,
        NoAplica: false,
        MuestraEnvioTipo: 'ninguno',
        MuestraEstado: 'ninguno',
        showClienteForm: false,
        showMedicoForm: false,
        showInstitucionForm: false,
        showMedicoEditForm: false,
        showInstitucionEditForm: false, 
    });

    const [medicoEditData, setMedicoEditData] = useState({
        PREFIJO: '',
        USUARIO_NOMBRE: '',
        USUARIO_APELLIDOS: '',
        USUARIO_CORREO: '',
        USUARIO_TELEFONO: '',
    });

    const [institucionEditData, setInstitucionEditData] = useState({
        INSTITUCION_NOMBRE: '',
        INSTITUCION_CORREO: '',
        INSTITUCION_TELEFONO: '',
        INSTITUCION_ESTADO: '',
        INSTITUCION_CIUDAD: '',
        INSTITUCION_PROCEDENCIA: '',
    });

    const { post, processing, errors } = useForm();

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

        console.log('🔍 estudioData recibido:', estudioData);  // ← AGREGAR
        console.log('🏙️ MUESTRA_CIUDAD valor:', estudioData.MUESTRA_CIUDAD);  // ← AGREGAR

        const camposACargar: Record<string, string | undefined> = {
            'MuestraDireccion': estudioData.MUESTRA_DIRECCION,
            'MuestraNumeroExt': estudioData.MUESTRA_NUMERO_EXT,
            'MuestraNumeroInt': estudioData.MUESTRA_NUMERO_INT,
            'MuestraMunicipio': estudioData.MUESTRA_MUNICIPIO,
            'MuestraColonia': estudioData.MUESTRA_COLONIA,
            'MuestraEstado': estudioData.MUESTRA_ESTADO,
            'MuestraEnvioTipo': estudioData.MUESTRA_ENVIO_TIPO,
            'MuestraCodigoPostal': estudioData.MUESTRA_CODIGO_POSTAL,
            'MuestraHorarios': estudioData.MUESTRA_HORARIOS,
            'MuestraCiudad': estudioData.MUESTRA_CIUDAD,
        };

        console.log('📋 camposACargar:', camposACargar);  // ← AGREGAR

        Object.entries(camposACargar).forEach(([nombreCampo, valor]) => {
            const campo = form.querySelector(`[name="${nombreCampo}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            console.log(`🔎 Campo "${nombreCampo}":`, { elemento: campo, valor });  // ← AGREGAR
            if (campo && valor) {
                campo.value = valor;
            }
        });

        console.log('✅ Datos cargados en el formulario');
    };

    // Función para obtener todos los valores del formulario al momento de enviar
    const getFormData = useCallback((): EstudioFormData => {
        const form = formRef.current;
        if (!form) return {} as EstudioFormData;

        const formData = new FormData(form);
        const data: Partial<EstudioFormData> = {};

        // Convertir FormData a objeto con tipos correctos
        for (const [key, value] of formData.entries()) {
            const stringValue = value as string;
            
            // Manejar checkboxes
            if (key === 'NoAplica' || key === 'EnviarCorreoCliente') {
                const checkbox = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
                data[key as keyof EstudioFormData] = checkbox?.checked || false;
            } 
            // Manejar números
            else if (['IdCliente', 'IdMedico', 'IdInstitucion'].includes(key)) {
                data[key as keyof EstudioFormData] = parseInt(stringValue) || 0;
            } 
            // Strings normales
            else {
                data[key as keyof EstudioFormData] = stringValue;
            }
        }

        // Agregar datos automáticos del backend
        return {
            ...datosAutomaticos,
            ...data,
        } as EstudioFormData;
    }, [datosAutomaticos]);

    // Manejar cambios en campos dependientes (pocos re-renders)
    const handleDependentFieldChange = useCallback((key: string, value: string | number | boolean) => {
        setDependentFields(prev => {
            const newState = {
                ...prev,
                [key]: value
            };

            // Lógica para mostrar/ocultar formularios
            if (key === 'IdCliente') {
                newState.showClienteForm = value === 0;
            }
            if (key === 'IdMedico') {
                newState.showMedicoForm = value === 0;
            }
            if (key === 'IdInstitucion') {
                newState.showInstitucionForm = value === 0;
            }

            return newState;
        });
    }, []);

    const handleSubmit = (e: React.FormEvent, guardar: string) => {
        e.preventDefault();
        
        const submitData = {
            ...getFormData(),
            Guardar: guardar
        };

        console.log('Datos enviados:', submitData); // Para debugging
        
        router.post('/estudios', submitData, {
            onSuccess: () => {
                console.log('Éxito');
            },
            onError: (errors) => {
                console.error('Errores de validación:', errors);
            },
            onFinish: () => {
                console.log('Petición terminada');
            }
        });
    };

    const handleCancel = () => {
        router.visit(`/estudios?prefijo=${prefijo}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Nuevo Estudio ${prefijo} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Nuevo Estudio {prefijo} {/* ← AGREGAR PREFIJO */}
                        </h1>
                        <p className="text-gray-600">Complete la información del estudio</p>
                    </div>
                    <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                </div>

                {/* Mostrar errores */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Corrija los siguientes errores:</h4>
                            <ul className="list-disc list-inside text-red-700">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{String(message)}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Formulario Principal - HTML Puro para performance */}
                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    
                    {/* Campos Hidden con datos automáticos */}
                    <input type="hidden" name="IdAleatorio" value={datosAutomaticos.IdAleatorio} />
                    <input type="hidden" name="Seriado" value={datosAutomaticos.Seriado} />
                    <input type="hidden" name="Anio" value={datosAutomaticos.Anio} />
                    <input type="hidden" name="SiguienteNumero" value={datosAutomaticos.SiguienteNumero} />
                    <input type="hidden" name="Prefijo" value={datosAutomaticos.Prefijo} />
                    <input type="hidden" name="ClaveInterna" value={datosAutomaticos.ClaveInterna} />
                    <input type="hidden" name="UsuarioTipo" value="medico" />
                    <input type="hidden" name="PassUsuario" value="135DIAHMOES" />
                    <input type="hidden" name="NoAplica" value={dependentFields.NoAplica ? '1' : '0'} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Columna Izquierda */}
                        <div className="space-y-6">
                            
                            {/* Sección 1: Información Básica */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Clave Interna
                                            </label>
                                            <input
                                                type="text"
                                                value={datosAutomaticos.ClaveInterna}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                                disabled
                                                readOnly
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Esta clave se genera automáticamente</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Folio Merck *
                                            </label>
                                            <input
                                                type="text"
                                                name="FolioMerck"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Ingrese folio Merck"
                                                required
                                            />
                                            {errors.FolioMerck && (
                                                <p className="text-red-500 text-sm mt-1">{errors.FolioMerck}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Fecha Solicitud *
                                                </label>
                                                <input
                                                    type="date"
                                                    name="FechaSolicitudRecoleccion"
                                                    defaultValue={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Hora Solicitud *
                                                </label>
                                                <input
                                                    type="time"
                                                    name="HoraSolicitudRecoleccion"
                                                    defaultValue={new Date().toTimeString().slice(0, 5)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sección 2: Cliente */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
                                    <div className="space-y-4">

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Cliente *
                                            </label>
                                            <select
                                                name="IdCliente"
                                                value={dependentFields.IdCliente}
                                                onChange={(e) => handleDependentFieldChange('IdCliente', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                required
                                            >
                                                <option value=''>Selecciona</option>
                                                <option value={0}>Nuevo Cliente</option>
                                                <option value="">Es el mismo Médico</option>
                                                <option value="">Es el mismo Paciente</option>
                                                {clientes.map(cliente => (
                                                    <option key={cliente.ID_CLIENTE} value={cliente.ID_CLIENTE}>
                                                        {cliente.CLIENTE_NOMBRE}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.IdCliente && (
                                                <p className="text-red-500 text-sm mt-1">{errors.IdCliente}</p>
                                            )}
                                        </div>

                                        {/* Formulario de nuevo cliente */}
                                        {dependentFields.showClienteForm && (
                                            <div className="space-y-4 p-4 bg-gray-50 rounded-md border">
                                                <h4 className="font-medium text-gray-800">Datos del Nuevo Cliente</h4>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Nombre del Cliente *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="NombreCliente"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        placeholder="Nombre del cliente"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Correo del Cliente *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="CorreoCliente"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        placeholder="cliente@ejemplo.com"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            name="EnviarCorreoCliente"
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm font-medium">Enviar correos electrónicos al cliente</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sección 3: Médico */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Médico</h3>
                                    <div className="space-y-4">

                                        <div className="relative">
                                            <label className="block text-sm font-medium mb-1">
                                                Médico *
                                            </label>
                                            <div className="flex gap-2">
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
                                                    required
                                                />
                                                {medicoSearch.searchText && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setMedicoSearch({ isOpen: false, searchText: '', selectedMedico: null });
                                                            handleDependentFieldChange('IdMedico', 0);
                                                        }}
                                                        className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-300 rounded-md hover:border-red-300 transition-colors"
                                                        title="Limpiar"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            
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
                                                name="IdMedico"
                                                value={dependentFields.IdMedico}
                                            />
                                        </div>
                                        {/* Botón editar médico */}
                                        {medicoSearch.selectedMedico && (
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const m = medicoSearch.selectedMedico!;
                                                        setMedicoEditData({
                                                            PREFIJO: m.PREFIJO || '',
                                                            USUARIO_NOMBRE: m.USUARIO_NOMBRE || '',
                                                            USUARIO_APELLIDOS: m.USUARIO_APELLIDOS || '',
                                                            USUARIO_CORREO: m.USUARIO_CORREO || '',
                                                            USUARIO_TELEFONO: m.USUARIO_TELEFONO || '',
                                                        });
                                                        handleDependentFieldChange('showMedicoEditForm', !dependentFields.showMedicoEditForm);
                                                    }}
                                                    className="text-sm px-3 py-1 border border-[#189BAF] text-[#189BAF] rounded-md hover:bg-[#189BAF]/10 transition-colors"
                                                >
                                                    {dependentFields.showMedicoEditForm ? 'Cancelar edición' : 'Editar médico'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Formulario de edición de médico */}
                                        {dependentFields.showMedicoEditForm && medicoSearch.selectedMedico && (
                                            <div className="space-y-4 p-4 bg-blue-50 rounded-md border border-blue-200 mt-4">
                                                <h4 className="font-medium text-gray-800">Editar datos del médico</h4>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Prefijo</label>
                                                    <select
                                                        value={medicoEditData.PREFIJO}
                                                        onChange={(e) => setMedicoEditData({...medicoEditData, PREFIJO: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    >
                                                        <option value="">Sin prefijo</option>
                                                        <option value="Dr.">Dr.</option>
                                                        <option value="Dra.">Dra.</option>
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Nombre *</label>
                                                        <input
                                                            type="text"
                                                            value={medicoEditData.USUARIO_NOMBRE}
                                                            onChange={(e) => setMedicoEditData({...medicoEditData, USUARIO_NOMBRE: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Apellidos *</label>
                                                        <input
                                                            type="text"
                                                            value={medicoEditData.USUARIO_APELLIDOS}
                                                            onChange={(e) => setMedicoEditData({...medicoEditData, USUARIO_APELLIDOS: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Correo</label>
                                                    <input
                                                        type="email"
                                                        value={medicoEditData.USUARIO_CORREO}
                                                        onChange={(e) => setMedicoEditData({...medicoEditData, USUARIO_CORREO: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                                                    <input
                                                        type="tel"
                                                        value={medicoEditData.USUARIO_TELEFONO}
                                                        onChange={(e) => setMedicoEditData({...medicoEditData, USUARIO_TELEFONO: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!medicoSearch.selectedMedico) return;
                                                        try {
                                                            const response = await fetch(`/usuarios/${medicoSearch.selectedMedico!.ID_USUARIO}/rapido`, {
                                                                method: 'PATCH',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-Requested-With': 'XMLHttpRequest',
                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                    'Accept': 'application/json',
                                                                },
                                                                body: JSON.stringify(medicoEditData)
                                                            });
                                                            if (response.ok) {
                                                                setMedicoSearch(prev => ({
                                                                    ...prev,
                                                                    searchText: `${medicoEditData.USUARIO_NOMBRE} ${medicoEditData.USUARIO_APELLIDOS}`,
                                                                    selectedMedico: {
                                                                        ...prev.selectedMedico!,
                                                                        ...medicoEditData
                                                                    }
                                                                }));
                                                                handleDependentFieldChange('showMedicoEditForm', false);
                                                                alert('Médico actualizado correctamente');
                                                            } else {
                                                                alert('Error al actualizar el médico');
                                                            }
                                                        } catch (e) {
                                                            alert('Error de conexión');
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 bg-[#189BAF] text-white rounded-md hover:bg-[#157a8c] transition-colors"
                                                >
                                                    Guardar cambios del médico
                                                </button>
                                            </div>
                                        )}

                                        {/* Formulario de nuevo médico */}
                                        {dependentFields.showMedicoForm && (
                                            <div className="space-y-4 p-4 bg-gray-50 rounded-md border">
                                                <h4 className="font-medium text-gray-800">Datos del Nuevo Médico</h4>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">
                                                            Prefijo
                                                        </label>
                                                        <select
                                                            name="PrefijoUsuario"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        >
                                                            <option value="">Sin prefijo</option>
                                                            <option value="Dr.">Dr.</option>
                                                            <option value="Dra.">Dra.</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">
                                                            Nombre *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="NombreUsuario"
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
                                                            name="ApellidosUsuario"
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
                                                        name="CorreoUsuario"
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
                                                        name="TelefonoUsuario"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        placeholder="55-1234-5678"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sección 4: Institución */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Información de la Institución</h3>
                                    <div className="space-y-4">

                                        <div className="relative">
                                            <label className="block text-sm font-medium mb-1">
                                                Institución *
                                            </label>
                                            <div className="flex gap-2">
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
                                                    required
                                                />
                                                {institucionSearch.searchText && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setInstitucionSearch({ isOpen: false, searchText: '', selectedInstitucion: null });
                                                            handleDependentFieldChange('IdInstitucion', 0);
                                                        }}
                                                        className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-300 rounded-md hover:border-red-300 transition-colors"
                                                        title="Limpiar"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            
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
                                                name="IdInstitucion"
                                                value={dependentFields.IdInstitucion}
                                            />
                                        </div>

                                        {/* Botón editar institución */}
                                        {institucionSearch.selectedInstitucion && (
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const i = institucionSearch.selectedInstitucion!;
                                                        setInstitucionEditData({
                                                            INSTITUCION_NOMBRE: i.INSTITUCION_NOMBRE || '',
                                                            INSTITUCION_CORREO: i.INSTITUCION_CORREO || '',
                                                            INSTITUCION_TELEFONO: i.INSTITUCION_TELEFONO || '',
                                                            INSTITUCION_ESTADO: i.INSTITUCION_ESTADO || '',
                                                            INSTITUCION_CIUDAD: i.INSTITUCION_CIUDAD || '',
                                                            INSTITUCION_PROCEDENCIA: i.INSTITUCION_PROCEDENCIA || '',
                                                        });
                                                        handleDependentFieldChange('showInstitucionEditForm', !dependentFields.showInstitucionEditForm);
                                                    }}
                                                    className="text-sm px-3 py-1 border border-[#189BAF] text-[#189BAF] rounded-md hover:bg-[#189BAF]/10 transition-colors"
                                                >
                                                    {dependentFields.showInstitucionEditForm ? 'Cancelar edición' : 'Editar institución'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Formulario de edición de institución */}
                                        {dependentFields.showInstitucionEditForm && institucionSearch.selectedInstitucion && (
                                            <div className="space-y-4 p-4 bg-blue-50 rounded-md border border-blue-200 mt-4">
                                                <h4 className="font-medium text-gray-800">Editar datos de la institución</h4>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                                                    <input
                                                        type="text"
                                                        value={institucionEditData.INSTITUCION_NOMBRE}
                                                        onChange={(e) => setInstitucionEditData({...institucionEditData, INSTITUCION_NOMBRE: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Correo</label>
                                                    <input
                                                        type="email"
                                                        value={institucionEditData.INSTITUCION_CORREO}
                                                        onChange={(e) => setInstitucionEditData({...institucionEditData, INSTITUCION_CORREO: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                                                    <input
                                                        type="tel"
                                                        value={institucionEditData.INSTITUCION_TELEFONO}
                                                        onChange={(e) => setInstitucionEditData({...institucionEditData, INSTITUCION_TELEFONO: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Procedencia</label>
                                                    <select
                                                        value={institucionEditData.INSTITUCION_PROCEDENCIA}
                                                        onChange={(e) => setInstitucionEditData({...institucionEditData, INSTITUCION_PROCEDENCIA: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    >
                                                        <option value="">No especificado</option>
                                                        <option value="Privado">Privado</option>
                                                        <option value="IMSS">IMSS</option>
                                                        <option value="ISSSTE">ISSSTE</option>
                                                        <option value="SSA">SSA</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Estado</label>
                                                    <select
                                                        value={institucionEditData.INSTITUCION_ESTADO}
                                                        onChange={(e) => setInstitucionEditData({...institucionEditData, INSTITUCION_ESTADO: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
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
                                                    <label className="block text-sm font-medium mb-1">Ciudad</label>
                                                    <input
                                                        type="text"
                                                        value={institucionEditData.INSTITUCION_CIUDAD}
                                                        onChange={(e) => setInstitucionEditData({...institucionEditData, INSTITUCION_CIUDAD: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!institucionSearch.selectedInstitucion) return;
                                                        try {
                                                            const response = await fetch(`/instituciones/${institucionSearch.selectedInstitucion!.ID_INSTITUCION}/rapido`, {
                                                                method: 'PATCH',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-Requested-With': 'XMLHttpRequest',
                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                    'Accept': 'application/json',
                                                                },
                                                                body: JSON.stringify(institucionEditData)
                                                            });
                                                            if (response.ok) {
                                                                setInstitucionSearch(prev => ({
                                                                    ...prev,
                                                                    searchText: institucionEditData.INSTITUCION_NOMBRE,
                                                                    selectedInstitucion: {
                                                                        ...prev.selectedInstitucion!,
                                                                        ...institucionEditData
                                                                    }
                                                                }));
                                                                handleDependentFieldChange('showInstitucionEditForm', false);
                                                                alert('Institución actualizada correctamente');
                                                            } else {
                                                                alert('Error al actualizar la institución');
                                                            }
                                                        } catch (e) {
                                                            alert('Error de conexión');
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 bg-[#189BAF] text-white rounded-md hover:bg-[#157a8c] transition-colors"
                                                >
                                                    Guardar cambios de la institución
                                                </button>
                                            </div>
                                        )}

                                        {/* Formulario de nueva institución */}
                                        {dependentFields.showInstitucionForm && (
                                            <div className="space-y-4 p-4 bg-gray-50 rounded-md border">
                                                <h4 className="font-medium text-gray-800">Datos de la Nueva Institución</h4>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Nombre de la Institución *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="NombreInstitucion"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        placeholder="Nombre de la institución"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Estado
                                                    </label>
                                                    <select
                                                        name="EstadoInstitucion"
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
                                                    <label className="block text-sm font-medium mb-1">
                                                        Ciudad
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="CiudadInstitucion"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        placeholder="Ciudad"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Correo de la Institución (Opcional)
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="CorreoInstitucion"
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
                                                        name="TelefonoInstitucion"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        placeholder="55-1234-5678"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Columna Derecha */}
                        <div className="space-y-6">
                            
                            {/* Sección 5: Dirección de Recolección */}
                            <Card>
                                <CardContent className="p-6">
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
                                    
                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="NoAplica"
                                                checked={dependentFields.NoAplica}
                                                onChange={(e) => handleDependentFieldChange('NoAplica', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm font-medium">No Aplica Envío</span>
                                        </label>
                                    </div>

                                    {/* Solo mostrar campos de envío si NoAplica es false */}
                                    {!dependentFields.NoAplica && (
                                        <div className="space-y-4">
                                            
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Tipo de Envío
                                                </label>
                                                <select
                                                    name="MuestraEnvioTipo"
                                                    value={dependentFields.MuestraEnvioTipo}
                                                    onChange={(e) => handleDependentFieldChange('MuestraEnvioTipo', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                >
                                                    <option value="ninguno">Seleccione tipo</option>
                                                    {Object.entries(tiposEnvio).map(([key, value]) => (
                                                        <option key={key} value={key}>
                                                            {value}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Mensajería
                                                </label>
                                                <select
                                                    name="MuestraGuiaMensajeria"
                                                    defaultValue="ninguna"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                >
                                                    <option value="ninguna">Seleccione mensajería</option>
                                                    {mensajerias.map(mensajeria => (
                                                        <option key={mensajeria.ID} value={mensajeria.NOMBRE}>
                                                            {mensajeria.NOMBRE}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Guía
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraGuia"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Número de guía"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Dirigirse a
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraDirigirse"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Persona de contacto"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Preguntar por
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraPreguntar"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Persona específica"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Dirección
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraDireccion"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Calle y número"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Número Exterior
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="MuestraNumeroExt"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Número Interior
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="MuestraNumeroInt"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Colonia
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraColonia"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Municipio
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraMunicipio"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Ciudad
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraCiudad"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Estado
                                                </label>
                                                <select
                                                    name="MuestraEstado"
                                                    value={dependentFields.MuestraEstado}
                                                    onChange={(e) => handleDependentFieldChange('MuestraEstado', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                >
                                                    <option value="ninguno">Seleccione estado</option>
                                                    <option value="Aguascalientes">Aguascalientes</option>
                                                    <option value="Baja California">Baja California </option>
                                                    <option value="Baja California Sur">Baja California Sur </option>
                                                    <option value="Campeche">Campeche </option>
                                                    <option value="Chiapas">Chiapas </option>
                                                    <option value="Chihuahua">Chihuahua </option>
                                                    <option value="Coahuila">Coahuila </option>
                                                    <option value="Colima">Colima </option>
                                                    <option value="Ciudad de México">Ciudad de México</option>
                                                    <option value="Durango">Durango </option>
                                                    <option value="Estado de México">Estado de México </option>
                                                    <option value="Guanajuato">Guanajuato </option>
                                                    <option value="Guerrero">Guerrero </option>
                                                    <option value="Hidalgo">Hidalgo </option>
                                                    <option value="Jalisco">Jalisco </option>
                                                    <option value="Michoacán">Michoacán </option>
                                                    <option value="Morelos">Morelos </option>
                                                    <option value="Nayarit">Nayarit </option>
                                                    <option value="Nuevo León">Nuevo León </option>
                                                    <option value="Oaxaca">Oaxaca </option>
                                                    <option value="Puebla">Puebla </option>
                                                    <option value="Querétaro">Querétaro </option>
                                                    <option value="Quintana Roo">Quintana Roo </option>
                                                    <option value="San Luis Potosí">San Luis Potosí </option>
                                                    <option value="Sinaloa">Sinaloa </option>
                                                    <option value="Sonora">Sonora </option>
                                                    <option value="Tabasco">Tabasco </option>
                                                    <option value="Tamaulipas">Tamaulipas </option>
                                                    <option value="Tlaxcala">Tlaxcala </option>
                                                    <option value="Veracruz">Veracruz </option>
                                                    <option value="Yucatán">Yucatán </option>
                                                    <option value="Zacatecas">Zacatecas</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Código Postal
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraCodigoPostal"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    pattern="[0-9]{5}"
                                                    placeholder="12345"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Horarios de Atención
                                                </label>
                                                <textarea
                                                    name="MuestraHorarios"
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Ejemplo: Lunes a Viernes de 9:00 a 18:00"
                                                />
                                            </div>

                                            <hr />
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    ¿Requiere laboratorio auxiliar?
                                                </label>
                                                <select
                                                    name="MuestraRequiereLaboratorioAux"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                >
                                                    <option value="">Sin especificar</option>
                                                    <option value="si">Sí</option>
                                                    <option value="no">No</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Nombre del laboratorio auxiliar
                                                </label>
                                                <input
                                                    type="text"
                                                    name="MuestraNombreLaboratorioAux"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    placeholder="Nombre del laboratorio auxiliar (si aplica)"
                                                />
                                            </div>

                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>

                    </div>

                    {/* Botones de acción */}
                    <Card className="mt-6">
                        <CardContent className="p-4">
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={processing}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-[#189BAF] hover:bg-[#157a8c]"
                                    onClick={(e) => handleSubmit(e, 'crear')}
                                    disabled={processing}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Guardando...' : 'Crear Estudio'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
                {/**evento para cerrar busqueda */}
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