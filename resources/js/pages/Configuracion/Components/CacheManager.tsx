import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, RotateCcw, Zap } from 'lucide-react';
import { renderResult } from '../utils/resultRenderer';

interface CacheManagerProps {
    loading: Record<string, boolean>;
    results: Record<string, any>;
    setLoadingState: (action: string, state: boolean) => void;
    setResult: (action: string, result: any) => void;
}

export default function CacheManager({ 
    loading, 
    results, 
    setLoadingState, 
    setResult 
}: CacheManagerProps) {

    const [selectedCommand, setSelectedCommand] = useState<string>('');

    const executeCommand = async (action: string, commands: string[], description: string) => {
        console.log(`🧹 Iniciando ${action}...`);
        setLoadingState(action, true);
        setResult(action, null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/configuracion/cache-commands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    action: action,
                    commands: commands,
                    description: description
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('❌ Respuesta NO es JSON:', textResponse.substring(0, 300));
                
                setResult(action, {
                    success: false,
                    message: 'El servidor devolvió HTML en lugar de JSON',
                    error: 'Content-Type: ' + contentType,
                    debug_info: textResponse.substring(0, 500)
                });
                return;
            }

            const data = await response.json();
            console.log('✅ Respuesta recibida:', data);
            setResult(action, data);

        } catch (error) {
            console.error('💥 Error en executeCommand:', error);
            setResult(action, {
                success: false,
                message: 'Error de conexión o parsing',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        } finally {
            setLoadingState(action, false);
        }
    };

    const executeCustomCommand = async () => {
        if (!selectedCommand.trim()) {
            setResult('custom', {
                success: false,
                message: 'Por favor selecciona un comando'
            });
            return;
        }

        await executeCommand('custom', [selectedCommand], `Ejecutando comando: ${selectedCommand}`);
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                Gestión de Caché
            </h3>
            
            <p className="text-gray-600 mb-6 text-sm">
                Herramientas para limpiar y reconstruir la caché de Laravel.
            </p>

            {/* Botones de acciones rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <Button
                    onClick={() => executeCommand('clear_all', 
                        ['config:clear', 'cache:clear', 'view:clear', 'route:clear'],
                        'Limpiando todas las cachés'
                    )}
                    disabled={loading.clear_all}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    {loading.clear_all ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Limpiando...
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Limpiar Todo
                        </>
                    )}
                </Button>

                <Button
                    onClick={() => executeCommand('rebuild_cache',
                        ['config:cache', 'route:cache'],
                        'Reconstruyendo cachés optimizadas'
                    )}
                    disabled={loading.rebuild_cache}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading.rebuild_cache ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Reconstruyendo...
                        </>
                    ) : (
                        <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reconstruir Caché
                        </>
                    )}
                </Button>

                <Button
                    onClick={() => executeCommand('full_reset',
                        ['config:clear', 'cache:clear', 'view:clear', 'route:clear', 'config:cache', 'route:cache'],
                        'Reset completo: limpieza y reconstrucción'
                    )}
                    disabled={loading.full_reset}
                    className="bg-purple-600 hover:bg-purple-700 text-white col-span-full"
                >
                    {loading.full_reset ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Procesando reset completo...
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4 mr-2" />
                            Reset Completo
                        </>
                    )}
                </Button>
            </div>

            {/* Separador */}
            <div className="border-t pt-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-3">Comando personalizado</h4>
                
                <div className="flex gap-2">
                    <select
                        value={selectedCommand}
                        onChange={(e) => setSelectedCommand(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    >
                        <option value="">Seleccionar comando...</option>
                        <option value="config:clear">config:clear - Limpiar configuración</option>
                        <option value="cache:clear">cache:clear - Limpiar caché de aplicación</option>
                        <option value="view:clear">view:clear - Limpiar vistas compiladas</option>
                        <option value="route:clear">route:clear - Limpiar rutas cacheadas</option>
                        <option value="config:cache">config:cache - Cachear configuración</option>
                        <option value="route:cache">route:cache - Cachear rutas</option>
                        <option value="optimize:clear">optimize:clear - Limpiar optimizaciones</option>
                        <option value="optimize">optimize - Optimizar aplicación</option>
                    </select>
                    
                    <Button
                        onClick={executeCustomCommand}
                        disabled={loading.custom || !selectedCommand.trim()}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                        {loading.custom ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            'Ejecutar'
                        )}
                    </Button>
                </div>
            </div>

            {/* Mostrar resultados */}
            {renderResult('clear_all', results)}
            {renderResult('rebuild_cache', results)}
            {renderResult('full_reset', results)}
            {renderResult('custom', results)}

            {/* Información adicional */}
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm">
                <p className="font-medium mb-1">💡 Información sobre comandos:</p>
                <ul className="text-orange-800 space-y-1 text-xs">
                    <li>• <strong>Limpiar Todo:</strong> Elimina todas las cachés (recomendado en desarrollo)</li>
                    <li>• <strong>Reconstruir:</strong> Optimiza config y rutas (recomendado en producción)</li>
                    <li>• <strong>Reset Completo:</strong> Limpia todo y reconstruye cachés importantes</li>
                    <li>• Use comandos individuales para operaciones específicas</li>
                </ul>
            </div>
        </div>
    );
}