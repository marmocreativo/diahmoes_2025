import { Database, Mail, AlertTriangle } from 'lucide-react';

interface SystemInfoProps {
    databaseInfo: {
        connection: string;
        database: string;
        host: string;
        tables_count: number;
        last_migration: string;
        error?: string;
    };
    mailConfig: {
        mailer: string;
        host: string;
        port: string;
        from_address: string;
        from_name: string;
    };
}

export default function SystemInfo({ databaseInfo, mailConfig }: SystemInfoProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de Base de Datos */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold">Base de Datos</h3>
                </div>
                
                {databaseInfo.error ? (
                    <div className="text-red-600 p-3 bg-red-50 rounded border">
                        <AlertTriangle className="h-5 w-5 inline mr-2" />
                        {databaseInfo.error}
                    </div>
                ) : (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Conexión:</span>
                            <span className="font-medium">{databaseInfo.connection}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Base de datos:</span>
                            <span className="font-medium">{databaseInfo.database}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Host:</span>
                            <span className="font-medium">{databaseInfo.host}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tablas:</span>
                            <span className="font-medium">{databaseInfo.tables_count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Última migración:</span>
                            <span className="font-medium text-xs">{databaseInfo.last_migration}</span>
                        </div>
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
                        <span className="font-medium">{mailConfig.mailer}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Host:</span>
                        <span className="font-medium">{mailConfig.host}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Puerto:</span>
                        <span className="font-medium">{mailConfig.port}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">De (email):</span>
                        <span className="font-medium text-xs">{mailConfig.from_address}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">De (nombre):</span>
                        <span className="font-medium">{mailConfig.from_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}