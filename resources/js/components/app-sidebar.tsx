import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    FileText, 
    Building2, 
    Users, 
    TestTube,
    BarChart3,
    Settings,
    HelpCircle,
    UserPlus,
    Shield,
    Stethoscope,
    UserCheck,
    User,
    Plus,
    Eye,
    Edit,
    MapPin,
    Clock,
    Activity,
    TrendingUp,
    Briefcase,
    UserCog,
    Mail,
    MailCheck,
    MailX,
    Truck,
    Package,
    CheckCircle,
    XCircle,
    Tag,
    ClipboardList
} from 'lucide-react';

const footerNavItems = [
    {
        title: 'Configuración',
        href: '/configuracion',
        icon: Settings,
    },
    {
        title: 'Ayuda',
        href: '/ayuda',
        icon: HelpCircle,
    },
];

export function AppSidebar() {
    const { url } = usePage();
    
    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset"
            className="border-r border-[#189BAF]/10"
        >
            <SidebarHeader className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] text-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            size="lg" 
                            asChild
                            className="hover:bg-white/10 data-[state=open]:bg-white/10"
                        >
                            <Link href="/dashboard" prefetch className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-bold text-lg">DIAHMOES</span>
                                    <span className="truncate text-xs text-white/80">Estudios</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-white">
            {/* Dashboard - Elemento simple */}
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/dashboard' 
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/dashboard" prefetch className="flex items-center gap-3">
                                <LayoutGrid className="!size-4" />
                                <span className="font-medium">Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>

            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild
                    className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                        url.includes('/estudios')
                            ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                            : 'text-gray-700'
                    }`}
                >
                    <Link href="/estudios?prefijo=PRM" prefetch className="flex items-center gap-3">
                        <TestTube className="!size-4" />
                        <span className="font-medium">Estudios</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Enlaces individuales */}
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/instituciones' 
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/instituciones" prefetch className="flex items-center gap-3">
                                <Building2 className="!size-4" />
                                <span className="font-medium">Instituciones</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/usuarios?tipo=medico' || (url.includes('/usuarios') && url.includes('tipo=medico'))
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/usuarios?tipo=medico" prefetch className="flex items-center gap-3">
                                <Stethoscope className="!size-4" />
                                <span className="font-medium">Médicos</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/usuarios?tipo=paciente' || (url.includes('/usuarios') && url.includes('tipo=paciente'))
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/usuarios?tipo=paciente" prefetch className="flex items-center gap-3">
                                <User className="!size-4" />
                                <span className="font-medium">Pacientes</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/clientes' 
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/clientes" prefetch className="flex items-center gap-3">
                                <Briefcase className="!size-4" />
                                <span className="font-medium">Clientes</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/solicitudes-cliente' 
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/solicitudes-cliente" prefetch className="flex items-center gap-3">
                                <ClipboardList className="!size-4" />
                                <span className="font-medium">Solicitudes</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/insumos' 
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/insumos" prefetch className="flex items-center gap-3">
                                <Package className="!size-4" />
                                <span className="font-medium">Inventario</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/mensajerias' 
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/mensajerias" prefetch className="flex items-center gap-3">
                                <Truck className="!size-4" />
                                <span className="font-medium">Mensajerías</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url.includes('/grupos-folios-kits') || url.includes('/folios-kits')
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/folios-kits" prefetch className="flex items-center gap-3">
                                <Tag className="!size-4" />
                                <span className="font-medium">Folios Kits</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild
                            className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                                url === '/reporte-accesos' 
                                    ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                                    : 'text-gray-700'
                            }`}
                        >
                            <Link href="/reporte-accesos" prefetch className="flex items-center gap-3">
                                <Shield className="!size-4" />
                                <span className="font-medium">Accesos Reportes</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>

            <SidebarFooter className="bg-gray-50 border-t border-gray-200">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}