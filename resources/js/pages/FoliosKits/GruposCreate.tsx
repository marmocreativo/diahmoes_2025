import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type MedicoOption } from '@/types/folios-kits';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { Package, Plus, Trash2, Wand2, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grupos Folios Kits', href: '/grupos-folios-kits' },
    { title: 'Nuevo Grupo', href: '/grupos-folios-kits/create' },
];

interface PageProps {
    medicos: MedicoOption[];
    [key: string]: any;
}

interface FilaFolio {
    uid: number;
    folio: string;
    fecha_caducidad: string;
    seleccionado: boolean;
}

let uidCounter = 0;
const nuevaFila = (folio = '', fecha = ''): FilaFolio => ({
    uid: ++uidCounter,
    folio,
    fecha_caducidad: fecha,
    seleccionado: false,
});

const anioActual = new Date().getFullYear().toString().slice(-2);

export default function GruposCreate() {
    const { medicos } = usePage<PageProps>().props;

    // Datos del grupo
    const [form, setForm] = useState({
        nombre: '',
        id_medico: '',
        fecha_envio: '',
    });

    // Tabla de folios
    const [filas, setFilas] = useState<FilaFolio[]>([nuevaFila()]);

    // Herramienta generador
    const [generador, setGenerador] = useState({
        desde: '',
        hasta: '',
        digitos: '3',
        anio: anioActual,
        fecha_caducidad: '',
    });
    const [generadorAbierto, setGeneradorAbierto] = useState(true);

    // Fecha global
    const [fechaGlobal, setFechaGlobal] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Preview del generador
    const previewGenerador = () => {
        const desde = parseInt(generador.desde);
        const hasta = parseInt(generador.hasta);
        const dig   = parseInt(generador.digitos);
        if (isNaN(desde) || isNaN(hasta) || desde > hasta) return null;
        const total = hasta - desde + 1;
        const primero = `GL-${String(desde).padStart(dig, '0')}-${generador.anio}`;
        const ultimo  = `GL-${String(hasta).padStart(dig, '0')}-${generador.anio}`;
        return { primero, ultimo, total };
    };

    const handleGenerar = () => {
        const desde = parseInt(generador.desde);
        const hasta = parseInt(generador.hasta);
        const dig   = parseInt(generador.digitos);
        if (isNaN(desde) || isNaN(hasta) || desde > hasta) return;

        const nuevas: FilaFolio[] = [];
        for (let i = desde; i <= hasta; i++) {
            nuevas.push(nuevaFila(
                `GL-${String(i).padStart(dig, '0')}-${generador.anio}`,
                generador.fecha_caducidad
            ));
        }

        // Reemplazar filas vacías, agregar al final si ya hay datos
        setFilas(prev => {
            const conDatos = prev.filter(f => f.folio.trim() !== '');
            return [...conDatos, ...nuevas];
        });
    };

    const handleAplicarFechaGlobal = () => {
        if (!fechaGlobal) return;
        setFilas(prev => prev.map(f => ({ ...f, fecha_caducidad: fechaGlobal })));
    };

    const handleAplicarFechaSeleccionados = () => {
        if (!fechaGlobal) return;
        setFilas(prev => prev.map(f =>
            f.seleccionado ? { ...f, fecha_caducidad: fechaGlobal } : f
        ));
    };

    const updateFila = (uid: number, campo: keyof FilaFolio, valor: string | boolean) => {
        setFilas(prev => prev.map(f => f.uid === uid ? { ...f, [campo]: valor } : f));
    };

    const eliminarFila = (uid: number) => {
        setFilas(prev => {
            const nuevas = prev.filter(f => f.uid !== uid);
            return nuevas.length === 0 ? [nuevaFila()] : nuevas;
        });
    };

    const toggleSeleccionTodos = () => {
        const todosSeleccionados = filas.every(f => f.seleccionado);
        setFilas(prev => prev.map(f => ({ ...f, seleccionado: !todosSeleccionados })));
    };

    const eliminarSeleccionados = () => {
        setFilas(prev => {
            const restantes = prev.filter(f => !f.seleccionado);
            return restantes.length === 0 ? [nuevaFila()] : restantes;
        });
    };

    const haySeleccionados = filas.some(f => f.seleccionado);
    const preview = previewGenerador();

    const handleSubmit = () => {
        const foliosValidos = filas.filter(f => f.folio.trim() !== '');
        if (!form.nombre) {
            setErrors({ nombre: 'El nombre es requerido.' });
            return;
        }

        setSubmitting(true);
        router.post('/grupos-folios-kits', {
            ...form,
            id_medico:   form.id_medico || null,
            fecha_envio: form.fecha_envio || null,
            folios: foliosValidos.map(f => ({
                folio:           f.folio.trim(),
                fecha_caducidad: f.fecha_caducidad || null,
            })),
        }, {
            onError: (errs) => { setErrors(errs); setSubmitting(false); },
            onSuccess: () => setSubmitting(false),
        });
    };

    const inputClass = (field = '') =>
        `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors[field]
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
        }`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Grupo de Folios - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                            <Package className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Nuevo Grupo de Folios</h1>
                            <p className="text-white/80 text-sm">Genera y administra folios GL con fechas de caducidad</p>
                        </div>
                    </div>
                </div>

                {/* Datos del grupo */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700 border-b pb-2">Datos del grupo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                className={inputClass('nombre')}
                                placeholder="Ej. Lote Enero 2026"
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
                            <select
                                value={form.id_medico}
                                onChange={e => setForm({ ...form, id_medico: e.target.value })}
                                className={inputClass()}
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
                                className={inputClass()}
                            />
                        </div>
                    </div>
                </div>

                {/* Generador de serie */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => setGeneradorAbierto(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-[#189BAF]" />
                            <span className="text-sm font-semibold text-gray-700">Generador de serie</span>
                        </div>
                        {generadorAbierto ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>

                    {generadorAbierto && (
                        <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Desde (nº)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={generador.desde}
                                        onChange={e => setGenerador({ ...generador, desde: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Hasta (nº)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={generador.hasta}
                                        onChange={e => setGenerador({ ...generador, hasta: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                        placeholder="50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Dígitos</label>
                                    <select
                                        value={generador.digitos}
                                        onChange={e => setGenerador({ ...generador, digitos: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none"
                                    >
                                        <option value="2">2 — GL-01-26</option>
                                        <option value="3">3 — GL-001-26</option>
                                        <option value="4">4 — GL-0001-26</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Año</label>
                                    <input
                                        type="text"
                                        maxLength={2}
                                        value={generador.anio}
                                        onChange={e => setGenerador({ ...generador, anio: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                        placeholder="26"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Caducidad del lote</label>
                                    <input
                                        type="date"
                                        value={generador.fecha_caducidad}
                                        onChange={e => setGenerador({ ...generador, fecha_caducidad: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {preview && (
                                <div className="flex items-center gap-3 bg-[#189BAF]/5 border border-[#189BAF]/20 rounded-lg px-4 py-2.5 text-sm">
                                    <Wand2 className="h-4 w-4 text-[#189BAF] shrink-0" />
                                    <span className="text-gray-600">
                                        Se generarán <span className="font-bold text-[#189BAF]">{preview.total}</span> folios:
                                        <span className="font-mono ml-2 text-gray-800">{preview.primero}</span>
                                        <span className="mx-2 text-gray-400">→</span>
                                        <span className="font-mono text-gray-800">{preview.ultimo}</span>
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleGenerar}
                                disabled={!preview}
                                className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Wand2 className="h-4 w-4" />
                                Generar folios
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabla de folios */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Toolbar de la tabla */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">
                                Folios
                            </span>
                            <span className="bg-[#189BAF]/10 text-[#189BAF] text-xs font-bold px-2 py-0.5 rounded-full">
                                {filas.filter(f => f.folio.trim() !== '').length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Aplicar fecha global */}
                            <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={fechaGlobal}
                                    onChange={e => setFechaGlobal(e.target.value)}
                                    className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-[#189BAF] focus:outline-none"
                                />
                                <button
                                    onClick={handleAplicarFechaGlobal}
                                    disabled={!fechaGlobal}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded transition-colors disabled:opacity-40"
                                >
                                    Aplicar a todos
                                </button>
                                {haySeleccionados && (
                                    <button
                                        onClick={handleAplicarFechaSeleccionados}
                                        disabled={!fechaGlobal}
                                        className="text-xs bg-[#189BAF]/10 hover:bg-[#189BAF]/20 text-[#189BAF] px-2.5 py-1 rounded transition-colors disabled:opacity-40"
                                    >
                                        Aplicar a seleccionados
                                    </button>
                                )}
                            </div>

                            {haySeleccionados && (
                                <button
                                    onClick={eliminarSeleccionados}
                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Eliminar seleccionados
                                </button>
                            )}

                            <button
                                onClick={() => setFilas(prev => [...prev, nuevaFila()])}
                                className="text-xs bg-[#189BAF] hover:bg-[#157a8c] text-white px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" />
                                Agregar fila
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2 w-8">
                                        <input
                                            type="checkbox"
                                            checked={filas.length > 0 && filas.every(f => f.seleccionado)}
                                            onChange={toggleSeleccionTodos}
                                            className="rounded border-gray-300 text-[#189BAF] focus:ring-[#189BAF]"
                                        />
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-8">#</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha caducidad</th>
                                    <th className="px-3 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filas.map((fila, index) => (
                                    <tr
                                        key={fila.uid}
                                        className={`hover:bg-gray-50 transition-colors ${fila.seleccionado ? 'bg-[#189BAF]/5' : ''}`}
                                    >
                                        <td className="px-3 py-1.5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={fila.seleccionado}
                                                onChange={e => updateFila(fila.uid, 'seleccionado', e.target.checked)}
                                                className="rounded border-gray-300 text-[#189BAF] focus:ring-[#189BAF]"
                                            />
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-400 w-8 select-none">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <input
                                                type="text"
                                                value={fila.folio}
                                                onChange={e => updateFila(fila.uid, 'folio', e.target.value)}
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm font-mono focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF] bg-transparent"
                                                placeholder="GL-000-26"
                                            />
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <input
                                                type="date"
                                                value={fila.fecha_caducidad}
                                                onChange={e => updateFila(fila.uid, 'fecha_caducidad', e.target.value)}
                                                className="rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF] bg-transparent"
                                            />
                                        </td>
                                        <td className="px-3 py-1.5 text-center">
                                            <button
                                                onClick={() => eliminarFila(fila.uid)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                title="Eliminar fila"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filas.filter(f => f.folio.trim() !== '').length === 0 && (
                        <div className="py-8 text-center text-gray-400 text-sm border-t border-gray-100">
                            Usa el generador de serie o agrega filas manualmente
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {filas.filter(f => f.folio.trim() !== '').length} folio(s) listos para guardar
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.get('/grupos-folios-kits')}
                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !form.nombre}
                            className="px-5 py-2 bg-[#189BAF] hover:bg-[#157a8c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {submitting ? 'Guardando...' : 'Crear Grupo'}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}