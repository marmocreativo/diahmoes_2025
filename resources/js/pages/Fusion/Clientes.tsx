import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { GitMerge, Search, AlertTriangle, CheckCircle, X, Loader2, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clientes', href: '/clientes' },
    { title: 'Fusionar Duplicados', href: '/fusion/clientes' },
];

interface ClienteResumen {
    id: number;
    nombre: string;
    correo: string | null;
    envia_correo: boolean;
    total_estudios: number;
}

interface GrupoSugerido {
    criterio: string;
    clientes: ClienteResumen[];
}

interface Props {
    sugerencias: GrupoSugerido[];
    [key: string]: any;
}

export default function FusionClientes({ sugerencias }: Props) {
    const [grupoActivo, setGrupoActivo] = useState<ClienteResumen[]>([]);
    const [maestroId, setMaestroId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ClienteResumen[]>([]);
    const [searching, setSearching] = useState(false);

    const [preview, setPreview] = useState<Record<string, number> | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [fusionando, setFusionando] = useState(false);

    const buscarClientes = async () => {
        if (!searchTerm.trim()) return;
        setSearching(true);
        try {
            const response = await fetch(`/fusion/clientes/buscar?q=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            alert('Error buscando clientes');
        } finally {
            setSearching(false);
        }
    };

    const agregarAGrupo = (cliente: ClienteResumen) => {
        if (grupoActivo.some(c => c.id === cliente.id)) return;
        setGrupoActivo(prev => [...prev, cliente]);
        setPreview(null);
    };

    const quitarDeGrupo = (id: number) => {
        setGrupoActivo(prev => prev.filter(c => c.id !== id));
        if (maestroId === id) setMaestroId(null);
        setPreview(null);
    };

    const seleccionarGrupoSugerido = (clientes: ClienteResumen[]) => {
        setGrupoActivo(clientes);
        const conMasEstudios = [...clientes].sort((a, b) => b.total_estudios - a.total_estudios)[0];
        setMaestroId(conMasEstudios.id);
        setPreview(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cargarPreview = async () => {
        if (!maestroId || grupoActivo.length < 2) return;

        const duplicadosIds = grupoActivo.filter(c => c.id !== maestroId).map(c => c.id);

        setLoadingPreview(true);
        try {
            const response = await fetch('/fusion/clientes/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ maestro_id: maestroId, duplicados_ids: duplicadosIds })
            });
            const data = await response.json();
            setPreview(data.preview);
        } catch (error) {
            alert('Error obteniendo preview de fusión');
        } finally {
            setLoadingPreview(false);
        }
    };

    const ejecutarFusion = async () => {
        if (!maestroId || grupoActivo.length < 2) return;

        const duplicadosIds = grupoActivo.filter(c => c.id !== maestroId).map(c => c.id);
        const maestro = grupoActivo.find(c => c.id === maestroId);

        const confirmMsg = `¿Fusionar ${duplicadosIds.length} cliente(s) hacia "${maestro?.nombre}"?\n\nEsto reasignará todos los estudios relacionados y ELIMINARÁ permanentemente los duplicados. Esta acción no se puede deshacer.`;

        if (!window.confirm(confirmMsg)) return;

        setFusionando(true);
        try {
            const response = await fetch('/fusion/clientes/fusionar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ maestro_id: maestroId, duplicados_ids: duplicadosIds })
            });
            const data = await response.json();

            if (data.success) {
                const r = data.reporte;
                alert(`Fusión completada:\n\n• Estudios reasignados: ${r.estudios_reasignados}\n• Clientes eliminados: ${r.clientes_eliminados}`);
                router.visit('/fusion/clientes');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert('Error al fusionar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        } finally {
            setFusionando(false);
        }
    };

    const limpiarGrupo = () => {
        setGrupoActivo([]);
        setMaestroId(null);
        setPreview(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fusionar Clientes - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                            <GitMerge className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Fusionar Clientes Duplicados</h1>
                            <p className="text-white/80 text-sm">Detecta y combina registros duplicados de forma segura</p>
                        </div>
                    </div>
                </div>

                {/* Grupo activo para fusionar */}
                {grupoActivo.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border-2 border-[#189BAF] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Grupo a fusionar ({grupoActivo.length} clientes)
                            </h2>
                            <button
                                onClick={limpiarGrupo}
                                className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
                            >
                                <X className="h-4 w-4" />
                                Limpiar selección
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Selecciona cuál cliente será el <strong>registro maestro</strong> (el que sobrevive). Los demás se eliminarán después de reasignar sus estudios relacionados.
                        </p>

                        <div className="space-y-3">
                            {grupoActivo.map(cliente => (
                                <div
                                    key={cliente.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                                        maestroId === cliente.id
                                            ? 'border-[#189BAF] bg-[#189BAF]/5'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="radio"
                                            name="maestro"
                                            checked={maestroId === cliente.id}
                                            onChange={() => { setMaestroId(cliente.id); setPreview(null); }}
                                            className="h-4 w-4 text-[#189BAF]"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                {cliente.nombre}
                                                {maestroId === cliente.id && (
                                                    <span className="text-xs bg-[#189BAF] text-white px-2 py-0.5 rounded-full">
                                                        MAESTRO
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                                                {cliente.correo && <span>{cliente.correo}</span>}
                                                <span>{cliente.envia_correo ? 'Envía correo' : 'No envía correo'}</span>
                                                <span>{cliente.total_estudios} estudios</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => quitarDeGrupo(cliente.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Quitar del grupo"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Preview */}
                        {maestroId && grupoActivo.length >= 2 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                {!preview ? (
                                    <button
                                        onClick={cargarPreview}
                                        disabled={loadingPreview}
                                        className="flex items-center gap-2 px-4 py-2 border border-[#189BAF] text-[#189BAF] rounded-lg text-sm font-medium hover:bg-[#189BAF]/5 transition-colors disabled:opacity-50"
                                    >
                                        {loadingPreview ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4" />
                                        )}
                                        Ver qué se va a reasignar
                                    </button>
                                ) : (
                                    <div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                            <div className="text-sm font-medium text-yellow-800 mb-2">
                                                Se reasignarán los siguientes registros al maestro:
                                            </div>
                                            <ul className="text-sm text-yellow-700 space-y-1">
                                                <li>• {preview.estudios} estudio(s)</li>
                                            </ul>
                                        </div>

                                        <button
                                            onClick={ejecutarFusion}
                                            disabled={fusionando}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {fusionando ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <GitMerge className="h-4 w-4" />
                                            )}
                                            {fusionando ? 'Fusionando...' : 'Confirmar Fusión (irreversible)'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Búsqueda manual */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5 text-[#189BAF]" />
                        Búsqueda Manual
                    </h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && buscarClientes()}
                            placeholder="Buscar por nombre o correo..."
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                        />
                        <button
                            onClick={buscarClientes}
                            disabled={searching}
                            className="px-4 py-2 bg-[#189BAF] hover:bg-[#157a8c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {searching ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map(cliente => {
                                const yaAgregado = grupoActivo.some(c => c.id === cliente.id);
                                return (
                                    <div
                                        key={cliente.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                                            <div className="text-xs text-gray-500">
                                                {cliente.correo && `${cliente.correo} • `}
                                                {cliente.total_estudios} estudios
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => agregarAGrupo(cliente)}
                                            disabled={yaAgregado}
                                            className="text-xs bg-[#189BAF] text-white px-3 py-1.5 rounded hover:bg-[#157a8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {yaAgregado ? 'Agregado' : 'Agregar al grupo'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sugerencias automáticas */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#D68B41]" />
                        Sugerencias Automáticas ({sugerencias.length})
                    </h2>

                    {sugerencias.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                            <p>No se detectaron clientes duplicados automáticamente.</p>
                            <p className="text-xs mt-1">Puedes usar la búsqueda manual arriba si conoces duplicados específicos.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sugerencias.map((grupo, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {grupo.criterio}
                                        </span>
                                        <button
                                            onClick={() => seleccionarGrupoSugerido(grupo.clientes)}
                                            className="text-xs bg-[#189BAF] text-white px-3 py-1.5 rounded hover:bg-[#157a8c] transition-colors"
                                        >
                                            Revisar y fusionar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {grupo.clientes.map(cliente => (
                                            <div key={cliente.id} className="text-sm bg-gray-50 rounded p-2">
                                                <div className="font-medium text-gray-800">{cliente.nombre}</div>
                                                <div className="text-xs text-gray-500">
                                                    {cliente.correo && `${cliente.correo} • `}
                                                    {cliente.total_estudios} estudios
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}