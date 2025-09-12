import { useState, useRef, useCallback, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, FileText, Plus, Trash2, ExternalLink, User } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditRecepcionProps {
    estudio: any;
    pacientes: any[];
    correosExistentes: any[];
    tiposEnvio: Record<string, string>;
    [key: string]: any;
}

interface CorreoCopia {
    ID?: number;
    NOMBRE: string;
    CORREO: string;
    ID_ESTUDIO: number;
}

interface PacienteEncontrado {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    MUESTRA_EDAD: string;
    INSTITUCION_NOMBRE: string;
    FECHA_ULTIMO_ESTUDIO: string;
    ID_ULTIMO_ESTUDIO: number;
    CLAVE_INTERNA_ULTIMO: string;
}

export default function EditRecepcionOptimized() {
    const { estudio, pacientes = [], correosExistentes = [], tiposEnvio } = usePage<EditRecepcionProps>().props;

    // Referencias para inputs simples - no causan re-renders
    const formRef = useRef<HTMLFormElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    
    // Estado mínimo para campos dependientes
    const [dependentFields, setDependentFields] = useState({
        mostrarBloques: false,
        mostrarLaminillas: false,
        processing: false,
    });

    // Estado para correos
    const [listaCorreos, setListaCorreos] = useState<CorreoCopia[]>(
        correosExistentes.map(correo => ({
            ID: correo.ID,
            NOMBRE: correo.NOMBRE,
            CORREO: correo.CORREO,
            ID_ESTUDIO: estudio.ID
        }))
    );
    const [nuevoCorreo, setNuevoCorreo] = useState({ nombre: '', correo: '' });

    // Estado para búsqueda de pacientes
    const [nombrePaciente, setNombrePaciente] = useState(estudio.USUARIO_NOMBRE || '');
    const [apellidosPaciente, setApellidosPaciente] = useState(estudio.USUARIO_APELLIDOS || '');
    const [pacienteEncontrado, setPacienteEncontrado] = useState<PacienteEncontrado | null>(null);
    const [buscandoPaciente, setBuscandoPaciente] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recepción', href: `/estudios/${estudio.ID}/edit/recepcion` },
    ];
