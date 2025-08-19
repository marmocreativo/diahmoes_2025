import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// Importar formulario de laboratorio
import FormularioLaboratorio from './forms/formulario-laboratorio';

interface EditLaboratorioProps {
    estudio: any;
    [key: string]: any;
}

export default function EditLaboratorio() {
    const { estudio } = usePage<EditLaboratorioProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Laboratorio', href: `/estudios/${estudio.ID}/edit/laboratorio` },
    ];

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({});

    const handleDataChange = (data: any) => {
        setFormData(data);
    };

    const handleSave = () => {
        setProcessing(true);
        router.patch(`/estudios/${estudio.ID}/laboratorio`, formData, {
            onFinish: () => setProcessing(false)
        });
    };

    const handleNext = () => {
        router.visit(`/estudios/${estudio.ID}/edit/informe`);
    };

    const handlePrev = () => {
        router.visit(`/estudios/${estudio.ID}/edit/recepcion`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Laboratorio`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar Estudio - {estudio.CLAVE_INTERNA}
                        </h1>
                        <p className="text-gray-600">Paso 3: Información de Laboratorio</p>
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
                                <Badge variant="outline">1. Recolección</Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Badge variant="outline">2. Recepción</Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Badge className="bg-[#189BAF] text-white">3. Laboratorio</Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Badge variant="outline">4. Informe</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulario */}
                <FormularioLaboratorio
                    estudio={estudio}
                    onDataChange={handleDataChange}
                />

                {/* Botones de navegación */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <Button
                                    variant="outline"
                                    onClick={handlePrev}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Anterior: Recepción
                                </Button>
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
                                >
                                    Siguiente: Informe
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