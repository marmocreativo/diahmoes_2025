import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, Calendar, FileText, TestTube, Microscope, Edit, Trash2,
    Mail, User, Building2, MapPin, Clock
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { type EstudioPrvShowProps } from '@/types/estudios-prv';

// SIMPLIFICACIÓN: esta vista es un resumen básico del estudio + accesos
// directos al wizard de 4 pasos. No incluye PDF/impresión/WhatsApp (no
// implementados todavía para PRV) ni el detalle de resultados de
// laboratorio (pantalla laboratorio.tsx sigue siendo mock).

export default function ShowEstudioPrv() {
    const { estudio } = usePage<EstudioPrvShowProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios PRV', href: '/estudios-prv' },
        { title: estudio.CLAVE_INTERNA, href: `/estudios-prv/${estudio.ID}` },
    ];

    const getEstadoClasses = (estado: string | undefined) => {
        switch (estado) {
            case 'Solicitud Recolección':
                return 'bg-orange-50 text-orange-800 border-orange-200';
            case 'Recepción Laboratorio':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'Retorno Material':
                return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'Terminado':
                return 'bg-green-50 text-green-800 border-green-200';
            case 'Cancelado':
                return 'bg-gray-50 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    const formatearFecha = (fechaString?: string | null) => {
        if (!fechaString || fechaString === '0000-00-00 00:00:00') return 'N/A';
        try {
            const fecha = fechaString.split('T')[0];
            return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    const handleDelete = () => {
        if (!window.confirm(`¿Eliminar el estudio ${estudio.CLAVE_INTERNA}? Esta acción no se puede deshacer.`)) return;
        router.delete(`/estudios-prv/${estudio.ID}`);
    };

    const pasos = [
        { href: 'recoleccion', label: '1. Recolección', icon: <Calendar className="h-4 w-4" /> },
        { href: 'recepcion', label: '2. Recepción', icon: <FileText className="h-4 w-4" /> },
        { href: 'laboratorio', label: '3. Laboratorio', icon: <TestTube className="h-4 w-4" /> },
        { href: 'informe', label: '4. Informe', icon: <Microscope className="h-4 w-4" /> },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${estudio.CLAVE_INTERNA} - DIAHMOES`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-gray-800 font-mono">{estudio.CLAVE_INTERNA}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoClasses(estudio.ESTUDIO_ESTADO)}`}>
                                    {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                                </span>
                            </div>
                            {estudio.FOLIO_MERCK && (
                                <p className="text-sm text-gray-500">Folio: {estudio.FOLIO_MERCK}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/estudios-prv">
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar estudio"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Accesos al wizard */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Editar por paso</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {pasos.map(paso => (
                            <Link
                                key={paso.href}
                                href={`/estudios-prv/${estudio.ID}/edit/${paso.href}`}
                                className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-[#189BAF] hover:bg-[#189BAF]/5 transition-colors text-sm font-medium text-gray-700"
                            >
                                {paso.icon}
                                {paso.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Médico / Institución / Paciente */}
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <h3 className="text-lg font-semibold mb-2">Información General</h3>

                        {estudio.medico && (
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-[#189BAF] mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Médico</div>
                                    <div className="text-sm font-medium text-gray-800">
                                        {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                                    </div>
                                    {estudio.medico.USUARIO_CORREO && (
                                        <div className="text-xs text-gray-500">{estudio.medico.USUARIO_CORREO}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {estudio.institucion && (
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-[#189BAF] mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Institución</div>
                                    <div className="text-sm font-medium text-gray-800">{estudio.institucion.INSTITUCION_NOMBRE}</div>
                                </div>
                            </div>
                        )}

                        {estudio.paciente && (
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-[#D68B41] mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Paciente</div>
                                    <div className="text-sm font-medium text-gray-800">
                                        {estudio.paciente.USUARIO_NOMBRE} {estudio.paciente.USUARIO_APELLIDOS}
                                    </div>
                                    {estudio.MUESTRA_INICIALES && (
                                        <div className="text-xs text-gray-500">Iniciales: {estudio.MUESTRA_INICIALES}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {estudio.MUESTRA_TIPO_ESTUDIO && (
                            <div className="flex items-start gap-3">
                                <TestTube className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Estudio</div>
                                    <Badge className="bg-blue-50 text-blue-800 border border-blue-200 mt-1">
                                        {estudio.MUESTRA_TIPO_ESTUDIO}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {estudio.MUESTRA_DIRECCION && (
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Dirección de Recolección</div>
                                    <div className="text-sm text-gray-800">
                                        {estudio.MUESTRA_DIRECCION} {estudio.MUESTRA_NUMERO_EXT}
                                        {estudio.MUESTRA_NUMERO_INT ? ` Int. ${estudio.MUESTRA_NUMERO_INT}` : ''}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {[estudio.MUESTRA_COLONIA, estudio.MUESTRA_MUNICIPIO, estudio.MUESTRA_CIUDAD, estudio.MUESTRA_ESTADO]
                                            .filter(Boolean).join(', ')}
                                        {estudio.MUESTRA_CODIGO_POSTAL ? ` — CP ${estudio.MUESTRA_CODIGO_POSTAL}` : ''}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fechas del proceso */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-[#189BAF]" /> Fechas del Proceso
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Solicitud de Recolección', fecha: estudio.FECHA_SOLICITUD_RECOLECCION },
                                { label: 'Recolección', fecha: estudio.FECHA_RECOLECCION },
                                { label: 'Recepción', fecha: estudio.FECHA_RECEPCION },
                                { label: 'Recepción en Laboratorio', fecha: estudio.FECHA_RECEPCION_LABORATORIO },
                                { label: 'Obtención de Resultados', fecha: estudio.FECHA_OBTENCION_RESULTADOS },
                                { label: 'Informe Enviado', fecha: estudio.FECHA_RESULTADOS_CORREO },
                            ].map((item, i) => {
                                const tieneValor = item.fecha && item.fecha !== '0000-00-00 00:00:00';
                                return (
                                    <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-md ${tieneValor ? 'bg-gray-50' : 'opacity-50'}`}>
                                        <span className="text-sm text-gray-700">{item.label}</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {tieneValor ? formatearFecha(item.fecha) : 'Pendiente'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Notas */}
                {estudio.ESTUDIO_NOTAS && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-2">Notas</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{estudio.ESTUDIO_NOTAS}</p>
                    </div>
                )}

                {/* Acceso rápido a informe */}
                <div className="flex justify-end gap-3">
                    <a href={`/estudios-prv/${estudio.ID}/pdf`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            Ver PDF
                        </Button>
                    </a>
                    <Link href={`/estudios-prv/${estudio.ID}/edit/informe`}>
                        <Button className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                            <Mail className="h-4 w-4 mr-2" />
                            Ver Informe y Envíos
                        </Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}