// Función para buscar paciente por nombre y apellidos con logs detallados
const buscarPaciente = useCallback(async (nombre: string, apellidos: string) => {
    console.log('=== INICIO BÚSQUEDA PACIENTE ===');
    console.log('Parámetros recibidos:', { 
        nombre: `"${nombre}"`, 
        apellidos: `"${apellidos}"`,
        nombreLength: nombre.length,
        apellidosLength: apellidos.length,
        nombreTrimmed: `"${nombre.trim()}"`,
        apellidosTrimmed: `"${apellidos.trim()}"`,
        nombreTrimmedLength: nombre.trim().length,
        apellidosTrimmedLength: apellidos.trim().length
    });
    
    if (!nombre.trim() || !apellidos.trim()) {
        console.log('BÚSQUEDA CANCELADA: Uno o ambos campos están vacíos');
        console.log('Condiciones:', {
            nombreTrimEmpty: !nombre.trim(),
            apellidosTrimEmpty: !apellidos.trim()
        });
        setPacienteEncontrado(null);
        return;
    }

    console.log('CONDICIONES CUMPLIDAS - Iniciando búsqueda...');
    setBuscandoPaciente(true);
    
    try {
        // Obtener CSRF token
        const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = csrfTokenMeta?.getAttribute('content');
        
        console.log('CSRF Token encontrado:', {
            metaExists: !!csrfTokenMeta,
            tokenValue: csrfToken ? `"${csrfToken}"` : 'null',
            tokenLength: csrfToken?.length || 0
        });
        
        // Preparar datos de la petición
        const requestBody = {
            nombre: nombre.trim(),
            apellidos: apellidos.trim(),
        };
        
        console.log('Datos a enviar:', requestBody);
        
        // Configurar headers
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
        };
        
        console.log('Headers configurados:', headers);
        
        // URL de la petición
        const url = '/api/pacientes/buscar';
        console.log('URL de petición:', url);
        
        console.log('=== ENVIANDO PETICIÓN FETCH ===');
        console.log('Configuración completa:', {
            url,
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        console.log('=== RESPUESTA RECIBIDA ===');
        console.log('Response object:', response);
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            console.log('RESPUESTA EXITOSA - Parseando JSON...');
            
            try {
                const data = await response.json();
                console.log('=== DATOS PARSEADOS ===');
                console.log('Datos completos recibidos:', data);
                console.log('Tipo de datos:', typeof data);
                console.log('Es array:', Array.isArray(data));
                console.log('Propiedades del objeto:', Object.keys(data));
                
                if (data.paciente) {
                    console.log('PACIENTE ENCONTRADO:');
                    console.log('Datos del paciente:', data.paciente);
                    console.log('Propiedades del paciente:', Object.keys(data.paciente));
                    setPacienteEncontrado(data.paciente);
                } else {
                    console.log('NO SE ENCONTRÓ PACIENTE');
                    console.log('data.paciente es:', data.paciente);
                    setPacienteEncontrado(null);
                }
            } catch (jsonError) {
                console.error('ERROR AL PARSEAR JSON:', jsonError);
                console.log('Intentando leer como texto...');
                
                // Reiniciar el response para leer como texto
                const responseClone = response.clone();
                const responseText = await responseClone.text();
                console.log('Respuesta como texto:', responseText);
                setPacienteEncontrado(null);
            }
        } else {
            console.error('=== ERROR EN RESPUESTA ===');
            console.error('Status code:', response.status);
            console.error('Status text:', response.statusText);
            
            try {
                const errorText = await response.text();
                console.error('Cuerpo del error:', errorText);
                
                // Intentar parsear como JSON si es posible
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Error parseado como JSON:', errorJson);
                } catch (parseError) {
                    console.error('El error no es JSON válido');
                }
            } catch (textError) {
                console.error('Error al leer el texto del error:', textError);
            }
            
            setPacienteEncontrado(null);
        }
    } catch (error) {
        
        // Información adicional sobre el error
        if (error instanceof TypeError) {
            console.error('Es un TypeError - probablemente problema de red');
        }
        if (error instanceof SyntaxError) {
            console.error('Es un SyntaxError - probablemente problema de JSON');
        }
        
        setPacienteEncontrado(null);
    } finally {
        console.log('=== FINALIZANDO BÚSQUEDA ===');
        setBuscandoPaciente(false);
        console.log('Estado buscandoPaciente establecido a false');
    }
}, []);

// Efecto para búsqueda automática con debounce - con logs
useEffect(() => {
    console.log('=== EFECTO DE BÚSQUEDA EJECUTADO ===');
    console.log('Valores actuales:', {
        nombrePaciente: `"${nombrePaciente}"`,
        apellidosPaciente: `"${apellidosPaciente}"`,
        timeoutExistente: !!timeoutRef.current
    });
    
    if (timeoutRef.current) {
        console.log('Limpiando timeout anterior...');
        clearTimeout(timeoutRef.current);
    }

    console.log('Configurando nuevo timeout de 500ms...');
    timeoutRef.current = setTimeout(() => {
        console.log('TIMEOUT EJECUTADO - Llamando buscarPaciente...');
        buscarPaciente(nombrePaciente, apellidosPaciente);
    }, 500);

    return () => {
        console.log('Cleanup del efecto - limpiando timeout');
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
}, [nombrePaciente, apellidosPaciente, buscarPaciente]);

const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('=== CAMBIO EN NOMBRE ===');
    console.log('Valor anterior:', `"${nombrePaciente}"`);
    console.log('Valor nuevo:', `"${newValue}"`);
    setNombrePaciente(newValue);
};

const handleApellidosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('=== CAMBIO EN APELLIDOS ===');
    console.log('Valor anterior:', `"${apellidosPaciente}"`);
    console.log('Valor nuevo:', `"${newValue}"`);
    setApellidosPaciente(newValue);
};

    // Función para obtener fecha y hora actuales en formato requerido
    const getCurrentDateTime = () => {
        const now = new Date();
        const fecha = now.toISOString().split('T')[0];
        const hora = now.toTimeString().slice(0, 5);
        return { fecha, hora };
    };

    // Preparar fecha y hora iniciales (actuales por defecto o existentes)
    const { fecha: fechaActual, hora: horaActual } = getCurrentDateTime();
    const fechaInicial = estudio.FECHA_RECEPCION ? 
        new Date(estudio.FECHA_RECEPCION).toISOString().split('T')[0] : fechaActual;
    const horaInicial = estudio.FECHA_RECEPCION ? 
        new Date(estudio.FECHA_RECEPCION).toTimeString().slice(0, 5) : horaActual;

    // Función para obtener todos los valores del formulario
    const getFormData = useCallback(() => {
        const form = formRef.current;
        if (!form) return {};

        const formData = new FormData(form);
        const data: any = {};

        // Convertir FormData a objeto
        for (const [key, value] of formData.entries()) {
            const stringValue = value as string;
            
            // Manejar números
            if (['ID_PACIENTE'].includes(key)) {
                data[key] = parseInt(stringValue) || 0;
            }
            // Strings normales
            else {
                data[key] = stringValue;
            }
        }

        // Agregar datos del paciente
        data.NOMBRE_USUARIO = nombrePaciente;
        data.APELLIDOS_USUARIO = apellidosPaciente;

        // Combinar fecha y hora si están presentes
        if (data.FECHA_RECEPCION && data.HORA_RECEPCION) {
            data.FECHA_RECEPCION = data.FECHA_RECEPCION + ' ' + data.HORA_RECEPCION + ':00';
        }

        return data;
    }, [nombrePaciente, apellidosPaciente]);

    // Manejar cambios en campos dependientes
    const handleDependentFieldChange = useCallback((key: string, value: boolean | string) => {
        setDependentFields(prev => {
            const newState = { ...prev, [key]: value };

            // Lógica para mostrar/ocultar campos
            if (key === 'MUESTRA_TIPO') {
                const tipoValue = value as string;
                newState.mostrarBloques = tipoValue === 'Bloque de parafina' || tipoValue === 'Bloque de parafina y laminillas';
                newState.mostrarLaminillas = tipoValue === 'Bloque de parafina y laminillas' || tipoValue === 'Laminillas';
            }

            return newState;
        });
    }, []);

    const handleSave = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        
        if (dependentFields.processing) return;
        
        setDependentFields(prev => ({ ...prev, processing: true }));
        const formData = getFormData();
        
        router.patch(`/estudios/${estudio.ID}/recepcion`, formData, {
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
        const formData = { ...getFormData(), _next: 'laboratorio' };
        
        router.patch(`/estudios/${estudio.ID}/recepcion`, formData, {
            onSuccess: () => {
                router.visit(`/estudios/${estudio.ID}/edit/laboratorio`);
            },
            onError: (errors) => {
                console.error('Error al guardar:', errors);
            },
            onFinish: () => {
                setDependentFields(prev => ({ ...prev, processing: false }));
            }
        });
    }, [estudio.ID, getFormData, dependentFields.processing]);

    const handlePrev = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/recoleccion`);
    }, [estudio.ID]);

    const handleSaveAndExit = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        
        if (dependentFields.processing) return;
        
        setDependentFields(prev => ({ ...prev, processing: true }));
        const formData = getFormData();
        
        router.patch(`/estudios/${estudio.ID}/recepcion`, formData, {
            onSuccess: () => {
                router.visit('/estudios');
            },
            onError: (errors) => {
                console.error('Error al guardar:', errors);
            },
            onFinish: () => {
                setDependentFields(prev => ({ ...prev, processing: false }));
            }
        });
    }, [estudio.ID, getFormData, dependentFields.processing]);

    const agregarCorreo = useCallback(() => {
        if (nuevoCorreo.correo.trim()) {
            router.post(`/api/estudios/${estudio.ID}/correos-copia`, {
                nombre: nuevoCorreo.nombre.trim() || '',
                correo: nuevoCorreo.correo.trim(),
            }, {
                onSuccess: () => {
                    setNuevoCorreo({ nombre: '', correo: '' });
                    setListaCorreos(prev => [...prev, {
                        NOMBRE: nuevoCorreo.nombre.trim() || '',
                        CORREO: nuevoCorreo.correo.trim(),
                        ID_ESTUDIO: estudio.ID
                    }]);
                },
                onError: (errors) => {
                    console.error('Error al agregar correo:', errors);
                },
                preserveState: true,
                preserveScroll: true,
            });
        }
    }, [nuevoCorreo, estudio.ID]);

    const eliminarCorreo = useCallback((index: number) => {
        const correo = listaCorreos[index];
        
        if (correo.ID) {
            router.delete(`/api/estudios/${estudio.ID}/correos-copia/${correo.ID}`, {
                onSuccess: () => {
                    setListaCorreos(prev => prev.filter((_, i) => i !== index));
                },
                onError: (errors) => {
                    console.error('Error al eliminar correo:', errors);
                },
                preserveState: true,
                preserveScroll: true,
            });
        } else {
            setListaCorreos(prev => prev.filter((_, i) => i !== index));
        }
    }, [listaCorreos, estudio.ID]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Recepción`} />
            
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
                            <Badge variant="outline">1. Recolección</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge className="bg-[#189BAF] text-white">2. Recepción</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">3. Laboratorio</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">4. Informe</Badge>
                        </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Formulario Principal - HTML Puro para performance */}
                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    
                    {/* Campo oculto para ID_PACIENTE */}
                    <input
                        type="hidden"
                        name="ID_PACIENTE"
                        value={estudio.ID_PACIENTE || 0}
                    />
                    
                    {/* Fecha de Recepción */}
                    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                        <h3 className="text-lg font-semibold mb-4">Recepción de la muestra</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    name="FECHA_RECEPCION"
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
                                    name="HORA_RECEPCION"
                                    defaultValue={horaInicial}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Columna Izquierda */}
                        <div className="space-y-6">

