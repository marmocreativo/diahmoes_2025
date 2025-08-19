import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// Import formulario recolección component (lo crearemos después)
import FormularioRecoleccion from './forms/formulario-recoleccion';

interface EditRecoleccionProps {
    estudio: any; // Tipo completo después
    medicos: any[];
    pacientes: any[];
    instituciones: any[];
    clientes: any[];
    tiposMuestra: Record<string, string>;
    tiposEstudio: Record<string, string>;
    generos: Record<string, string>;
    [key: string]: any;
}

export default function EditRecoleccion() {
    const { estudio, medicos, pacientes, instituciones, clientes, tiposMuestra, tiposEstudio, generos } = 
        usePage<EditRecoleccionProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recolección', href: `/estudios/${estudio.ID}/edit/recoleccion` },
    ];

    const [processing, setProcessing] = useState(false);

    const handleSave = () => {
        setProcessing(true);
        router.patch(`/estudios/${estudio.ID}/recoleccion`, {
            // datos del formulario
        }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                // Permanecer en la misma página después de guardar
            }
        });
    };

    const handleNext = () => {
        setProcessing(true);
        router.patch(`/estudios/${estudio.ID}/recoleccion`, {
            // datos del formulario
            _next: 'recepcion'
        }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                router.visit(`/estudios/${estudio.ID}/edit/recepcion`);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Recolección`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con pasos */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar Estudio - {estudio.CLAVE_INTERNA}
                        </h1>
                        <p className="text-gray-600">Paso 1: Información de Recolección</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/estudios/${estudio.ID}`}>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Estudio
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Indicador de pasos */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Badge className="bg-[#189BAF] text-white">1. Recolección</Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Badge variant="outline">2. Recepción</Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Badge variant="outline">3. Laboratorio</Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Badge variant="outline">4. Informe</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulario */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de Recolección</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Aquí irá el formulario específico de recolección */}
                        <FormularioRecoleccion
                            estudio={estudio}
                            medicos={medicos}
                            instituciones={instituciones}
                            clientes={clientes}
                            onDataChange={() => {}}
                        />
                    </CardContent>
                </Card>

                {/* Botones de navegación */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <Link href="/estudios">
                                    <Button variant="outline">
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Volver a Lista
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleSave}
                                    disabled={processing}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar
                                </Button>
                                <Button
                                    className="bg-[#189BAF] hover:bg-[#157a8c]"
                                    onClick={handleNext}
                                    disabled={processing}
                                >
                                    Siguiente: Recepción
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}