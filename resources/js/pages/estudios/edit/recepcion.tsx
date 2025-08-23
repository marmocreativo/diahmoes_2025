import { useMemo, useCallback, useState, useEffect } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, FileText, Truck, Package, Mail, Plus, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditRecepcionProps {
    estudio: any;
    pacientes: any[];
    correosExistentes: any[];
    [key: string]: any;
}

interface CorreoCopia {
    ID?: number;
    NOMBRE: string;
    CORREO: string;
    ID_ESTUDIO: number;
}

export default function EditRecepcionOptimized() {
    const { estudio, pacientes, correosExistentes } = usePage<EditRecepcionProps>().props;

    const { data, setData, patch, processing } = useForm({
        FECHA_RECEPCION: estudio.FECHA_RECEPCION ? 
            new Date(estudio.FECHA_RECEPCION).toISOString().split('T')[0] : '',
        HORA_RECEPCION: estudio.FECHA_RECEPCION ? 
            new Date(estudio.FECHA_RECEPCION).toTimeString().slice(0, 5) : '',
        ID_PACIENTE: estudio.ID_PACIENTE || '',
        CREAR_NUEVO_PACIENTE: false as boolean,
        NOMBRE_USUARIO: '',
        APELLIDOS_USUARIO: '',
        CORREO_USUARIO: '',
        TELEFONO_USUARIO: '',
        MUESTRA_GENERO: estudio.MUESTRA_GENERO || '',
        MUESTRA_EDAD: estudio.MUESTRA_EDAD || '',
        MUESTRA_CLAVE: estudio.MUESTRA_CLAVE || '',
        MUESTRA_FOLIO_SOBRE: estudio.MUESTRA_FOLIO_SOBRE || '',
        MUESTRA_FOLIO_KIT_BL: estudio.MUESTRA_FOLIO_KIT_BL || '',
        MUESTRA_OTROS_ROTULOS: estudio.MUESTRA_OTROS_ROTULOS || '',
        MUESTRA_INICIALES: estudio.MUESTRA_INICIALES || '',
        MUESTRA_SITIO_LESION: estudio.MUESTRA_SITIO_LESION || '',
        MUESTRA_TIPO_ESTUDIO: estudio.MUESTRA_TIPO_ESTUDIO || '',
        MUESTRA_TIPO: estudio.MUESTRA_TIPO || '',
        MUESTRA_BLOQUES: estudio.MUESTRA_BLOQUES || '',
        MUESTRA_LAMINILLAS: estudio.MUESTRA_LAMINILLAS || '',
        MUESTRA_DIAGNOSTICO_CLINICO: estudio.MUESTRA_DIAGNOSTICO_CLINICO || '',
        MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA: estudio.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA || '',
    });

    const [listaCorreos, setListaCorreos] = useState<CorreoCopia[]>([]);
    const [nuevoCorreo, setNuevoCorreo] = useState({ nombre: '', correo: '' });
    const [mensajeCorreos, setMensajeCorreos] = useState('');

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recepción', href: `/estudios/${estudio.ID}/edit/recepcion` },
    ], [estudio]);

    // Cargar correos existentes al montar el componente
    useEffect(() => {
        if (correosExistentes && correosExistentes.length > 0) {
            // Mapear correos existentes al formato correcto
            const correosFormateados = correosExistentes.map(correo => ({
                ID: correo.ID,
                NOMBRE: correo.NOMBRE,
                CORREO: correo.CORREO,
                ID_ESTUDIO: estudio.ID
            }));
            setListaCorreos(correosFormateados);
            setMensajeCorreos('');
        } else {
            setListaCorreos([]);
            setMensajeCorreos('No se han agregado correos para enviar resultados');
        }
    }, [correosExistentes, estudio.ID]);

    const handleSave = useCallback((e?: React.MouseEvent) => {
        console.log('🔴 handleSave ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form:', data);
        console.log('🔢 ID del estudio:', estudio.ID);
        
        // Preparar datos con fecha y hora combinadas si están presentes
        const formData = { ...data };
        if (data.FECHA_RECEPCION && data.HORA_RECEPCION) {
            formData.FECHA_RECEPCION = data.FECHA_RECEPCION + ' ' + data.HORA_RECEPCION + ':00';
            console.log('📅 Fecha combinada:', formData.FECHA_RECEPCION);
        }
        
        console.log('📤 Datos a enviar:', formData);
        console.log('🎯 URL de patch:', `/estudios/${estudio.ID}/recepcion`);
        
        router.patch(`/estudios/${estudio.ID}/recepcion`, formData, {
            onSuccess: (response) => {
                console.log('✅ Datos guardados exitosamente');
                console.log('📥 Respuesta del servidor:', response);
                alert('✅ Datos guardados exitosamente');
            },
            onError: (errors) => {
                console.error('❌ Error al guardar:', errors);
                console.error('🔍 Detalles del error:', JSON.stringify(errors, null, 2));
            },
            onStart: () => {
                console.log('🚀 Iniciando petición patch...');
            },
            onFinish: () => {
                console.log('🏁 Petición patch finalizada');
            }
        });
    }, [estudio.ID, data, router]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        console.log('🟡 handleNext ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form (Next):', data);
        console.log('🔢 ID del estudio (Next):', estudio.ID);
        
        // Preparar datos con fecha y hora combinadas si están presentes
        const formData = { ...data, _next: 'laboratorio' };
        if (data.FECHA_RECEPCION && data.HORA_RECEPCION) {
            formData.FECHA_RECEPCION = data.FECHA_RECEPCION + ' ' + data.HORA_RECEPCION + ':00';
            console.log('📅 Fecha combinada (Next):', formData.FECHA_RECEPCION);
        }
        
        console.log('📤 Datos a enviar (Next):', formData);
        console.log('🎯 URL de patch (Next):', `/estudios/${estudio.ID}/recepcion`);
        
        router.patch(`/estudios/${estudio.ID}/recepcion`, formData, {
            onSuccess: (response) => {
                console.log('✅ Datos guardados exitosamente (Next)');
                console.log('📥 Respuesta del servidor (Next):', response);
                console.log('🔄 Navegando a laboratorio...');
                router.visit(`/estudios/${estudio.ID}/edit/laboratorio`);
            },
            onError: (errors) => {
                console.error('❌ Error al guardar (Next):', errors);
                console.error('🔍 Detalles del error (Next):', JSON.stringify(errors, null, 2));
            },
            onStart: () => {
                console.log('🚀 Iniciando petición patch (Next)...');
            },
            onFinish: () => {
                console.log('🏁 Petición patch finalizada (Next)');
            }
        });
    }, [estudio.ID, data, router]);

    const handlePrev = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/recoleccion`);
    }, [estudio.ID]);

    const handleSaveAndExit = useCallback((e?: React.MouseEvent) => {
        console.log('🔵 handleSaveAndExit ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form (Salir):', data);
        console.log('🔢 ID del estudio (Salir):', estudio.ID);
        
        // Preparar datos con fecha y hora combinadas si están presentes
        const formData = { ...data };
        if (data.FECHA_RECEPCION && data.HORA_RECEPCION) {
            formData.FECHA_RECEPCION = data.FECHA_RECEPCION + ' ' + data.HORA_RECEPCION + ':00';
            console.log('📅 Fecha combinada (Salir):', formData.FECHA_RECEPCION);
        }
        
        console.log('📤 Datos a enviar (Salir):', formData);
        console.log('🎯 URL de patch (Salir):', `/estudios/${estudio.ID}/recepcion`);
        
        router.patch(`/estudios/${estudio.ID}/recepcion`, formData, {
            onSuccess: (response) => {
                console.log('✅ Datos guardados exitosamente (Salir)');
                console.log('📥 Respuesta del servidor (Salir):', response);
                console.log('🔄 Navegando a lista de estudios...');
                router.visit('/estudios');
            },
            onError: (errors) => {
                console.error('❌ Error al guardar (Salir):', errors);
                console.error('🔍 Detalles del error (Salir):', JSON.stringify(errors, null, 2));
            },
            onStart: () => {
                console.log('🚀 Iniciando petición patch (Salir)...');
            },
            onFinish: () => {
                console.log('🏁 Petición patch finalizada (Salir)');
            }
        });
    }, [estudio.ID, data, router]);

    const agregarCorreo = useCallback(() => {
        if (nuevoCorreo.nombre.trim() && nuevoCorreo.correo.trim()) {
            // Usar router.post de Inertia
            router.post(`/api/estudios/${estudio.ID}/correos-copia`, {
                nombre: nuevoCorreo.nombre.trim(),
                correo: nuevoCorreo.correo.trim(),
            }, {
                onSuccess: () => {
                    // Limpiar formulario
                    setNuevoCorreo({ nombre: '', correo: '' });
                    console.log('✅ Correo agregado exitosamente');
                },
                onError: (errors) => {
                    console.error('❌ Error al agregar correo:', errors);
                    if (errors.nombre) {
                        alert('Error en el nombre: ' + errors.nombre);
                    } else if (errors.correo) {
                        alert('Error en el correo: ' + errors.correo);
                    } else {
                        alert('Error al agregar correo');
                    }
                },
                preserveState: false, // Permitir que recargue la página para obtener datos actualizados
                preserveScroll: true,
            });
        }
    }, [nuevoCorreo, estudio.ID, router]);

    const eliminarCorreo = useCallback((index: number) => {
        const correo = listaCorreos[index];
        
        if (correo.ID) {
            // Usar router.delete de Inertia
            router.delete(`/api/estudios/${estudio.ID}/correos-copia/${correo.ID}`, {
                onSuccess: () => {
                    console.log('✅ Correo eliminado exitosamente');
                },
                onError: (errors) => {
                    console.error('❌ Error al eliminar correo:', errors);
                    alert('Error al eliminar correo');
                },
                preserveState: false, // Permitir que recargue la página para obtener datos actualizados
                preserveScroll: true,
            });
        } else {
            // Solo eliminar del estado local si no tiene ID (correo nuevo no guardado)
            setListaCorreos(prev => prev.filter((_, i) => i !== index));
        }
    }, [listaCorreos, estudio.ID, router]);

    // Determinar si mostrar campos de bloques/laminillas
    const mostrarBloques = data.MUESTRA_TIPO === 'Bloque de parafina' || data.MUESTRA_TIPO === 'Bloque de parafina y laminillas';
    const mostrarLaminillas = data.MUESTRA_TIPO === 'Bloque de parafina y laminillas' || data.MUESTRA_TIPO === 'Laminillas';

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Recepción`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con clave interna y estado */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-[#189BAF]" />
                                <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                            </div>
                            <Badge className="bg-[#189BAF] text-white">2. Recepción</Badge>
                        </div>
                        <Link href={`/estudios/${estudio.ID}`}>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Estudio
                            </Button>
                        </Link>
                    </div>
                    
                    {/* Barra de progreso del estado */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{estudio.ESTUDIO_ESTADO}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Recepción de la muestra */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🚚 Recepción de la muestra
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Fecha <small>(dd/mm/aaaa)</small></label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={data.FECHA_RECEPCION}
                                    onChange={(e) => setData('FECHA_RECEPCION', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className={labelClass}>Hora <small>(00:00)</small></label>
                                <input
                                    type="time"
                                    className={inputClass}
                                    value={data.HORA_RECEPCION}
                                    onChange={(e) => setData('HORA_RECEPCION', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* COLUMNA IZQUIERDA - Paciente y Correos */}
                        <div className="space-y-6">
                            {/* Paciente */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    📄 Paciente
                                </h3>
                                
                                {estudio.ID_PACIENTE ? (
                                    <div>
                                        <div>
                                            <label className={labelClass}>Cambiar Paciente</label>
                                            <select
                                                className={selectClass}
                                                value={data.ID_PACIENTE}
                                                onChange={(e) => setData('ID_PACIENTE', parseInt(e.target.value))}
                                            >
                                                {pacientes.map((paciente) => (
                                                    <option key={paciente.ID_USUARIO} value={paciente.ID_USUARIO}>
                                                        {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS} ({paciente.USUARIO_CORREO})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className={labelClass}>Elije el Paciente</label>
                                            <select
                                                className={selectClass}
                                                value={data.CREAR_NUEVO_PACIENTE ? 'nuevo' : data.ID_PACIENTE}
                                                onChange={(e) => {
                                                    if (e.target.value === 'nuevo') {
                                                        setData('CREAR_NUEVO_PACIENTE', true);
                                                        setData('ID_PACIENTE', '');
                                                    } else {
                                                        setData('CREAR_NUEVO_PACIENTE', false);
                                                        setData('ID_PACIENTE', parseInt(e.target.value));
                                                    }
                                                }}
                                                required
                                            >
                                                <option value="">Selecciona un Paciente</option>
                                                <option value="nuevo">Nuevo Paciente</option>
                                                {pacientes.map((paciente) => (
                                                    <option key={paciente.ID_USUARIO} value={paciente.ID_USUARIO}>
                                                        {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS} ({paciente.USUARIO_CORREO})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Formulario nuevo paciente */}
                                        {data.CREAR_NUEVO_PACIENTE && (
                                            <div className="space-y-4 border-t pt-4">
                                                <h5 className="font-medium">Nuevo Paciente</h5>
                                                
                                                <div>
                                                    <label className={labelClass}>Nombre Paciente</label>
                                                    <input
                                                        type="text"
                                                        className={inputClass}
                                                        value={data.NOMBRE_USUARIO}
                                                        onChange={(e) => setData('NOMBRE_USUARIO', e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className={labelClass}>Apellidos Paciente</label>
                                                    <input
                                                        type="text"
                                                        className={inputClass}
                                                        value={data.APELLIDOS_USUARIO}
                                                        onChange={(e) => setData('APELLIDOS_USUARIO', e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className={labelClass}>Correo Paciente</label>
                                                    <input
                                                        type="email"
                                                        className={inputClass}
                                                        value={data.CORREO_USUARIO}
                                                        onChange={(e) => setData('CORREO_USUARIO', e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className={labelClass}>Teléfono Paciente</label>
                                                    <input
                                                        type="text"
                                                        className={inputClass}
                                                        value={data.TELEFONO_USUARIO}
                                                        onChange={(e) => setData('TELEFONO_USUARIO', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Lista de Correos */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    ✉️ Lista de Correos para envío de informes
                                </h3>
                                
                                {/* Agregar nuevo correo */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <h5 className="font-medium mb-2">Añadir nueva dirección de correo para copia</h5>
                                    <div className="grid grid-cols-5 gap-2">
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="Nombre Completo"
                                                value={nuevoCorreo.nombre}
                                                onChange={(e) => setNuevoCorreo(prev => ({...prev, nombre: e.target.value}))}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="email"
                                                className={inputClass}
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

                                {/* Mensaje cuando no hay correos */}
                                {mensajeCorreos && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                        <p className="text-yellow-800 text-sm font-medium">{mensajeCorreos}</p>
                                    </div>
                                )}

                                {/* Lista de correos agregados */}
                                {listaCorreos.length > 0 && (
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

                        {/* COLUMNA DERECHA - Información de la muestra */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    📦 Información de la Muestra
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Género</label>
                                            <select
                                                className={selectClass}
                                                value={data.MUESTRA_GENERO}
                                                onChange={(e) => setData('MUESTRA_GENERO', e.target.value)}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Femenino">Femenino</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className={labelClass}>Edad</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_EDAD}
                                                onChange={(e) => setData('MUESTRA_EDAD', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>ID Muestra Recibida</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={data.MUESTRA_CLAVE}
                                            onChange={(e) => setData('MUESTRA_CLAVE', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Folio Sobre</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_FOLIO_SOBRE}
                                                onChange={(e) => setData('MUESTRA_FOLIO_SOBRE', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className={labelClass}>Folio KIT BL</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_FOLIO_KIT_BL}
                                                onChange={(e) => setData('MUESTRA_FOLIO_KIT_BL', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Otros Rótulos</label>
                                        <textarea
                                            className={textareaClass}
                                            rows={3}
                                            value={data.MUESTRA_OTROS_ROTULOS}
                                            onChange={(e) => setData('MUESTRA_OTROS_ROTULOS', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Iniciales del Paciente</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_INICIALES}
                                                onChange={(e) => setData('MUESTRA_INICIALES', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className={labelClass}>Sitio de la lesión</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_SITIO_LESION}
                                                onChange={(e) => setData('MUESTRA_SITIO_LESION', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Tipo de Estudio</label>
                                        <select
                                            className={selectClass}
                                            value={data.MUESTRA_TIPO_ESTUDIO}
                                            onChange={(e) => setData('MUESTRA_TIPO_ESTUDIO', e.target.value)}
                                        >
                                            <option value="">Selecciona</option>
                                            <option value="Biopsia Sólida">Biopsia Sólida</option>
                                            <option value="Biopsia Líquida">Biopsia Líquida</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Tipo de Muestra</label>
                                        <select
                                            className={selectClass}
                                            value={data.MUESTRA_TIPO}
                                            onChange={(e) => setData('MUESTRA_TIPO', e.target.value)}
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

                                    {/* Campos condicionales para bloques y laminillas */}
                                    {mostrarBloques && (
                                        <div>
                                            <label className={labelClass}>Bloques</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_BLOQUES}
                                                onChange={(e) => setData('MUESTRA_BLOQUES', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {mostrarLaminillas && (
                                        <div>
                                            <label className={labelClass}>Laminillas</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_LAMINILLAS}
                                                onChange={(e) => setData('MUESTRA_LAMINILLAS', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className={labelClass}>Diagnóstico Clínico</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={data.MUESTRA_DIAGNOSTICO_CLINICO}
                                            onChange={(e) => setData('MUESTRA_DIAGNOSTICO_CLINICO', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Diagnóstico Histopatológico de Referencia</label>
                                        <textarea
                                            className={textareaClass}
                                            rows={3}
                                            value={data.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA}
                                            onChange={(e) => setData('MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between">
                            <Button 
                                type="button"
                                variant="outline" 
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={handleSaveAndExit}
                                disabled={processing}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Guardar y Salir
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleSave}
                                    disabled={processing}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Solo Guardar
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    onClick={handleNext}
                                    disabled={processing}
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