{/* Paciente */}
<div className="bg-white rounded-lg p-6 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Paciente</h3>
    
    <div className="space-y-4">
                        {/* Mostrar select si ya hay un paciente asignado */}
        {estudio.ID_PACIENTE && estudio.ID_PACIENTE > 0 ? (
            <>
                {/* Selector de pacientes existentes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paciente Asignado
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            list="pacientes-list"
                            name="PACIENTE_SEARCH"
                            placeholder="Buscar paciente existente..."
                            defaultValue={(() => {
                                // Buscar el paciente actual en la lista de pacientes
                                const pacienteActual = pacientes.find(p => p.ID_USUARIO === estudio.ID_PACIENTE);
                                return pacienteActual ? `${pacienteActual.USUARIO_NOMBRE} ${pacienteActual.USUARIO_APELLIDOS}` : 
                                       (estudio.USUARIO_NOMBRE ? `${estudio.USUARIO_NOMBRE} ${estudio.USUARIO_APELLIDOS}` : '');
                            })()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                            onChange={(e) => {
                                // Buscar el paciente seleccionado y actualizar el campo hidden
                                const pacienteSeleccionado = pacientes.find(p => 
                                    `${p.USUARIO_NOMBRE} ${p.USUARIO_APELLIDOS}` === e.target.value
                                );
                                if (pacienteSeleccionado) {
                                    // Actualizar el campo hidden
                                    const hiddenInput = document.querySelector('input[name="ID_PACIENTE"]') as HTMLInputElement;
                                    if (hiddenInput) {
                                        hiddenInput.value = pacienteSeleccionado.ID_USUARIO.toString();
                                    }
                                    // Actualizar los campos de nombre
                                    setNombrePaciente(pacienteSeleccionado.USUARIO_NOMBRE);
                                    setApellidosPaciente(pacienteSeleccionado.USUARIO_APELLIDOS);
                                } else if (e.target.value === '' || e.target.value === 'Nuevo Paciente') {
                                    // Si se selecciona "Nuevo Paciente" o se borra el campo
                                    const hiddenInput = document.querySelector('input[name="ID_PACIENTE"]') as HTMLInputElement;
                                    if (hiddenInput) {
                                        hiddenInput.value = '0';
                                    }
                                    setNombrePaciente('');
                                    setApellidosPaciente('');
                                }
                            }}
                        />
                        <datalist id="pacientes-list">
                            <option value="">Nuevo Paciente</option>
                            {pacientes.map((paciente: any) => (
                                <option 
                                    key={paciente.ID_USUARIO} 
                                    value={`${paciente.USUARIO_NOMBRE} ${paciente.USUARIO_APELLIDOS}`}
                                />
                            ))}
                        </datalist>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Busca y selecciona un paciente existente o selecciona "Nuevo Paciente" para crear uno nuevo
                    </p>
                </div>

                {/* Botón para cambiar a modo "nuevo paciente" */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-700 text-sm">
                            ¿Quieres crear un nuevo paciente en lugar de usar uno existente?
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                // Resetear el campo hidden a 0
                                const hiddenInput = document.querySelector('input[name="ID_PACIENTE"]') as HTMLInputElement;
                                if (hiddenInput) {
                                    hiddenInput.value = '0';
                                }
                                // Limpiar campos
                                setNombrePaciente('');
                                setApellidosPaciente('');
                                setPacienteEncontrado(null);
                                // Forzar re-render
                                window.location.reload();
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            Nuevo Paciente
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <>
                {/* Campos de nombre y apellidos para nuevo paciente */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={nombrePaciente}
                            onChange={handleNombreChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                            required
                            placeholder="Nombre del paciente"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellidos *
                        </label>
                        <input
                            type="text"
                            value={apellidosPaciente}
                            onChange={handleApellidosChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                            required
                            placeholder="Apellidos del paciente"
                        />
                    </div>
                </div>

                {/* Indicador de búsqueda */}
                {buscandoPaciente && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-blue-700 text-sm">Buscando paciente...</span>
                        </div>
                    </div>
                )}

                {/* Información del paciente encontrado */}
                {pacienteEncontrado && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <User className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-medium text-green-800">Paciente encontrado</h4>
                                </div>
                                
                                <div className="space-y-1 text-sm text-green-700">
                                    <p><strong>Nombre:</strong> {pacienteEncontrado.USUARIO_NOMBRE} {pacienteEncontrado.USUARIO_APELLIDOS}</p>
                                    {pacienteEncontrado.MUESTRA_EDAD && (
                                        <p><strong>Edad:</strong> {pacienteEncontrado.MUESTRA_EDAD}</p>
                                    )}
                                    {pacienteEncontrado.INSTITUCION_NOMBRE && (
                                        <p><strong>Institución:</strong> {pacienteEncontrado.INSTITUCION_NOMBRE}</p>
                                    )}
                                    <p><strong>Último estudio:</strong> {new Date(pacienteEncontrado.FECHA_ULTIMO_ESTUDIO).toLocaleDateString()}</p>
                                    <p><strong>Clave:</strong> {pacienteEncontrado.CLAVE_INTERNA_ULTIMO}</p>
                                </div>
                                
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Asignar el paciente encontrado
                                            const hiddenInput = document.querySelector('input[name="ID_PACIENTE"]') as HTMLInputElement;
                                            if (hiddenInput) {
                                                hiddenInput.value = pacienteEncontrado.ID_USUARIO.toString();
                                            }
                                            alert('Paciente asignado al estudio');
                                        }}
                                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    >
                                        Usar este paciente
                                    </button>
                                </div>
                            </div>
                            
                            <a
                                href={`/estudios/${pacienteEncontrado.ID_ULTIMO_ESTUDIO}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-3 inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Ver estudio
                                <ExternalLink className="ml-1 h-4 w-4" />
                            </a>
                        </div>
                    </div>
                )}

                {/* Mensaje cuando no se encuentra paciente */}
                {!buscandoPaciente && nombrePaciente.trim() && apellidosPaciente.trim() && !pacienteEncontrado && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm">
                            No se encontró un paciente con este nombre. Se creará un nuevo registro.
                        </p>
                    </div>
                )}
            </>
        )}
    </div>
</div>

                            {/* Lista de Correos */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Lista de Correos para envío de informes</h3>
                                
                                {/* Agregar nuevo correo */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <h5 className="font-medium mb-2">Añadir nueva dirección de correo para copia</h5>
                                    <div className="grid grid-cols-5 gap-2">
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Nombre Completo (Opcional)"
                                                value={nuevoCorreo.nombre}
                                                onChange={(e) => setNuevoCorreo(prev => ({...prev, nombre: e.target.value}))}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Correo *"
                                                value={nuevoCorreo.correo}
                                                onChange={(e) => setNuevoCorreo(prev => ({...prev, correo: e.target.value}))}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={agregarCorreo}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            disabled={!nuevoCorreo.correo.trim()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Lista de correos */}
                                {listaCorreos.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800 text-sm font-medium">No se han agregado correos para enviar resultados</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <h5 className="font-medium">Correos agregados:</h5>
                                        {listaCorreos.map((correo, index) => (
                                            <div
                                                key={correo.ID || index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{correo.NOMBRE || 'Sin nombre'}</p>
                                                    <p className="text-sm text-gray-600">{correo.CORREO}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarCorreo(index)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha - Información de la muestra */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Información de la Muestra</h3>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Género
                                            </label>
                                            <select
                                                name="MUESTRA_GENERO"
                                                defaultValue={estudio.MUESTRA_GENERO || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Femenino">Femenino</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Edad
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_EDAD"
                                                defaultValue={estudio.MUESTRA_EDAD || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID Muestra Recibida
                                        </label>
                                        <input
                                            type="text"
                                            name="MUESTRA_CLAVE"
                                            defaultValue={estudio.MUESTRA_CLAVE || ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Folio Sobre
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_FOLIO_SOBRE"
                                                defaultValue={estudio.MUESTRA_FOLIO_SOBRE || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Folio KIT BL
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_FOLIO_KIT_BL"
                                                defaultValue={estudio.MUESTRA_FOLIO_KIT_BL || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Otros Rótulos
                                        </label>
                                        <textarea
                                            name="MUESTRA_OTROS_ROTULOS"
                                            defaultValue={estudio.MUESTRA_OTROS_ROTULOS || ''}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Iniciales del Paciente
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_INICIALES"
                                                defaultValue={estudio.MUESTRA_INICIALES || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sitio de la lesión
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_SITIO_LESION"
                                                defaultValue={estudio.MUESTRA_SITIO_LESION || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo de Estudio
                                        </label>
                                        <select
                                            name="MUESTRA_TIPO_ESTUDIO"
                                            defaultValue={estudio.MUESTRA_TIPO_ESTUDIO || ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        >
                                            <option value="">Selecciona</option>
                                            <option value="Biopsia Sólida">Biopsia Sólida</option>
                                            <option value="Biopsia Líquida">Biopsia Líquida</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo de Muestra
                                        </label>
                                        <select
                                            name="MUESTRA_TIPO"
                                            defaultValue={estudio.MUESTRA_TIPO || ''}
                                            onChange={(e) => handleDependentFieldChange('MUESTRA_TIPO', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        >
                                            <option value="">Selecciona</option>
                                            <option value="Bloque de parafina">Bloque de parafina</option>
                                            <option value="Bloque de parafina y laminillas">Bloque de parafina y laminillas</option>
                                            <option value="Laminillas">Laminillas</option>
                                            <option value="Sangre total">Sangre total</option>
                                            <option value="Muestra Tisular">Muestra Tisular</option>
                                            <option value="Muestra Citológica">Muestra Citológica</option>
                                        </select>
                                    </div>

                                    {/* Campos condicionales */}
                                    {dependentFields.mostrarBloques && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Bloques
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_BLOQUES"
                                                defaultValue={estudio.MUESTRA_BLOQUES || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                    )}

                                    {dependentFields.mostrarLaminillas && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Laminillas
                                            </label>
                                            <input
                                                type="text"
                                                name="MUESTRA_LAMINILLAS"
                                                defaultValue={estudio.MUESTRA_LAMINILLAS || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Diagnóstico Clínico
                                        </label>
                                        <input
                                            type="text"
                                            name="MUESTRA_DIAGNOSTICO_CLINICO"
                                            defaultValue={estudio.MUESTRA_DIAGNOSTICO_CLINICO || ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Diagnóstico Histopatológico de Referencia
                                        </label>
                                        <textarea
                                            name="MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA"
                                            defaultValue={estudio.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA || ''}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
                        <div className="flex justify-between">
                            <div className="flex gap-2">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrev}
                                    disabled={dependentFields.processing}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Anterior
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={handleSaveAndExit}
                                    disabled={dependentFields.processing}
                                >
                                    Guardar y Salir
                                </Button>
                            </div>
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
            </div>
        </AppLayout>
    );
}