import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Package, ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grupos Folios Kits', href: '/grupos-folios-kits' },
    { title: 'Detalle', href: '#' },
];

const ESTADO_STYLES: Record<string, string> = {
    enviado:   'bg-blue-100 text-blue-800',
    retornado: 'bg-green-100 text-green-800',
    caducado:  'bg-red-100 text-red-800',
};

interface Folio {
    id: number;
    folio: string;
    estado: 'enviado' | 'retornado' | 'caducado';
    id_estudio: number | null;
    estudio: { id: number; clave_interna: string } | null;
}

interface Grupo {
    id: number;
    nombre: string;
    fecha_envio: string | null;
    medico: { id: number; nombre: string } | null;
    folios: Folio[];
    estadisticas: {
        total: number;
        enviados: number;
        retornados: number;
        caducados: number;
    };
}

interface PageProps {
    grupo: Grupo;
    [key: string]: any;
}

const ESTADOS = ['enviado', 'retornado', 'caducado'] as const;

export default function GruposShow() {
    const { grupo } = usePage<PageProps>().props;

    const [editingId, setEditingId]   = useState<number | null>(null);
    const [editEstado, setEditEstado] = useState('');

    const [selectedFolioIds, setSelectedFolioIds] = useState<number[]>([]);
    const [bulkEstado, setBulkEstado]             = useState('');
    const [bulkLoading, setBulkLoading]           = useState(false);

    // Estado para agregar folio rápido
    const [nuevoFolio, setNuevoFolio] = useState('');
    const [addingFolio, setAddingFolio] = useState(false);
    const [errorFolio, setErrorFolio]   = useState('');

    const saveEstado = (folioId: number) => {
        router.patch(`/folios-kits/${folioId}/estado`, { estado: editEstado }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const handleAddFolio = () => {
        const folio = nuevoFolio.trim();
        if (!folio) return;
        setAddingFolio(true);
        setErrorFolio('');

        router.post('/folios-kits', {
            folio,
            id_grupo: grupo.id,
            estado: 'enviado',
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNuevoFolio('');
                setAddingFolio(false);
            },
            onError: (errs) => {
                setErrorFolio(errs.folio ?? 'Error al agregar folio.');
                setAddingFolio(false);
            },
        });
    };

    const handleDelete = (folioId: number, folio: string) => {
        if (confirm(`¿Eliminar el folio "${folio}"?`)) {
            router.delete(`/folios-kits/${folioId}`, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const allFolioIds = grupo.folios.map(f => f.id);
    const allFoliosSelected = allFolioIds.length > 0 && allFolioIds.every(id => selectedFolioIds.includes(id));

    const toggleSelectAll = () => setSelectedFolioIds(allFoliosSelected ? [] : allFolioIds);

    const toggleSelectFolio = (id: number) => setSelectedFolioIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

    const handleBulkEstado = () => {
        if (!bulkEstado || selectedFolioIds.length === 0) return;
        setBulkLoading(true);
        router.post('/folios-kits/bulk-estado', { ids: selectedFolioIds, estado: bulkEstado }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => { setBulkLoading(false); setSelectedFolioIds([]); setBulkEstado(''); },
        });
    };

    const handleBulkDelete = () => {
        if (selectedFolioIds.length === 0) return;
        if (!confirm(`¿Eliminar ${selectedFolioIds.length} folio(s) seleccionados?`)) return;
        setBulkLoading(true);
        router.post('/folios-kits/bulk-destroy', { ids: selectedFolioIds }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => { setBulkLoading(false); setSelectedFolioIds([]); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Grupo: ${grupo.nombre} - DIAHMOES`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                                <Package className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{grupo.nombre}</h1>
                                <div className="flex items-center gap-4 text-white/80 text-sm mt-1">
                                    {grupo.medico && <span>Médico: {grupo.medico.nombre}</span>}
                                    {grupo.fecha_envio && <span>Enviado: {grupo.fecha_envio}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/grupos-folios-kits/${grupo.id}/edit`}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 text-sm"
                            >
                                <Edit className="h-4 w-4" />
                                Editar grupo
                            </Link>
                            <Link
                                href="/grupos-folios-kits"
                                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 text-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: grupo.estadisticas.total, color: 'gray' },
                        { label: 'Enviados', value: grupo.estadisticas.enviados, color: 'blue' },
                        { label: 'Retornados', value: grupo.estadisticas.retornados, color: 'green' },
                        { label: 'Caducados', value: grupo.estadisticas.caducados, color: 'red' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-xl p-5 shadow border border-gray-100">
                            <p className="text-xs text-gray-500">{stat.label}</p>
                            <p className={`text-3xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Agregar folio rápido */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Agregar folio al grupo</h2>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={nuevoFolio}
                            onChange={e => setNuevoFolio(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddFolio()}
                            placeholder="Número de folio..."
                            className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                                errorFolio
                                    ? 'border-red-400 focus:ring-red-400'
                                    : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                            }`}
                        />
                        <button
                            onClick={handleAddFolio}
                            disabled={addingFolio || !nuevoFolio.trim()}
                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {addingFolio ? 'Agregando...' : 'Agregar'}
                        </button>
                    </div>
                    {errorFolio && <p className="text-red-500 text-xs mt-2">{errorFolio}</p>}
                </div>

                {/* Tabla de folios */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-base font-semibold text-gray-800">
                            Folios del grupo
                            <span className="ml-2 text-sm font-normal text-gray-500">({grupo.folios.length})</span>
                        </h2>
                    </div>

                    {selectedFolioIds.length > 0 && (
                    <div className="px-6 py-3 bg-[#189BAF]/10 border-b border-[#189BAF]/20 flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-semibold text-[#189BAF]">
                            {selectedFolioIds.length} folio(s) seleccionados
                        </span>
                        <div className="flex items-center gap-2 ml-auto flex-wrap">
                            <select
                                value={bulkEstado}
                                onChange={e => setBulkEstado(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#189BAF] focus:outline-none"
                            >
                                <option value="">Cambiar estado a...</option>
                                {(['en_inventario', 'enviado', 'retornado', 'caducado'] as const).map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleBulkEstado}
                                disabled={!bulkEstado || bulkLoading}
                                className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Aplicar estado
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkLoading}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Eliminar seleccionados
                            </button>
                        </div>
                    </div>
                )}

                    {grupo.folios.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Este grupo aún no tiene folios.</p>
                            <p className="text-gray-400 text-xs mt-1">Usa el formulario de arriba para agregar el primero.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={allFoliosSelected}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-[#189BAF] focus:ring-[#189BAF]"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudio vinculado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grupo.folios.map(folio => (
                                        <tr key={folio.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFolioIds.includes(folio.id)}
                                                    onChange={() => toggleSelectFolio(folio.id)}
                                                    className="rounded border-gray-300 text-[#189BAF] focus:ring-[#189BAF]"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm font-medium text-gray-900">{folio.folio}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {editingId === folio.id ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <select
                                                            autoFocus
                                                            value={editEstado}
                                                            onChange={e => setEditEstado(e.target.value)}
                                                            className="text-xs border border-[#189BAF] rounded px-1 py-0.5 focus:outline-none"
                                                        >
                                                            {ESTADOS.map(e => (
                                                                <option key={e} value={e} className="capitalize">{e}</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={() => saveEstado(folio.id)} className="text-green-600 hover:text-green-800">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-600">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setEditingId(folio.id); setEditEstado(folio.estado); }}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${ESTADO_STYLES[folio.estado] ?? 'bg-gray-100 text-gray-800'}`}
                                                        title="Click para cambiar estado"
                                                    >
                                                        {folio.estado}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {folio.estudio ? (
                                                    <Link
                                                        href={`/estudios/${folio.estudio.id}`}
                                                        className="text-[#D68B41] hover:underline font-mono text-xs"
                                                    >
                                                        {folio.estudio.clave_interna}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Sin estudio</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDelete(folio.id, folio.folio)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
                                                    title="Eliminar folio"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}