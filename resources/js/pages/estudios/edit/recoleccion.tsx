import { useMemo, useCallback, useEffect } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
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
    [key: string]: any;
}

export default function EditRecoleccionOptimized() {
    const { estudio, medicos, pacientes, instituciones, clientes } = usePage<EditRecoleccionProps>().props;

    const { data, setData, patch, processing } = useForm({
        CLAVE_INTERNA: estudio.CLAVE_INTERNA || '',
        FOLIO_MERCK: estudio.FOLIO_MERCK || '',
        FECHA_SOLICITUD_RECOLECCION: estudio.FECHA_SOLICITUD_RECOLECCION ? 
            new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toISOString().split('T')[0] : '',
        HORA_SOLICITUD_RECOLECCION: estudio.FECHA_SOLICITUD_RECOLECCION ? 
            new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toTimeString().slice(0, 5) : '',
        ID_CLIENTE: estudio.ID_CLIENTE || '',
        ID_INSTITUCION: estudio.ID_INSTITUCION || '',
        ID_MEDICO: estudio.ID_MEDICO || '',
        MUESTRA_GUIA_MENSAJERIA: estudio.MUESTRA_GUIA_MENSAJERIA || '',
        MUESTRA_GUIA: estudio.MUESTRA_GUIA || '',
        MUESTRA_REFERENCIAS: estudio.MUESTRA_REFERENCIAS || '',
        MUESTRA_DIRECCION: estudio.MUESTRA_DIRECCION || '',
        MUESTRA_NUMERO_EXT: estudio.MUESTRA_NUMERO_EXT || '',
        MUESTRA_NUMERO_INT: estudio.MUESTRA_NUMERO_INT || '',
        MUESTRA_COLONIA: estudio.MUESTRA_COLONIA || '',
        MUESTRA_MUNICIPIO: estudio.MUESTRA_MUNICIPIO || '',
        MUESTRA_CIUDAD: estudio.MUESTRA_CIUDAD || '',
        MUESTRA_ESTADO: estudio.MUESTRA_ESTADO || '',
        MUESTRA_ENVIO_TIPO: estudio.MUESTRA_ENVIO_TIPO || '',
        MUESTRA_CODIGO_POSTAL: estudio.MUESTRA_CODIGO_POSTAL || '',
        MUESTRA_HORARIOS: estudio.MUESTRA_HORARIOS || '',
        NO_APLICA: estudio.MUESTRA_ENVIO === 'no aplica' ? true : false,
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recolección', href: `/estudios/${estudio.ID}/edit/recoleccion` },
    ], [estudio]);

    // Función para preparar los datos antes de enviar
    const prepareFormData = useCallback((additionalData: any = {}) => {
        const formData = { ...data, ...additionalData };
        
        // Combinar fecha y hora si están presentes
        if (formData.FECHA_SOLICITUD_RECOLECCION && formData.HORA_SOLICITUD_RECOLECCION) {
            formData.FECHA_SOLICITUD_RECOLECCION = formData.FECHA_SOLICITUD_RECOLECCION + ' ' + formData.HORA_SOLICITUD_RECOLECCION + ':00';
            console.log('📅 Fecha combinada:', formData.FECHA_SOLICITUD_RECOLECCION);
        }
        
        return formData;
    }, [data]);

    // Log para monitorear cambios en los datos del formulario
    useEffect(() => {
        console.log('🔄 Datos del formulario actualizados:', data);
    }, [data]);

    // Log inicial al cargar el componente
    useEffect(() => {
        console.log('🎬 Componente recolección cargado');
        console.log('📋 Estudio inicial:', estudio);
        console.log('📝 Datos iniciales del formulario:', data);
        console.log('🔧 Processing inicial:', processing);
    }, []);

    const handleSave = useCallback((e?: React.MouseEvent) => {
        console.log('🔴 handleSave ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form:', data);
        console.log('🔢 ID del estudio:', estudio.ID);
        
        const formData = prepareFormData();
        console.log('📤 Datos a enviar:', formData);
        console.log('🎯 URL de patch:', `/estudios/${estudio.ID}/recoleccion`);
        
        router.patch(`/estudios/${estudio.ID}/recoleccion`, formData, {
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
    }, [estudio.ID, data, prepareFormData, router]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        console.log('🟡 handleNext ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form (Next):', data);
        console.log('🔢 ID del estudio (Next):', estudio.ID);
        
        const formData = prepareFormData({ _next: 'recepcion' });
        console.log('📤 Datos a enviar (Next):', formData);
        console.log('🎯 URL de patch (Next):', `/estudios/${estudio.ID}/recoleccion`);
        
        router.patch(`/estudios/${estudio.ID}/recoleccion`, formData, {
            onSuccess: (response) => {
                console.log('✅ Datos guardados exitosamente (Next)');
                console.log('📥 Respuesta del servidor (Next):', response);
                console.log('🔄 Navegando a recepción...');
                router.visit(`/estudios/${estudio.ID}/edit/recepcion`);
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
    }, [estudio.ID, data, prepareFormData, router]);

    const handleSaveAndExit = useCallback((e?: React.MouseEvent) => {
        console.log('🔵 handleSaveAndExit ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form (Salir):', data);
        console.log('🔢 ID del estudio (Salir):', estudio.ID);
        
        const formData = prepareFormData();
        console.log('📤 Datos a enviar (Salir):', formData);
        console.log('🎯 URL de patch (Salir):', `/estudios/${estudio.ID}/recoleccion`);
        
        router.patch(`/estudios/${estudio.ID}/recoleccion`, formData, {
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
    }, [estudio.ID, data, prepareFormData, router]);

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Recolección`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con clave interna y estado */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-[#189BAF]" />
                                <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                            </div>
                            <Badge className="bg-[#189BAF] text-white">1. Recolección</Badge>
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
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="space-y-6">
                            {/* Información básica */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Clave Interna</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={data.CLAVE_INTERNA}
                                            onChange={(e) => setData('CLAVE_INTERNA', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className={labelClass}>Folio Merck</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={data.FOLIO_MERCK}
                                            onChange={(e) => setData('FOLIO_MERCK', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className={labelClass}>Fecha <small>(dd/mm/aaaa)</small></label>
                                        <input
                                            type="date"
                                            className={inputClass}
                                            value={data.FECHA_SOLICITUD_RECOLECCION}
                                            onChange={(e) => setData('FECHA_SOLICITUD_RECOLECCION', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className={labelClass}>Hora <small>(00:00)</small></label>
                                        <input
                                            type="time"
                                            className={inputClass}
                                            value={data.HORA_SOLICITUD_RECOLECCION}
                                            onChange={(e) => setData('HORA_SOLICITUD_RECOLECCION', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cliente */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    💰 Cliente
                                </h3>
                                
                                <div>
                                    <label className={labelClass}>Cambiar al cliente</label>
                                    <select
                                        className={selectClass}
                                        value={data.ID_CLIENTE}
                                        onChange={(e) => setData('ID_CLIENTE', parseInt(e.target.value))}
                                    >
                                        <option value="">Seleccionar cliente</option>
                                        {clientes.map((cliente) => (
                                            <option key={cliente.ID_CLIENTE} value={cliente.ID_CLIENTE}>
                                                {cliente.CLIENTE_NOMBRE}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Institución */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    🏢 Institución
                                </h3>
                                
                                <div>
                                    <label className={labelClass}>Cambiar la Institución</label>
                                    <select
                                        className={selectClass}
                                        value={data.ID_INSTITUCION}
                                        onChange={(e) => setData('ID_INSTITUCION', parseInt(e.target.value))}
                                    >
                                        <option value="">Seleccionar institución</option>
                                        {instituciones.map((institucion) => (
                                            <option key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION}>
                                                {institucion.INSTITUCION_NOMBRE}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Médico */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    👨‍⚕️ Médico
                                </h3>
                                
                                <div>
                                    <label className={labelClass}>Cambiar Médico</label>
                                    <select
                                        className={selectClass}
                                        value={data.ID_MEDICO}
                                        onChange={(e) => setData('ID_MEDICO', parseInt(e.target.value))}
                                    >
                                        <option value="">Seleccionar médico</option>
                                        {medicos.map((medico) => (
                                            <option key={medico.ID_USUARIO} value={medico.ID_USUARIO}>
                                                {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA - Dirección de Recolección */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    🏢 Dirección de Recolección
                                </h3>
                                
                                {/* Checkbox No Aplica */}
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={data.NO_APLICA}
                                            onChange={(e) => setData('NO_APLICA', e.target.checked)}
                                        />
                                        No aplica
                                    </label>
                                </div>

                                {/* Formulario de dirección - Se oculta si "No aplica" está marcado */}
                                {!data.NO_APLICA && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className={labelClass}>Mensajería <small>(En caso de ya estar disponible)</small></label>
                                            <select
                                                className={selectClass}
                                                value={data.MUESTRA_GUIA_MENSAJERIA}
                                                onChange={(e) => setData('MUESTRA_GUIA_MENSAJERIA', e.target.value)}
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="Fedex">Fedex</option>
                                                <option value="DHL">DHL</option>
                                                <option value="Punto a Punto">Punto a Punto</option>
                                                <option value="Porteo">Porteo</option>
                                                <option value="GOAX">GOAX</option>
                                                <option value="3d">3d</option>
                                                <option value="Soluciones">Soluciones</option>
                                                <option value="Voydevolada">Voydevolada</option>
                                                <option value="Otra">Otra</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>No. de Guía <small>(En caso de ya estar disponible)</small></label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_GUIA}
                                                onChange={(e) => setData('MUESTRA_GUIA', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Referencias</label>
                                            <textarea
                                                className={textareaClass}
                                                rows={4}
                                                value={data.MUESTRA_REFERENCIAS}
                                                onChange={(e) => setData('MUESTRA_REFERENCIAS', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <label className={labelClass}>Dirección</label>
                                                <textarea
                                                    className={textareaClass}
                                                    rows={4}
                                                    value={data.MUESTRA_DIRECCION}
                                                    onChange={(e) => setData('MUESTRA_DIRECCION', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className={labelClass}>Número Exterior</label>
                                                    <input
                                                        type="text"
                                                        className={inputClass}
                                                        value={data.MUESTRA_NUMERO_EXT}
                                                        onChange={(e) => setData('MUESTRA_NUMERO_EXT', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Número Interior</label>
                                                    <input
                                                        type="text"
                                                        className={inputClass}
                                                        value={data.MUESTRA_NUMERO_INT}
                                                        onChange={(e) => setData('MUESTRA_NUMERO_INT', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Colonia</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_COLONIA}
                                                onChange={(e) => setData('MUESTRA_COLONIA', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Municipio</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_MUNICIPIO}
                                                onChange={(e) => setData('MUESTRA_MUNICIPIO', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Localidad (Estado)</label>
                                            <select
                                                className={selectClass}
                                                value={data.MUESTRA_ESTADO}
                                                onChange={(e) => setData('MUESTRA_ESTADO', e.target.value)}
                                            >
                                                <option value="">Selección</option>
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
                                            <label className={labelClass}>Tipo de Envío</label>
                                            <select
                                                className={selectClass}
                                                value={data.MUESTRA_ENVIO_TIPO}
                                                onChange={(e) => setData('MUESTRA_ENVIO_TIPO', e.target.value)}
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="Local">Local</option>
                                                <option value="Nacional">Nacional</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Código Postal</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.MUESTRA_CODIGO_POSTAL}
                                                onChange={(e) => setData('MUESTRA_CODIGO_POSTAL', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Horarios</label>
                                            <textarea
                                                className={textareaClass}
                                                rows={4}
                                                value={data.MUESTRA_HORARIOS}
                                                onChange={(e) => setData('MUESTRA_HORARIOS', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
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