import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Sparkles, 
    Package, 
    CheckCircle, 
    AlertTriangle, 
    Loader2,
    Info,
    Plus,
    Trash2
} from 'lucide-react';

interface Insumo {
    nombre_insumo: string;
    cantidad: number;
    obligatorio: boolean;
    descripcion?: string;
    unidad?: string;
    nota?: string;
}

interface Plantilla {
    nombre: string;
    descripcion: string;
    icono: string;
    categoria: string;
    condiciones: Record<string, any>;
    insumos: Insumo[];
}

interface PlantillasInsumosProps {
    estudiaId: number;
    estatusKras?: string;
    refreshTrigger?: number;
    onPlantillaAplicada: () => void;
}

interface ValidacionInsumo {
    insumo: string;
    cantidad_requerida: number;
    disponible: boolean;
    stock_actual: number;
    mensaje: string;
}

interface InsumoDisponible {
    ID: number;
    NOMBRE: string;
    UNIDAD_MEDIDA: string;
    STOCK_TOTAL: number;
}

interface LoteDisponible {
    ID: number;
    LOTE: string;
    CANTIDAD_ACTUAL: number;
    PROXIMO_VENCER?: boolean;
}

export default function PlantillasInsumos({ estudiaId, estatusKras, refreshTrigger, onPlantillaAplicada }: PlantillasInsumosProps) {
    // Estados para plantillas
    const [plantillas, setPlantillas] = useState<Record<string, Plantilla>>({});
    const [plantillasRecomendadas, setPlantillasRecomendadas] = useState<Record<string, Plantilla>>({});
    const [loading, setLoading] = useState(false);
    const [aplicandoPlantilla, setAplicandoPlantilla] = useState<string | null>(null);
    const [mostrarValidacion, setMostrarValidacion] = useState<string | null>(null);
    const [validaciones, setValidaciones] = useState<ValidacionInsumo[]>([]);

    // Estados para agregar insumos manualmente
    const [insumosDisponibles, setInsumosDisponibles] = useState<InsumoDisponible[]>([]);
    const [lotesDisponibles, setLotesDisponibles] = useState<LoteDisponible[]>([]);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState('');
    const [loteSeleccionado, setLoteSeleccionado] = useState('');
    const [cantidadManual, setCantidadManual] = useState('');
    const [agregandoInsumo, setAgregandoInsumo] = useState(false);

    // Estados para lista de insumos utilizados
    const [insumosUtilizados, setInsumosUtilizados] = useState<any[]>([]);
    const [costoTotal, setCostoTotal] = useState(0);
    const [cargandoInsumos, setCargandoInsumos] = useState(false);

    // Tab activa
    const [activeTab, setActiveTab] = useState<'plantillas' | 'manual' | 'utilizados'>('utilizados');
    const [mostrarTodasPlantillas, setMostrarTodasPlantillas] = useState(false);

    // Cargar datos al montar el componente
    useEffect(() => {
        cargarPlantillas();
        cargarPlantillasRecomendadas();
        cargarInsumosDisponibles();
        cargarInsumosUtilizados();
    }, [estudiaId]);

    useEffect(() => {
        if (estatusKras !== undefined) {
            cargarPlantillasRecomendadas();
        }
    }, [estatusKras]);

    useEffect(() => {
        if (refreshTrigger !== undefined && refreshTrigger > 0) {
            cargarInsumosUtilizados();
        }
    }, [refreshTrigger]);

    // FUNCIONES PARA PLANTILLAS (código anterior)
    const cargarPlantillas = async () => {
        try {
            const response = await fetch('/plantillas-insumos');
            const data = await response.json();
            
            if (data.success) {
                setPlantillas(data.plantillas);
            }
        } catch (error) {
            console.error('Error cargando plantillas:', error);
        }
    };

    const cargarPlantillasRecomendadas = async () => {
        try {
            const params = new URLSearchParams();
            if (estatusKras) params.set('estatus_kras', estatusKras);

            const response = await fetch(`/estudios/${estudiaId}/plantillas-insumos?${params.toString()}`);
            const data = await response.json();

            console.log('🎯 Respuesta plantillas recomendadas:', data);
            console.log('🎯 info_estudio:', data.info_estudio);
            console.log('🎯 plantillas_recomendadas:', data.plantillas_recomendadas);
            
            if (data.success) {
                setPlantillasRecomendadas(data.plantillas_recomendadas);
            }
        } catch (error) {
            console.error('Error cargando plantillas recomendadas:', error);
        }
    };

    const validarPlantilla = async (plantillaKey: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/estudios/${estudiaId}/validar-plantilla`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ plantilla_key: plantillaKey })
            });

            const data = await response.json();
            
            if (data.success) {
                setValidaciones(data.validaciones);
                setMostrarValidacion(plantillaKey);
            } else {
                alert('Error al validar plantilla: ' + data.message);
            }
        } catch (error) {
            console.error('Error validando plantilla:', error);
            alert('Error al validar plantilla');
        } finally {
            setLoading(false);
        }
    };

    const aplicarPlantilla = async (plantillaKey: string) => {
        if (!confirm('¿Estás seguro de aplicar esta plantilla? Se agregarán todos los insumos especificados.')) {
            return;
        }

        setAplicandoPlantilla(plantillaKey);
        
        try {
            const response = await fetch(`/estudios/${estudiaId}/aplicar-plantilla`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ plantilla_key: plantillaKey })
            });

            const data = await response.json();
            
            if (data.success) {
                let mensaje = `✅ Plantilla aplicada exitosamente!\n\n`;
                
                if (data.insumos_reemplazados) {
                    mensaje += `Insumos anteriores reemplazados: ${data.insumos_reemplazados}\n`;
                }
                
                mensaje += `Insumos agregados: ${data.insumos_agregados}\n`;
                
                if (data.lotes_creados && data.lotes_creados > 0) {
                    mensaje += `⚠️ Se crearon ${data.lotes_creados} lotes automáticamente\n`;
                }
                
                if (data.errores.length > 0) {
                    mensaje += `Advertencias: ${data.errores.join(', ')}`;
                }
                
                alert(mensaje);
                
                cargarInsumosUtilizados();
                onPlantillaAplicada();
                setMostrarValidacion(null);
                setActiveTab('utilizados'); // 🆕 Cambiar automáticamente a la tab de utilizados
            } else {
                alert('❌ Error al aplicar plantilla: ' + data.message);
                if (data.errores && data.errores.length > 0) {
                    alert('Detalles: ' + data.errores.join('\n'));
                }
            }
        } catch (error) {
            console.error('Error aplicando plantilla:', error);
            alert('Error interno al aplicar plantilla');
        } finally {
            setAplicandoPlantilla(null);
        }
    };

    // FUNCIONES PARA AGREGAR INSUMOS MANUALMENTE
    const cargarInsumosDisponibles = async () => {
        try {
            const response = await fetch('/api/estudios/insumos-disponibles');
            const data = await response.json();
            
            if (data.success) {
                setInsumosDisponibles(data.insumos);
            }
        } catch (error) {
            console.error('Error cargando insumos disponibles:', error);
        }
    };

    const cargarLotesDelInsumo = async (insumoId: string) => {
        if (!insumoId) {
            setLotesDisponibles([]);
            return;
        }

        try {
            const response = await fetch(`/insumos/${insumoId}/lotes-disponibles`);
            const data = await response.json();
            
            if (data.lotes && Array.isArray(data.lotes)) {
                setLotesDisponibles(data.lotes);
            } else {
                setLotesDisponibles([]);
            }
        } catch (error) {
            console.error('Error cargando lotes:', error);
            setLotesDisponibles([]);
        }
    };

    const agregarInsumoManual = async () => {
        if (!loteSeleccionado || !cantidadManual) {
            alert('Por favor selecciona un lote y cantidad');
            return;
        }

        const cantidad = parseInt(cantidadManual);
        const loteInfo = lotesDisponibles.find(l => l.ID.toString() === loteSeleccionado);
        
        if (loteInfo && cantidad > loteInfo.CANTIDAD_ACTUAL) {
            alert(`Stock insuficiente. Disponible: ${loteInfo.CANTIDAD_ACTUAL}`);
            return;
        }

        setAgregandoInsumo(true);
        
        try {
            const response = await fetch(`/estudios/${estudiaId}/insumos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ID_INSUMO_LOTE: parseInt(loteSeleccionado),
                    CANTIDAD: cantidad,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                alert('✅ Insumo agregado exitosamente');
                
                // Limpiar formulario
                setInsumoSeleccionado('');
                setLoteSeleccionado('');
                setCantidadManual('');
                setLotesDisponibles([]);
                
                // Recargar datos
                cargarInsumosDisponibles();
                cargarInsumosUtilizados();
                onPlantillaAplicada();
            } else {
                alert('❌ Error al agregar insumo: ' + data.message);
            }
        } catch (error) {
            console.error('Error agregando insumo:', error);
            alert('Error al agregar insumo');
        } finally {
            setAgregandoInsumo(false);
        }
    };

    // FUNCIONES PARA LISTA DE INSUMOS UTILIZADOS
    const cargarInsumosUtilizados = useCallback(async () => {
        setCargandoInsumos(true);
        try {
            const response = await fetch(`/estudios/${estudiaId}/insumos`);
            const data = await response.json();
            
            if (data.success) {
                setInsumosUtilizados(data.insumos || []);
                setCostoTotal(data.costo_total || 0);
            } else {
                setInsumosUtilizados([]);
                setCostoTotal(0);
            }
        } catch (error) {
            console.error('Error cargando insumos utilizados:', error);
            setInsumosUtilizados([]);
            setCostoTotal(0);
        } finally {
            setCargandoInsumos(false);
        }
    }, [estudiaId]);

    const eliminarInsumo = async (insumoId: number) => {
        try {
            const response = await fetch(`/estudios/${estudiaId}/insumos/${insumoId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            if (response.ok) {
                cargarInsumosUtilizados();
                cargarInsumosDisponibles();
            } else {
                console.error('Error al eliminar insumo');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // COMPONENTES DE RENDERIZADO
    const PlantillaCard = ({ plantillaKey, plantilla, esRecomendada = false }: { 
        plantillaKey: string; 
        plantilla: Plantilla; 
        esRecomendada?: boolean; 
    }) => (
        <div className={`border rounded-lg p-4 ${esRecomendada ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{plantilla.icono}</span>
                    <div>
                        <h4 className="font-medium text-gray-900">
                            {plantilla.nombre}
                            {esRecomendada && <Badge className="ml-2 bg-green-600">Recomendada</Badge>}
                        </h4>
                        <p className="text-sm text-gray-600">{plantilla.descripcion}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Insumos incluidos:</h5>
                <div className="space-y-1">
                    {plantilla.insumos.map((insumo, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                                {insumo.nombre_insumo}
                                {insumo.descripcion && (
                                    <span className="text-gray-500 ml-1">({insumo.descripcion})</span>
                                )}
                            </span>
                            <Badge variant="outline" className="text-xs">
                                {insumo.cantidad} {insumo.unidad || 'unidad(es)'}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => validarPlantilla(plantillaKey)}
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                        <Info className="h-4 w-4 mr-1" />
                    )}
                    Validar Stock
                </Button>
                
                <Button
                    onClick={() => aplicarPlantilla(plantillaKey)}
                    disabled={aplicandoPlantilla === plantillaKey}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                >
                    {aplicandoPlantilla === plantillaKey ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Aplicar
                </Button>
            </div>
        </div>
    );

    const ModalValidacion = () => {
        if (!mostrarValidacion || validaciones.length === 0) return null;

        const plantilla = plantillas[mostrarValidacion] || plantillasRecomendadas[mostrarValidacion];
        const todasDisponibles = validaciones.every(v => v.disponible);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Validación de Stock - {plantilla?.nombre}
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMostrarValidacion(null)}
                        >
                            ✕
                        </Button>
                    </div>

                    <div className={`p-4 rounded-lg mb-4 ${todasDisponibles ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-2">
                            {todasDisponibles ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-medium ${todasDisponibles ? 'text-green-800' : 'text-red-800'}`}>
                                {todasDisponibles ? 'Todos los insumos están disponibles' : 'Algunos insumos no tienen stock suficiente'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {validaciones.map((validacion, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${
                                    validacion.disponible 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-red-50 border-red-200'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {validacion.insumo}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Requerido: {validacion.cantidad_requerida} | 
                                            Disponible: {validacion.stock_actual}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={validacion.disponible ? "default" : "destructive"}
                                        className="ml-2"
                                    >
                                        {validacion.disponible ? 'Disponible' : 'Insuficiente'}
                                    </Badge>
                                </div>
                                <p className="text-sm mt-1 text-gray-600">
                                    {validacion.mensaje}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setMostrarValidacion(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => aplicarPlantilla(mostrarValidacion)}
                            disabled={!todasDisponibles || aplicandoPlantilla === mostrarValidacion}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {aplicandoPlantilla === mostrarValidacion ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            {todasDisponibles ? 'Aplicar Plantilla' : 'Aplicar (Con Faltantes)'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('plantillas')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'plantillas'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        🎯 Plantillas Rápidas
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'manual'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        ➕ Agregar Manual
                    </button>
                    <button
                        onClick={() => setActiveTab('utilizados')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'utilizados'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        📋 Insumos Utilizados ({insumosUtilizados.length})
                    </button>
                </nav>
            </div>

            {/* Contenido de las tabs */}
            {activeTab === 'plantillas' && (
                <div className="space-y-6">
                    {/* Plantillas Recomendadas */}
                    {Object.keys(plantillasRecomendadas).length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-green-800">
                                    Plantillas Recomendadas
                                </h3>
                            </div>
                            <div className="grid gap-4">
                                {Object.entries(plantillasRecomendadas).map(([key, plantilla]) => (
                                    <PlantillaCard 
                                        key={key} 
                                        plantillaKey={key} 
                                        plantilla={plantilla} 
                                        esRecomendada={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Todas las Plantillas — colapsable */}
                    <div>
                        <button
                            onClick={() => setMostrarTodasPlantillas(!mostrarTodasPlantillas)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <Package className="h-4 w-4" />
                            {mostrarTodasPlantillas ? 'Ocultar' : 'Ver'} todas las plantillas
                            <span className="text-xs">{mostrarTodasPlantillas ? '▲' : '▼'}</span>
                        </button>

                        {mostrarTodasPlantillas && (
                            <div className="grid gap-4 md:grid-cols-2 mt-4">
                                {Object.entries(plantillas).map(([key, plantilla]) => {
                                    if (plantillasRecomendadas[key]) return null;
                                    return (
                                        <PlantillaCard key={key} plantillaKey={key} plantilla={plantilla} />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium mb-4">Añadir insumo individual</h4>
                    
                    <div className="space-y-4">
                        {/* Selector de insumo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Seleccionar Insumo
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={insumoSeleccionado}
                                onChange={(e) => {
                                    setInsumoSeleccionado(e.target.value);
                                    setLoteSeleccionado('');
                                    cargarLotesDelInsumo(e.target.value);
                                }}
                            >
                                <option value="">Selecciona un insumo</option>
                                {insumosDisponibles.map((insumo) => (
                                    <option key={insumo.ID} value={insumo.ID}>
                                        {insumo.NOMBRE} ({insumo.UNIDAD_MEDIDA}) - Stock: {insumo.STOCK_TOTAL}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Selector de lote */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Seleccionar Lote
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={loteSeleccionado}
                                onChange={(e) => setLoteSeleccionado(e.target.value)}
                                disabled={!insumoSeleccionado}
                            >
                                <option value="">
                                    {insumoSeleccionado ? 'Selecciona un lote' : 'Primero selecciona un insumo'}
                                </option>
                                {lotesDisponibles.map((lote) => (
                                    <option key={lote.ID} value={lote.ID}>
                                        {lote.LOTE} - Stock: {lote.CANTIDAD_ACTUAL}
                                        {lote.PROXIMO_VENCER ? ' ⚠️ Próximo a vencer' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Cantidad */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Cantidad a usar"
                                    value={cantidadManual}
                                    onChange={(e) => setCantidadManual(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={agregarInsumoManual}
                                disabled={agregandoInsumo || !loteSeleccionado || !cantidadManual}
                                className="bg-blue-600 hover:bg-blue-700 mt-6"
                            >
                                {agregandoInsumo ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        
                        {lotesDisponibles.length > 0 && (
                            <div className="bg-gray-50 rounded p-2 text-sm text-gray-600">
                                💡 Tip: Los lotes se ordenan por fecha de caducidad (FIFO)
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'utilizados' && (
                <div>
                    {cargandoInsumos ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                            <p className="text-gray-500 mt-2">Cargando insumos...</p>
                        </div>
                    ) : insumosUtilizados.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm font-medium">
                                No se han agregado insumos a este estudio
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="font-medium">Insumos utilizados:</h4>
                            <div className="space-y-2">
                                {insumosUtilizados.map((uso) => (
                                    <div key={uso.ID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{uso.nombre_insumo}</p>
                                            <p className="text-sm text-gray-600">
                                                Lote: {uso.numero_lote} | 
                                                Cantidad: {uso.CANTIDAD}
                                                {uso.costo_total > 0 && ` | Costo: $${parseFloat(uso.costo_total).toFixed(2)}`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => eliminarInsumo(uso.ID)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Eliminar insumo"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {costoTotal > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                    <p className="text-green-800 font-medium">
                                        Costo total de insumos: ${costoTotal.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <ModalValidacion />
        </div>
    );
}