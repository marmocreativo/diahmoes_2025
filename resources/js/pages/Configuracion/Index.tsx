import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Settings } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

import SystemInfo from './Components/SystemInfo';
import MigrationsTool from './Components/MigrationsTool';
import BackupTools from './Components/BackupTools';
import EmailTest from './Components/EmailTest';
import DebugTools from './Components/DebugTools';

// 🔧 Interfaz con index signature compatible con usePage
interface ConfiguracionProps {
    [key: string]: any;
    database_info: {
        connection?: string;
        database?: string;
        host?: string;
        tables_count?: number;
        last_migration?: string;
        error?: string; // ← Esta propiedad faltaba
    };
    mail_config: {
        mailer: string;
        host: string;
        port: string;
        from_address: string;
        from_name: string;
    };
    last_backup: {
        filename: string;
        date: string;
        size: string;
    } | null;
}

export default function ConfiguracionIndex() {
    const { database_info, mail_config, last_backup } = usePage<ConfiguracionProps>().props;
    
    // Estados globales compartidos
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, any>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Configuración', href: '/configuracion' }
    ];

    const setLoadingState = (action: string, state: boolean) => {
        setLoading(prev => ({ ...prev, [action]: state }));
    };

    const setResult = (action: string, result: any) => {
        setResults(prev => ({ ...prev, [action]: result }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración del Sistema" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Settings className="h-8 w-8 text-[#189BAF]" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
                            <p className="text-gray-600">Herramientas de mantenimiento y administración</p>
                        </div>
                    </div>
                </div>

                {/* Información del Sistema */}
                <SystemInfo 
                    databaseInfo={database_info}
                    mailConfig={mail_config}
                />

                {/* Debug Tools - Solo en desarrollo */}
                <DebugTools
                    loading={loading}
                    results={results}
                    setLoadingState={setLoadingState}
                    setResult={setResult}
                />

                {/* Herramientas de Mantenimiento */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Migraciones */}
                    <MigrationsTool
                        loading={loading}
                        results={results}
                        setLoadingState={setLoadingState}
                        setResult={setResult}
                    />

                    {/* Respaldo */}
                    <BackupTools
                        lastBackup={last_backup}
                        loading={loading}
                        results={results}
                        setLoadingState={setLoadingState}
                        setResult={setResult}
                    />

                    {/* Prueba de Correo */}
                    <EmailTest
                        loading={loading}
                        results={results}
                        setLoadingState={setLoadingState}
                        setResult={setResult}
                    />
                </div>
            </div>
        </AppLayout>
    );
}