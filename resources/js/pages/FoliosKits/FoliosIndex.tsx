import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type FoliosIndexProps } from '@/types/folios-kits';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Tag, ChevronsUpDown, ArrowUp, ArrowDown, Edit, X, Check, Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grupos Folios Kits', href: '/grupos-folios-kits' },
    { title: 'Todos los Folios', href: '/folios-kits' },
];

interface PageProps extends FoliosIndexProps { [key: string]: any; }

const ESTADO_STYLES: Record<string, string> = {
    en_inventario: 'bg-gray-100 text-gray-700',
    enviado:       'bg-blue-100 text-blue-800',
    retornado:     'bg-green-100 text-green-800',
    caducado:      'bg-red-100 text-red-800',
};

interface EditForm {
    folio:           string;
    estado:          string;
    id_grupo:        string;
    fecha_caducidad: string;
}

export default function FoliosIndex() {
    const { folios, grupos, filters, estados } = usePage<PageProps>().props;

    const [search, setSearch]   = useState(filters?.search || '');
    const [estado, setEstado]   = useState(filters?.estado || '');
    const [idGrupo, setIdGrupo] = useState(filters?.id_grupo || '');

    // Edición inline
    const [editingId, setEditingId]   = useState<number | null>(null);
    const [editForm, setEditForm]     = useState<EditForm>({ folio: '', estado: '', id_grupo: '', fecha_caducidad: '' });
    const [saving, setSaving]         = useState(false);
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    const handleSearch = () => {
        router.get('/folios-kits', { search, estado, id_grupo: idGrupo }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch(''); setEstado(''); setIdGrupo('');
        router.get('/folios-kits', {}, { preserveState: true, replace: true });
    };

    const handleSort = (field: string) => {
        const direction = filters?.sort === field && filters?.direction === 'asc' ? 'desc' : 'asc';
        router.get('/folios-kits', { ...filters, sort: field, direction }, { preserveState: true, replace: true });
    };

    const getSortIcon = (field: string) => {
        if (filters?.sort !== field) return <ChevronsUpDown className="h-4 w-4" />;
        return filters.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const startEdit = (folio: any) => {
        setEditingId(folio.id);
        setEditErrors({});
        setEditForm({
            folio:           folio.folio,
            estado:          folio.estado,
            id_grupo:        folio.id_grupo?.toString() ?? '',
            fecha_caducidad: folio.fecha_caducidad ?? '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditErrors({});
    };

    const saveEdit = (id: number) => {
        setSaving(true);
        setEditErrors({});
        router.patch(`/folios-kits/${id}`, {
            folio:           editForm.folio,
            estado:          editForm.estado,
            id_grupo:        editForm.id_grupo || null,
            fecha_caducidad: editForm.fecha_caducidad || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setSaving(false);
            },
            onError: (errs) => {
                setEditErrors(errs);
                setSaving(false);
            },
        });
    };

    const handleDelete = (id: number, folio: string) => {
        if (confirm(`¿Eliminar el folio "${folio}"?`)) {
            router.delete(`/folios-kits/${id}`, { preserveState: true });
        }
    };

    const inputEdit = (field: string) =>
        `rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 w-full ${
            editErrors[field]
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
        }`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Folios Kits - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Folios Kits</h1>
                            <p className="text-white/90">Consulta y gestiona folios individuales</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <Tag className="h-8 w-8 text-white" />
                            </div>
                            <Link href="/grupos-folios-kits" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm">
                                Ver grupos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['enviado', 'retornado', 'caducado'] as const).map(e => (
                        <button
                            key={e}
                            onClick={() => { setEstado(prev => prev === e ? '' : e); }}
                            className={`bg-white rounded-xl p-4 shadow border text-left transition-all ${estado === e ? 'ring-2 ring-[#189BAF]' : 'border-gray-100 hover:shadow-md'}`}
                        >
                            <p className="text-xs text-gray-500 capitalize">{e}</p>
                            <p className="text-2xl font-bold mt-1">
                                {folios?.data?.filter(f => f.estado === e).length ?? 0}
                                <span className="text-xs font-normal text-gray-400 ml-1">en página</span>
                            </p>
                        </button>
                    ))}
                    <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-[#189BAF] mt-1">{folios?.meta?.total ?? 0}</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar folio</label>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder="Número de folio, clave..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select
                                value={estado}
                                onChange={e => setEstado(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none"
                            >
                                <option value="">Todos los estados</option>
                                {estados.map(e => (
                                    <option key={e} value={e} className="capitalize">{e}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
                            <select
                                value={idGrupo}
                                onChange={e => setIdGrupo(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none"
                            >
                                <option value="">Todos los grupos</option>
                                {grupos.map(g => (
                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button onClick={handleSearch} className="flex-1 bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Buscar
                            </button>
                            <button onClick={clearFilters} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th onClick={() => handleSort('folio')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        <div className="flex items-center gap-1"><span>Folio</span>{getSortIcon('folio')}</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudio</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th onClick={() => handleSort('fecha_caducidad')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        <div className="flex items-center gap-1"><span>Caducidad</span>{getSortIcon('fecha_caducidad')}</div>
                                    </th>
                                    <th onClick={() => handleSort('created_at')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        <div className="flex items-center gap-1"><span>Creado</span>{getSortIcon('created_at')}</div>
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {folios?.data?.map(folio => {
                                    const isEditing = editingId === folio.id;

                                    if (isEditing) {
                                        return (
                                            <tr key={folio.id} className="bg-[#189BAF]/5 border-l-2 border-[#189BAF]">
                                                {/* Folio editable */}
                                                <td className="px-4 py-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={editForm.folio}
                                                        onChange={e => setEditForm({ ...editForm, folio: e.target.value })}
                                                        className={`${inputEdit('folio')} font-mono w-36`}
                                                    />
                                                    {editErrors.folio && (
                                                        <p className="text-red-500 text-xs mt-0.5">{editErrors.folio}</p>
                                                    )}
                                                </td>
                                                {/* Grupo editable */}
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={editForm.id_grupo}
                                                        onChange={e => setEditForm({ ...editForm, id_grupo: e.target.value })}
                                                        className={inputEdit('id_grupo')}
                                                    >
                                                        <option value="">Sin grupo</option>
                                                        {grupos.map(g => (
                                                            <option key={g.id} value={g.id}>{g.nombre}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/* Estudio — solo lectura en edición */}
                                                <td className="px-4 py-2 text-xs text-gray-400 italic">
                                                    {folio.estudio?.clave_interna ?? '—'}
                                                </td>
                                                {/* Estado editable */}
                                                <td className="px-4 py-2 text-center">
                                                    <select
                                                        value={editForm.estado}
                                                        onChange={e => setEditForm({ ...editForm, estado: e.target.value })}
                                                        className={`${inputEdit('estado')} w-28 mx-auto`}
                                                    >
                                                        {estados.map(e => (
                                                            <option key={e} value={e} className="capitalize">{e}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/* Fecha caducidad editable */}
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        value={editForm.fecha_caducidad}
                                                        onChange={e => setEditForm({ ...editForm, fecha_caducidad: e.target.value })}
                                                        className={inputEdit('fecha_caducidad')}
                                                    />
                                                </td>
                                                {/* Creado — no editable */}
                                                <td className="px-4 py-2 text-xs text-gray-400">
                                                    {folio.created_at ?? '—'}
                                                </td>
                                                {/* Botones guardar/cancelar */}
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => saveEdit(folio.id)}
                                                            disabled={saving}
                                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                                                        >
                                                            {saving
                                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                : <Check className="h-3 w-3" />
                                                            }
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            disabled={saving}
                                                            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-medium transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // Fila normal (solo lectura)
                                    return (
                                        <tr key={folio.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="font-mono text-sm font-medium text-gray-900">{folio.folio}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {folio.grupo
                                                    ? <Link href={`/grupos-folios-kits/${folio.grupo.id}`} className="text-[#189BAF] hover:underline">{folio.grupo.nombre}</Link>
                                                    : <span className="text-gray-400 text-xs">Sin grupo</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {folio.estudio
                                                    ? <Link href={`/estudios/${folio.estudio.id}`} className="text-[#D68B41] hover:underline font-mono text-xs">{folio.estudio.clave_interna}</Link>
                                                    : <span className="text-gray-400 text-xs">Sin estudio</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${ESTADO_STYLES[folio.estado] ?? 'bg-gray-100 text-gray-800'}`}>
                                                    {folio.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(folio as any).fecha_caducidad
                                                    ? <span className="font-mono text-xs">{(folio as any).fecha_caducidad}</span>
                                                    : <span className="text-gray-300 text-xs">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {folio.created_at ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => startEdit(folio)}
                                                        className="text-[#189BAF] hover:text-[#157a8c] transition-colors p-1.5 rounded hover:bg-[#189BAF]/10"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(folio.id, folio.folio)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {folios?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Mostrando {folios?.meta?.from || 0} - {folios?.meta?.to || 0} de {folios?.meta?.total || 0}
                                </p>
                                <div className="flex items-center space-x-2">
                                    {folios.links.map((link: any, i: number) => (
                                        <button key={i} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${link.active ? 'bg-[#189BAF] text-white' : link.url ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {folios?.data?.length === 0 && (
                        <div className="p-12 text-center">
                            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron folios</h3>
                            <p className="text-gray-500 mb-4">Prueba con otros filtros o crea un grupo con folios.</p>
                            <button onClick={clearFilters} className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium">
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}