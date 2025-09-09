import { Database, Mail, AlertTriangle } from 'lucide-react';

interface SystemInfoProps {
    databaseInfo: {
        connection?: string;
        database?: string;
        host?: string;
        tables_count?: number;
        last_migration?: string;
        error?: string;
        status?: string;
    };
    mailConfig: {
        mailer?: string;
        host?: string;
        port?: string;
        from_address?: string;
        from_name?: string;
    };
}

export default function SystemInfo({ databaseInfo, mailConfig }: SystemInfoProps) {
    // Verificaciones defensivas
    const dbInfo = databaseInfo || {};
    const mailConf = mailConfig || {};
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de Base de Datos */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold">Base de Datos</h3>
                </div>
                
                {dbInfo.error ? (
                    <div className="text-red-600 p-3 bg-red-50 rounded border">
                        <AlertTriangle className="h-5 w-5 inline mr-2" />
                        {dbInfo.error}
                    </div>
                ) : (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Conexión:</span>
                            <span className="font-medium">{dbInfo.connection || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Base de datos:</span>
                            <span className="font-medium">{dbInfo.database || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Host:</span>
                            <span className="font-medium">{dbInfo.host || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tablas:</span>
                            <span className="font-medium">{dbInfo.tables_count ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Última migración:</span>
                            <span className="font-medium text-xs">{dbInfo.last_migration || 'N/A'}</span>
                        </div>
                        {dbInfo.status && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estado:</span>
                                <span className={`font-medium text-xs ${
                                    dbInfo.status === 'connected' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {dbInfo.status === 'connected' ? 'Conectado' : 'Error'}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Información de Correo */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Configuración de Correo</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Mailer:</span>
                        <span className="font-medium">{mailConf.mailer || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Host:</span>
                        <span className="font-medium">{mailConf.host || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Puerto:</span>
                        <span className="font-medium">{mailConf.port || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">De (email):</span>
                        <span className="font-medium text-xs">{mailConf.from_address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">De (nombre):</span>
                        <span className="font-medium">{mailConf.from_name || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}