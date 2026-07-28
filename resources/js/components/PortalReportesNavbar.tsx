import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LogOut, FlaskConical, ArrowLeft } from 'lucide-react';

interface SesionInfo {
    nombre: string;
    tipo: 'admin' | 'externo';
}

interface Props {
    sesionInfo: SesionInfo;
    subtitulo?: string;
    volverA?: string;
    volverLabel?: string;
}

export default function PortalReportesNavbar({
    sesionInfo,
    subtitulo = 'Reporte Analítico',
    volverA,
    volverLabel = 'Volver',
}: Props) {
    const handleLogout = () => {
        router.post(route('reportes.logout'));
    };

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#189BAF]">
                    <FlaskConical className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-lg">DIAHMOES</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 text-sm">{subtitulo}</span>
            </div>
            <div className="flex items-center gap-4">
                {volverA && (
                    <Button variant="outline" size="sm" onClick={() => router.visit(volverA)}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> {volverLabel}
                    </Button>
                )}
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">{sesionInfo.nombre}</p>
                    <p className="text-xs text-slate-400">
                        {sesionInfo.tipo === 'admin' ? 'Administrador' : 'Acceso externo'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Cerrar sesión</span>
                </Button>
            </div>
        </div>
    );
}