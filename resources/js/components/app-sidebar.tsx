import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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
    XCircle
} from 'lucide-react';

const navGroups: NavGroup[] = [
    {
        title: 'Gestión de Usuarios',
        items: [
            {
                title: 'Todos los Usuarios',
                href: '/usuarios',
                icon: Users,
            },
            {
                title: 'Administradores',
                href: '/usuarios?tipo=admin',
                icon: Shield,
            },
            {
                title: 'Médicos',
                href: '/usuarios?tipo=medico',
                icon: Stethoscope,
            },
            {
                title: 'Clientes',
                href: '/usuarios?tipo=clientes',
                icon: UserCheck,
            },
            {
                title: 'Pacientes',
                href: '/usuarios?tipo=paciente',
                icon: User,
            },
        ]
    },
    {
        title: 'Gestión de Clientes',
        items: [
            {
                title: 'Todos los Clientes',
                href: '/clientes',
                icon: Briefcase,
            }
        ]
    },
    {
        title: 'Gestión de Instituciones',
        items: [
            {
                title: 'Todas las Instituciones',
                href: '/instituciones',
                icon: Building2,
            },
        ]
    },
    {
        title: 'Gestión de Mensajerías',
        items: [
            {
                title: 'Todas las Mensajerías',
                href: '/mensajerias',
                icon: Truck,
            }
        ]
    },
    {
        title: 'Estudios Médicos',
        items: [
            {
                title: 'Todos los Estudios',
                href: '/estudios',
                icon: TestTube,
            },
            {
                title: 'Nuevo Estudio PRM',
                href: '/estudios/create?prefijo=PRM',
                icon: Plus,
            },
            {
                title: 'Nuevo Estudio PRV',
                href: '/estudios/create?prefijo=PRV',
                icon: Plus,
            }
        ]
    },
];

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

                {/* Grupos desplegables */}
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter className="bg-gray-50 border-t border-gray-200">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}