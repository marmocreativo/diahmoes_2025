import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type MedicoOption } from '@/types/folios-kits';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Package, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grupos Folios Kits', href: '/grupos-folios-kits' },
    { title: 'Editar Grupo', href: '#' },
];

interface PageProps {
    grupo: { id: number; nombre: string; id_medico: number | null; fecha_envio: string | null };
    medicos: MedicoOption[];
    [key: string]: any;
}

export default function GruposEdit() {
    const { grupo, medicos } = usePage<PageProps>().props;

    const [form, setForm] = useState({
        nombre:      grupo.nombre,
        id_medico:   grupo.id_medico?.toString() ?? '',
        fecha_envio: grupo.fecha_envio ?? '',
    });
    const [errors, setErrors]     = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = () => {
        setSubmitting(true);
        router.patch(`/grupos-folios-kits/${grupo.id}`, {
            nombre:      form.nombre,
            id_medico:   form.id_medico || null,
            fecha_envio: form.fecha_envio || null,
        }, {
            onError: (errs) => { setErrors(errs); setSubmitting(false); },
            onSuccess: () => setSubmitting(false),
        });
    };

    const inputClass = (field: string) =>
        `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors[field]
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
        }`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Grupo - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
                <div className="bg-gradient-to-r from-[#D68B41] to-[#b8763a] rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                            <Package className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Editar Grupo</h1>
                            <p className="text-white/80 text-sm">{grupo.nombre}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                            className={inputClass('nombre')}
                        />
                        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
                            <select
                                value={form.id_medico}
                                onChange={e => setForm({ ...form, id_medico: e.target.value })}
                                className={inputClass('id_medico')}
                            >
                                <option value="">Sin médico asignado</option>
                                {medicos.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de envío</label>
                            <input
                                type="date"
                                value={form.fecha_envio}
                                onChange={e => setForm({ ...form, fecha_envio: e.target.value })}
                                className={inputClass('fecha_envio')}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button onClick={() => router.get('/grupos-folios-kits')} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !form.nombre}
                        className="px-5 py-2 bg-[#D68B41] hover:bg-[#b8763a] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {submitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}