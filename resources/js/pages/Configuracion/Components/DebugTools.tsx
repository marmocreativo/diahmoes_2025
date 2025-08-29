import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { renderResult } from '../utils/resultRenderer';

interface DebugToolsProps {
    loading: Record<string, boolean>;
    results: Record<string, any>;
    setLoadingState: (action: string, state: boolean) => void;
    setResult: (action: string, result: any) => void;
}

export default function DebugTools({ 
    loading, 
    results, 
    setLoadingState, 
    setResult 
}: DebugToolsProps) {

    const handleCheckCSRF = () => {
        console.log('🔐 Verificando CSRF token...');
        
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const inputToken = (document.querySelector('input[name="_token"]') as HTMLInputElement)?.value;
        
        setResult('csrf-check', {
            success: !!(metaToken || inputToken),
            message: metaToken || inputToken ? 'CSRF token encontrado' : 'CSRF token NO encontrado',
            debug_info: {
                metaToken: metaToken ? metaToken.substring(0, 20) + '...' : 'No encontrado',
                inputToken: inputToken ? inputToken.substring(0, 20) + '...' : 'No encontrado',
                metaTagExists: !!document.querySelector('meta[name="csrf-token"]'),
                inputTagExists: !!document.querySelector('input[name="_token"]'),
                headTags: Array.from(document.head.querySelectorAll('meta')).map(meta => ({
                    name: meta.getAttribute('name'),
                    content: meta.getAttribute('content')?.substring(0, 30) + '...'
                }))
            }
        });
    };

    const handleTestEndpoint = async () => {
        console.log('🧪 Probando endpoint...');
        setLoadingState('test', true);
        setResult('test', null);

        try {
            // Verificar múltiples fuentes de CSRF token
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                // Intentar obtener de input hidden
                csrfToken = (document.querySelector('input[name="_token"]') as HTMLInputElement)?.value;
            }
            
            console.log('🔐 CSRF Token encontrado:', csrfToken ? 'SÍ (' + csrfToken.substring(0, 10) + '...)' : 'NO');
            
            if (!csrfToken) {
                setResult('test', {
                    success: false,
                    message: 'CSRF token no encontrado en la página',
                    error: 'No se encontró meta[name="csrf-token"] ni input[name="_token"]',
                    debug_info: {
                        metaTag: !!document.querySelector('meta[name="csrf-token"]'),
                        inputTag: !!document.querySelector('input[name="_token"]'),
                        headContent: document.head.innerHTML.substring(0, 500)
                    }
                });
                return;
            }
            
            const response = await fetch('/configuracion/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ 
                    test: 'data',
                    timestamp: new Date().toISOString() 
                })
            });

            console.log('🧪 Test response status:', response.status);
            console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Si es 419, es problema de CSRF
            if (response.status === 419) {
                const errorData = await response.json();
                console.log('❌ CSRF Error data:', errorData);
                setResult('test', {
                    success: false,
                    message: 'Error de CSRF Token (419)',
                    error: errorData.message || 'CSRF token mismatch',
                    debug_info: {
                        status: response.status,
                        tokenUsed: csrfToken.substring(0, 20) + '...',
                        responseData: errorData
                    }
                });
                return;
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('🧪 Test response is not JSON:', textResponse.substring(0, 200));
                setResult('test', {
                    success: false,
                    message: 'Endpoint devolvió HTML en lugar de JSON',
                    error: `Content-Type: ${contentType}`,
                    debug_info: textResponse.substring(0, 500)
                });
                return;
            }

            const data = await response.json();
            console.log('🧪 Test response:', data);
            setResult('test', {
                ...data,
                debug_info: {
                    tokenUsed: csrfToken.substring(0, 20) + '...',
                    responseHeaders: Object.fromEntries(response.headers.entries())
                }
            });
            
        } catch (error) {
            console.error('🧪 Test error:', error);
            setResult('test', {
                success: false,
                message: 'Error en prueba de endpoint',
                error: error instanceof Error ? error.message : 'Error desconocido',
                debug_info: {
                    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
                    stack: error instanceof Error ? error.stack : 'No stack trace'
                }
            });
        } finally {
            setLoadingState('test', false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🧪 Debug y Testing
            </h3>
            
            <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                    Herramientas de debugging para verificar conectividad y funcionamiento.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={handleCheckCSRF}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        🔐 Verificar CSRF
                    </Button>
                    
                    <Button
                        onClick={handleTestEndpoint}
                        disabled={loading.test}
                        className="bg-gray-600 hover:bg-gray-700"
                    >
                        {loading.test ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Probando...
                            </>
                        ) : (
                            <>
                                🧪 Test Endpoint
                            </>
                        )}
                    </Button>
                </div>
                
                {renderResult('csrf-check', results)}
                {renderResult('test', results)}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="font-medium mb-1">💡 Para debugging adicional:</p>
                    <ul className="text-blue-700 space-y-1">
                        <li>• Abre DevTools → Console para logs detallados</li>
                        <li>• Revisa storage/logs/laravel.log en el servidor</li>
                        <li>• Verifica que el CSRF token esté presente en la página</li>
                        <li>• Error 419 = Problema de CSRF token</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}