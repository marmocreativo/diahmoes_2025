import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, RefreshCw, Info, AlertTriangle } from 'lucide-react';
import { renderResult } from '../utils/resultRenderer';

interface BackupToolsProps {
    lastBackup: {
        filename: string;
        date: string;
        size: string;
        type?: string; // Agregamos el tipo de archivo
    } | null;
    loading: Record<string, boolean>;
    results: Record<string, any>;
    setLoadingState: (action: string, state: boolean) => void;
    setResult: (action: string, result: any) => void;
}

export default function BackupTools({ 
    lastBackup, 
    loading, 
    results, 
    setLoadingState, 
    setResult 
}: BackupToolsProps) {
    
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [restoreMode, setRestoreMode] = useState<'replace' | 'merge' | 'data_only'>('replace');

    const handleDownloadBackup = async () => {
        console.log('📦 Iniciando descarga de respaldo...');
        setLoadingState('download', true);
        setResult('download', null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('📦 Enviando petición de respaldo...');

            const response = await fetch('/configuracion/download-backup', {
                method: 'GET',
                headers: {
                    'Accept': 'application/octet-stream, application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log('📦 Response status:', response.status);
            console.log('📦 Response headers:', Object.fromEntries(response.headers.entries()));

            // Si es un error, probablemente sea JSON
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    console.error('📦 Error JSON:', errorData);
                    setResult('download', errorData);
                } else {
                    const textResponse = await response.text();
                    console.error('📦 Error text:', textResponse.substring(0, 300));
                    setResult('download', {
                        success: false,
                        message: 'Error del servidor',
                        error: `Status: ${response.status}`,
                        debug_info: textResponse.substring(0, 500)
                    });
                }
                return;
            }

            // Si es exitoso, debería ser un archivo
            console.log('📦 Descargando archivo...');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            const contentDisposition = response.headers.get('content-disposition');
            const filename = contentDisposition 
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
                : `backup_${new Date().toISOString().slice(0, 10)}.sql`;

            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log('✅ Archivo descargado:', filename);
            setResult('download', {
                success: true,
                message: 'Respaldo descargado exitosamente',
                details: `Archivo: ${filename} (${(blob.size / 1024).toFixed(2)} KB)`,
                filename: filename
            });

        } catch (error) {
            console.error('💥 Error descargando respaldo:', error);
            setResult('download', {
                success: false,
                message: 'Error al descargar respaldo',
                error: error instanceof Error ? error.message : 'Error desconocido',
                debug_info: error instanceof Error ? error.stack : 'No stack trace'
            });
        } finally {
            setLoadingState('download', false);
        }
    };

    const handleUploadBackup = async () => {
        if (!backupFile) {
            setResult('upload', {
                success: false,
                message: 'Por favor selecciona un archivo'
            });
            return;
        }

        console.log('📤 Iniciando upload de respaldo:', backupFile.name);
        setLoadingState('upload', true);
        setResult('upload', null);

        try {
            const formData = new FormData();
            formData.append('backup_file', backupFile);
            formData.append('restore_mode', restoreMode);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('📤 Enviando archivo:', backupFile.name, 'Modo:', restoreMode);
            console.log('📤 Tamaño:', (backupFile.size / 1024 / 1024).toFixed(2) + ' MB');

            const response = await fetch('/configuracion/upload-backup', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            console.log('📤 Response status:', response.status);
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('📤 Response is not JSON:', textResponse.substring(0, 300));
                setResult('upload', {
                    success: false,
                    message: 'El servidor devolvió una respuesta inválida',
                    error: 'Content-Type: ' + contentType,
                    debug_info: textResponse.substring(0, 500)
                });
                return;
            }

            const data = await response.json();
            console.log('📤 Upload response:', data);
            setResult('upload', data);
            
            if (data.success) {
                setBackupFile(null);
                // Limpiar el input file
                const fileInput = document.getElementById('backup-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
            
        } catch (error) {
            console.error('💥 Error uploading backup:', error);
            setResult('upload', {
                success: false,
                message: 'Error al cargar respaldo',
                error: error instanceof Error ? error.message : 'Error desconocido',
                debug_info: error instanceof Error ? error.stack : 'No stack trace'
            });
        } finally {
            setLoadingState('upload', false);
        }
    };

    return (
        <>
            {/* Descargar Respaldo */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    Descargar Respaldo
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                    Genera y descarga un respaldo completo de la base de datos comprimido con gzip.
                </p>
                
                {lastBackup && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Info className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Último respaldo:</span>
                        </div>
                        <div className="text-blue-700">
                            <p className="font-mono text-xs">{lastBackup.filename}</p>
                            <p>{lastBackup.date} - {lastBackup.size}</p>
                            {lastBackup.type && <p className="text-xs opacity-75">{lastBackup.type}</p>}
                        </div>
                    </div>
                )}
                
                <Button
                    onClick={handleDownloadBackup}
                    disabled={loading.download}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    {loading.download ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Respaldo
                        </>
                    )}
                </Button>
                
                {renderResult('download', results)}
            </div>
        </>
    );
}