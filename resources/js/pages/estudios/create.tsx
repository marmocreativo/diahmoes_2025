import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { type BreadcrumbItem, type EstudioCreateProps, type EstudioFormData } from '@/types';

// Importar componente principal
import FormularioCompleto from './create/formulario-completo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Estudios', href: '/estudios' },
    { title: 'Crear Estudio', href: '/estudios/create' },
];


export default function CrearEstudio() {
    const { medicos, pacientes, instituciones, clientes, mensajerias, tiposMuestra, tiposEstudio, generos, tiposEnvio, datosAutomaticos } = 
        usePage<EstudioCreateProps>().props;

    // Estado local para formulario (rápido, sin re-renders de Inertia)
    const [localData, setLocalData] = useState<EstudioFormData>({
        // Datos automáticos del backend
        ...datosAutomaticos,
        
        // Campos requeridos
        FolioMerck: '',
        FechaSolicitudRecoleccion: new Date().toISOString().split('T')[0],
        HoraSolicitudRecoleccion: new Date().toTimeString().slice(0, 5),
        IdCliente: 0,
        IdMedico: 0,
        IdInstitucion: 0,
        
        // Campos opcionales con valores por defecto
        UsuarioTipo: 'medico',
        PassUsuario: '135DIAHMOES',
        NoAplica: false,
        
        // Resto de campos opcionales
        NombreCliente: '',
        CorreoCliente: '',
        EnviarCorreoCliente: false,
        NombreUsuario: '',
        ApellidosUsuario: '',
        CorreoUsuario: '',
        TelefonoUsuario: '',
        NombreInstitucion: '',
        CorreoInstitucion: '',
        TelefonoInstitucion: '',
        MuestraGuiaMensajeria: 'ninguna',
        MuestraGuia: '',
        MuestraDirigirse: '',
        MuestraPreguntar: '',
        MuestraDireccion: '',
        MuestraNumeroExt: '',
        MuestraNumeroInt: '',
        MuestraColonia: '',
        MuestraMunicipio: '',
        MuestraCiudad: '',
        MuestraEstado: 'ninguno',
        MuestraEnvioTipo: 'ninguno',
        MuestraCodigoPostal: '',
        MuestraHorarios: '',
    });

    const { post, processing, errors } = useForm();

    // Función optimizada para manejar cambios (solo actualiza estado local)
    const handleDataChange = (key: string, value: any) => {
        setLocalData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent, guardar: string) => {
        e.preventDefault();
        
        // Crear datos temporales con el valor de Guardar
        const submitData = {
            ...localData,
            Guardar: guardar
        };
        
        // Usar router.post para enviar con datos personalizados
        router.post('/estudios', submitData, {
            onSuccess: () => {
                // Manejar éxito si es necesario
            },
            onError: () => {
                // Los errores se manejan automáticamente por Inertia
            }
        });
    };

    const handleCancel = () => {
        router.visit('/estudios');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Expediente - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Nuevo Expediente</h1>
                        <p className="text-gray-600">Complete la información del estudio</p>
                    </div>
                    <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                </div>

                {/* Mostrar errores de validación si existen */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Por favor, corrija los siguientes errores:</h4>
                            <ul className="list-disc list-inside text-red-700">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{String(message)}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Formulario Principal */}
                <form>
                    <FormularioCompleto
                        data={localData}
                        setData={handleDataChange}
                        errors={errors}
                        medicos={medicos}
                        pacientes={pacientes}
                        instituciones={instituciones}
                        clientes={clientes}
                        mensajerias={mensajerias}
                        tiposMuestra={tiposMuestra}
                        tiposEstudio={tiposEstudio}
                        generos={generos}
                        tiposEnvio={tiposEnvio}
                    />

                    {/* Botones de acción - formulario simple */}
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
            </div>
        </AppLayout>
    );
}