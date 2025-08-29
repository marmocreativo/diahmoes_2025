import { Button } from '@/components/ui/button';
import { RefreshCw, Play } from 'lucide-react';
import { renderResult } from '../utils/resultRenderer';

interface MigrationsToolProps {
    loading: Record<string, boolean>;
    results: Record<string, any>;
    setLoadingState: (action: string, state: boolean) => void;
    setResult: (action: string, result: any) => void;
}

export default function MigrationsTool({ 
    loading, 
    results, 
    setLoadingState, 
    setResult 
}: MigrationsToolProps) {

    const handleRunMigrations = async () => {
        console.log('🚀 Iniciando handleRunMigrations...');
        setLoadingState('migrations', true);
        setResult('migrations', null);

        try {
            console.log('📡 Enviando petición a /configuracion/run-migrations...');
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('🔐 CSRF Token:', csrfToken ? 'Encontrado' : 'NO ENCONTRADO');

            const response = await fetch('/configuracion/run-migrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            console.log('📡 Content-Type:', contentType);

            if (!contentType || !contentType.includes('application/json')) {
                // Si no es JSON, obtener el texto completo para debugging
                const textResponse = await response.text();
                console.error('❌ Respuesta NO es JSON:', textResponse.substring(0, 500));
                
                setResult('migrations', {
                    success: false,
                    message: 'El servidor devolvió HTML en lugar de JSON',
                    error: 'Content-Type: ' + contentType,
                    debug_info: textResponse.substring(0, 500) + '...'
                });
                return;
            }

            const data = await response.json();
            console.log('✅ Respuesta JSON recibida:', data);
            setResult('migrations', data);

        } catch (error) {
            console.error('💥 Error en handleRunMigrations:', error);
            setResult('migrations', {
                success: false,
                message: 'Error de conexión o parsing',
                error: error instanceof Error ? error.message : 'Error desconocido',
                debug_info: error instanceof Error ? error.stack : 'No stack trace'
            });
        } finally {
            setLoadingState('migrations', false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-[#189BAF]" />
                Ejecutar Migraciones
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
                Actualiza la estructura de la base de datos ejecutando las migraciones pendientes.
            </p>
            
            <Button
                onClick={handleRunMigrations}
                disabled={loading.migrations}
                className="w-full bg-[#189BAF] hover:bg-[#147a8a]"
            >
                {loading.migrations ? (
                    <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Ejecutando...
                    </>
                ) : (
                    <>
                        <Play className="h-4 w-4 mr-2" />
                        Ejecutar Migraciones
                    </>
                )}
            </Button>
            
            {renderResult('migrations', results)}
        </div>
    );
}