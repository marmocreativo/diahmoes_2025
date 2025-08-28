import { useState, useRef, useCallback } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, FileText, Plus, Trash2 } from 'lucide-react';
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

export default function EditRecepcionOptimized() {
    const { estudio, pacientes = [], correosExistentes = [], tiposEnvio } = usePage<EditRecepcionProps>().props;

    // Referencias para inputs simples - no causan re-renders
    const formRef = useRef<HTMLFormElement>(null);
    
    // Solo estado mínimo para campos dependientes
    const [dependentFields, setDependentFields] = useState({
        CrearNuevoPaciente: false,
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recepción', href: `/estudios/${estudio.ID}/edit/recepcion` },
    ];

    // Preparar fecha y hora iniciales
    const fechaInicial = estudio.FECHA_RECEPCION ? 
        new Date(estudio.FECHA_RECEPCION).toISOString().split('T')[0] : '';
    const horaInicial = estudio.FECHA_RECEPCION ? 
        new Date(estudio.FECHA_RECEPCION).toTimeString().slice(0, 5) : '';

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
                data[key] = parseInt(stringValue) || null;
            }
            // Strings normales
            else {
                data[key] = stringValue;
            }
        }

        // Lógica especial para CREAR_NUEVO_PACIENTE basado en el select
        const selectPaciente = form.querySelector('[name="ID_PACIENTE_SELECT"]') as HTMLSelectElement;
        data.CREAR_NUEVO_PACIENTE = selectPaciente?.value === 'nuevo';

        // Si es nuevo paciente, no enviar ID_PACIENTE
        if (data.CREAR_NUEVO_PACIENTE) {
            data.ID_PACIENTE = null;
        } else if (selectPaciente?.value && selectPaciente.value !== '') {
            data.ID_PACIENTE = parseInt(selectPaciente.value);
        }

        // Combinar fecha y hora si están presentes
        if (data.FECHA_RECEPCION && data.HORA_RECEPCION) {
            data.FECHA_RECEPCION = data.FECHA_RECEPCION + ' ' + data.HORA_RECEPCION + ':00';
        }

        return data;
    }, []);

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
        if (nuevoCorreo.nombre.trim() && nuevoCorreo.correo.trim()) {
            router.post(`/api/estudios/${estudio.ID}/correos-copia`, {
                nombre: nuevoCorreo.nombre.trim(),
                correo: nuevoCorreo.correo.trim(),
            }, {
                onSuccess: () => {
                    setNuevoCorreo({ nombre: '', correo: '' });
                    // Actualizar lista local - en un caso real recargarías la página
                    setListaCorreos(prev => [...prev, {
                        NOMBRE: nuevoCorreo.nombre.trim(),
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
                                    {estudio.ID_PACIENTE ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cambiar Paciente
                                            </label>
                                            <select
                                                name="ID_PACIENTE"
                                                defaultValue={estudio.ID_PACIENTE}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                            >
                                                {pacientes.map((paciente: any) => (
                                                    <option key={paciente.ID_USUARIO} value={paciente.ID_USUARIO}>
                                                        {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS} ({paciente.USUARIO_CORREO})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Elije el Paciente
                                                </label>
                                                <select
                                                    name="ID_PACIENTE_SELECT"
                                                    onChange={(e) => {
                                                        const isNew = e.target.value === 'nuevo';
                                                        setDependentFields(prev => ({ ...prev, CrearNuevoPaciente: isNew }));
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Selecciona un Paciente</option>
                                                    <option value="nuevo">Nuevo Paciente</option>
                                                    {pacientes.map((paciente: any) => (
                                                        <option key={paciente.ID_USUARIO} value={paciente.ID_USUARIO}>
                                                            {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Formulario nuevo paciente */}
                                            {dependentFields.CrearNuevoPaciente && (
                                                <div className="space-y-4 p-4 bg-gray-50 rounded-md border">
                                                    <h4 className="font-medium text-gray-800">Nuevo Paciente</h4>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Nombre
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="NOMBRE_USUARIO"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                            required
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Apellidos
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="APELLIDOS_USUARIO"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                            required
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Correo
                                                        </label>
                                                        <input
                                                            type="email"
                                                            name="CORREO_USUARIO"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                            required
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Teléfono
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="TELEFONO_USUARIO"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                        />
                                                    </div>
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
                                                placeholder="Nombre Completo"
                                                value={nuevoCorreo.nombre}
                                                onChange={(e) => setNuevoCorreo(prev => ({...prev, nombre: e.target.value}))}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Correo"
                                                value={nuevoCorreo.correo}
                                                onChange={(e) => setNuevoCorreo(prev => ({...prev, correo: e.target.value}))}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={agregarCorreo}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            disabled={!nuevoCorreo.nombre.trim() || !nuevoCorreo.correo.trim()}
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
                                                    <p className="font-medium">{correo.NOMBRE}</p>
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