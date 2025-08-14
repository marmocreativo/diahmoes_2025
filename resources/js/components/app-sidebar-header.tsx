import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

interface User {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    USUARIO_CORREO: string;
    USUARIO_TIPO: string;
    USUARIO_ESTADO: string;
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<{ auth: { user: User }; [key: string]: any }>().props;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#189BAF]/10 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 shadow-sm">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1 hover:bg-[#189BAF]/10 text-[#189BAF]" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {/* Información del usuario en el header */}
            <div className="hidden md:flex items-center gap-3 text-sm">
                <div className="text-right">
                    <p className="font-medium text-gray-900">
                        {auth.user.USUARIO_NOMBRE} {auth.user.USUARIO_APELLIDOS}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                        {auth.user.USUARIO_TIPO}
                    </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#189BAF] text-white text-sm font-medium">
                    {auth.user.USUARIO_NOMBRE.charAt(0)}{auth.user.USUARIO_APELLIDOS.charAt(0)}
                </div>
            </div>
        </header>
    );
}