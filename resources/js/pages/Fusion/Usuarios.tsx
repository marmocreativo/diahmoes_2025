import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { GitMerge, Search, AlertTriangle, CheckCircle, X, Loader2, Stethoscope, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/usuarios' },
    { title: 'Fusionar Duplicados', href: '/fusion/usuarios' },
];

interface UsuarioResumen {
    id: number;
    nombre: string;
    correo: string | null;
    telefono: string | null;
    tipo: string;
    institucion: string | null;
    total_estudios_medico: number;
    total_estudios_paciente: number;
}

interface GrupoSugerido {
    criterio: string;
    usuarios: UsuarioResumen[];
}

interface Props {
    sugerencias: GrupoSugerido[];
    tipoActivo: 'medico' | 'paciente';
    [key: string]: any;
}

export default function FusionUsuarios({ sugerencias, tipoActivo }: Props) {
    const [grupoActivo, setGrupoActivo] = useState<UsuarioResumen[]>([]);
    const [maestroId, setMaestroId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UsuarioResumen[]>([]);
    const [searching, setSearching] = useState(false);

    const [preview, setPreview] = useState<Record<string, number> | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [fusionando, setFusionando] = useState(false);

    const cambiarTipo = (tipo: 'medico' | 'paciente') => {
        if (tipo === tipoActivo) return;
        limpiarGrupo();
        setSearchResults([]);
        setSearchTerm('');
        router.get('/fusion/usuarios', { tipo }, { preserveState: false });
    };

    const buscarUsuarios = async () => {
        if (!searchTerm.trim()) return;
        setSearching(true);
        try {
            const response = await fetch(`/fusion/usuarios/buscar?q=${encodeURIComponent(searchTerm)}&tipo=${tipoActivo}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            alert('Error buscando usuarios');
        } finally {
            setSearching(false);
        }
    };

    const agregarAGrupo = (usuario: UsuarioResumen) => {
        if (grupoActivo.some(u => u.id === usuario.id)) return;
        setGrupoActivo(prev => [...prev, usuario]);
        setPreview(null);
    };

    const quitarDeGrupo = (id: number) => {
        setGrupoActivo(prev => prev.filter(u => u.id !== id));
        if (maestroId === id) setMaestroId(null);
        setPreview(null);
    };

    const seleccionarGrupoSugerido = (usuarios: UsuarioResumen[]) => {
        setGrupoActivo(usuarios);
        const conMasEstudios = [...usuarios].sort((a, b) => {
            const totalA = a.total_estudios_medico + a.total_estudios_paciente;
            const totalB = b.total_estudios_medico + b.total_estudios_paciente;
            return totalB - totalA;
        })[0];
        setMaestroId(conMasEstudios.id);
        setPreview(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cargarPreview = async () => {
        if (!maestroId || grupoActivo.length < 2) return;

        const duplicadosIds = grupoActivo.filter(u => u.id !== maestroId).map(u => u.id);

        setLoadingPreview(true);
        try {
            const response = await fetch('/fusion/usuarios/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ maestro_id: maestroId, duplicados_ids: duplicadosIds })
            });
            const data = await response.json();

            if (data.success === false) {
                alert(data.message);
                return;
            }

            setPreview(data.preview);
        } catch (error) {
            alert('Error obteniendo preview de fusión');
        } finally {
            setLoadingPreview(false);
        }
    };

    const ejecutarFusion = async () => {
        if (!maestroId || grupoActivo.length < 2) return;

        const duplicadosIds = grupoActivo.filter(u => u.id !== maestroId).map(u => u.id);
        const maestro = grupoActivo.find(u => u.id === maestroId);

        const confirmMsg = `¿Fusionar ${duplicadosIds.length} usuario(s) hacia "${maestro?.nombre}"?\n\nEsto reasignará todos los estudios, correos y envíos relacionados y ELIMINARÁ permanentemente los duplicados. Esta acción no se puede deshacer.`;

        if (!window.confirm(confirmMsg)) return;

        setFusionando(true);
        try {
            const response = await fetch('/fusion/usuarios/fusionar', {
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
                alert(`Fusión completada:\n\n• Estudios como médico: ${r.estudios_medico_reasignados}\n• Estudios como paciente: ${r.estudios_paciente_reasignados}\n• Correos de copia: ${r.correos_copia_reasignados}\n• Envíos (médico): ${r.envios_medico_reasignados}\n• Envíos (emisor): ${r.envios_emisor_reasignados}\n• Solicitudes cliente: ${r.solicitudes_reasignadas}\n• Usuarios eliminados: ${r.usuarios_eliminados}`);
                router.visit(`/fusion/usuarios?tipo=${tipoActivo}`);
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

    const totalEstudios = (u: UsuarioResumen) => u.total_estudios_medico + u.total_estudios_paciente;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fusionar Usuarios - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                                <GitMerge className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Fusionar Usuarios Duplicados</h1>
                                <p className="text-white/80 text-sm">Detecta y combina médicos o pacientes duplicados</p>
                            </div>
                        </div>

                        {/* Selector de tipo */}
                        <div className="flex items-center bg-white/20 rounded-lg p-1">
                            <button
                                onClick={() => cambiarTipo('medico')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    tipoActivo === 'medico' ? 'bg-white text-[#189BAF]' : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <Stethoscope className="h-4 w-4" />
                                Médicos
                            </button>
                            <button
                                onClick={() => cambiarTipo('paciente')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    tipoActivo === 'paciente' ? 'bg-white text-[#189BAF]' : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <User className="h-4 w-4" />
                                Pacientes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Aviso de candado de seguridad */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    Solo se pueden fusionar usuarios del mismo tipo. No es posible combinar un médico con un paciente.
                </div>

                {/* Grupo activo para fusionar */}
                {grupoActivo.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border-2 border-[#189BAF] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Grupo a fusionar ({grupoActivo.length} {tipoActivo === 'medico' ? 'médicos' : 'pacientes'})
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
                            Selecciona cuál usuario será el <strong>registro maestro</strong> (el que sobrevive). Los demás se eliminarán después de reasignar sus registros relacionados.
                        </p>

                        <div className="space-y-3">
                            {grupoActivo.map(usuario => (
                                <div
                                    key={usuario.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                                        maestroId === usuario.id
                                            ? 'border-[#189BAF] bg-[#189BAF]/5'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="radio"
                                            name="maestro"
                                            checked={maestroId === usuario.id}
                                            onChange={() => { setMaestroId(usuario.id); setPreview(null); }}
                                            className="h-4 w-4 text-[#189BAF]"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                {usuario.nombre}
                                                {maestroId === usuario.id && (
                                                    <span className="text-xs bg-[#189BAF] text-white px-2 py-0.5 rounded-full">
                                                        MAESTRO
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                                                {usuario.correo && <span>{usuario.correo}</span>}
                                                {usuario.telefono && <span>{usuario.telefono}</span>}
                                                {usuario.institucion && <span>{usuario.institucion}</span>}
                                                <span>{totalEstudios(usuario)} estudios</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => quitarDeGrupo(usuario.id)}
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
                                                <li>• {preview.estudios_como_medico} estudio(s) como médico</li>
                                                <li>• {preview.estudios_como_paciente} estudio(s) como paciente</li>
                                                <li>• {preview.correos_copia} correo(s) de copia</li>
                                                <li>• {preview.envios_como_medico} envío(s) (médico)</li>
                                                <li>• {preview.envios_como_emisor} envío(s) (emisor)</li>
                                                <li>• {preview.solicitudes_cliente} solicitud(es) de cliente</li>
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
                        Búsqueda Manual ({tipoActivo === 'medico' ? 'Médicos' : 'Pacientes'})
                    </h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && buscarUsuarios()}
                            placeholder="Buscar por nombre, apellidos o correo..."
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                        />
                        <button
                            onClick={buscarUsuarios}
                            disabled={searching}
                            className="px-4 py-2 bg-[#189BAF] hover:bg-[#157a8c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {searching ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map(usuario => {
                                const yaAgregado = grupoActivo.some(u => u.id === usuario.id);
                                return (
                                    <div
                                        key={usuario.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                                            <div className="text-xs text-gray-500">
                                                {usuario.correo && `${usuario.correo} • `}
                                                {usuario.institucion && `${usuario.institucion} • `}
                                                {totalEstudios(usuario)} estudios
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => agregarAGrupo(usuario)}
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
                        {tipoActivo === 'medico' ? (
                            <Stethoscope className="h-5 w-5 text-[#D68B41]" />
                        ) : (
                            <User className="h-5 w-5 text-[#D68B41]" />
                        )}
                        Sugerencias Automáticas ({sugerencias.length})
                    </h2>

                    {sugerencias.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                            <p>No se detectaron {tipoActivo === 'medico' ? 'médicos' : 'pacientes'} duplicados automáticamente.</p>
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
                                            onClick={() => seleccionarGrupoSugerido(grupo.usuarios)}
                                            className="text-xs bg-[#189BAF] text-white px-3 py-1.5 rounded hover:bg-[#157a8c] transition-colors"
                                        >
                                            Revisar y fusionar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {grupo.usuarios.map(usuario => (
                                            <div key={usuario.id} className="text-sm bg-gray-50 rounded p-2">
                                                <div className="font-medium text-gray-800">{usuario.nombre}</div>
                                                <div className="text-xs text-gray-500">
                                                    {usuario.correo && `${usuario.correo} • `}
                                                    {usuario.institucion && `${usuario.institucion} • `}
                                                    {totalEstudios(usuario)} estudios
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