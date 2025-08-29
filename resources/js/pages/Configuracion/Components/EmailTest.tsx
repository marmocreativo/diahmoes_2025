import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, Settings } from 'lucide-react';
import { renderResult } from '../utils/resultRenderer';

interface EmailTestProps {
    loading: Record<string, boolean>;
    results: Record<string, any>;
    setLoadingState: (action: string, state: boolean) => void;
    setResult: (action: string, result: any) => void;
}

export default function EmailTest({ 
    loading, 
    results, 
    setLoadingState, 
    setResult 
}: EmailTestProps) {
    
    const [testEmail, setTestEmail] = useState('');

    const handleTestMailConfig = async () => {
        console.log('📧 Probando configuración de correo...');
        setLoadingState('mail-config', true);
        setResult('mail-config', null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/configuracion/mail-config-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();
            setResult('mail-config', data);
            
        } catch (error) {
            setResult('mail-config', {
                success: false,
                message: 'Error al probar configuración de correo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        } finally {
            setLoadingState('mail-config', false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            setResult('email', {
                success: false,
                message: 'Por favor ingresa un correo electrónico'
            });
            return;
        }

        setLoadingState('email', true);
        setResult('email', null);

        try {
            const response = await fetch('/configuracion/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ 
                    test_email: testEmail,
                    include_diagnostics: true 
                })
            });

            const data = await response.json();
            setResult('email', data);
        } catch (error) {
            setResult('email', {
                success: false,
                message: 'Error al enviar correo de prueba',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        } finally {
            setLoadingState('email', false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Prueba de Correo
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
                Verifica la configuración de correo y envía un mensaje de prueba.
            </p>
            
            <div className="space-y-4">
                {/* Prueba de configuración */}
                <div>
                    <Button
                        onClick={handleTestMailConfig}
                        disabled={loading['mail-config']}
                        className="w-full bg-blue-600 hover:bg-blue-700 mb-3"
                    >
                        {loading['mail-config'] ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Verificando configuración...
                            </>
                        ) : (
                            <>
                                <Settings className="h-4 w-4 mr-2" />
                                Verificar Configuración SMTP
                            </>
                        )}
                    </Button>
                    
                    {renderResult('mail-config', results)}
                </div>

                {/* Separador */}
                <div className="border-t pt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo de prueba
                        </label>
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="tu@ejemplo.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    
                    <Button
                        onClick={handleTestEmail}
                        disabled={loading.email || !testEmail}
                        className="w-full bg-green-600 hover:bg-green-700 mt-3"
                    >
                        {loading.email ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Correo de Prueba
                            </>
                        )}
                    </Button>
                </div>
                
                {renderResult('email', results)}

                {/* Información de configuración recomendada */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="font-medium mb-1">Configuración recomendada:</p>
                    <ul className="text-yellow-800 space-y-1 text-xs">
                        <li>• Host: mail.diahmoes.com.mx</li>
                        <li>• Puerto: 465 (SSL) o 587 (TLS)</li>
                        <li>• Usuario: resultados@diahmoes.com.mx</li>
                        <li>• Encriptación: SSL/TLS según puerto</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}