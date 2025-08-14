import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavMainProps {
  groups: NavGroup[];
}

export function NavMain({ groups }: NavMainProps) {
  const { url } = usePage();

  // Función para determinar si una ruta está activa
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return url === href;
    }
    return url.startsWith(href);
  };

  // Función para determinar si un grupo está activo
  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isActive(item.href));
  };

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarMenu>
            <Collapsible 
              defaultOpen={isGroupActive(group)}
              className="group/collapsible"
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className={`group-data-[state=open]/collapsible:bg-[#189BAF]/5 group-data-[state=open]/collapsible:text-[#189BAF] hover:bg-[#189BAF]/5 hover:text-[#189BAF] ${
                    isGroupActive(group) ? 'bg-[#189BAF]/10 text-[#189BAF]' : ''
                  }`}
                >
                  {group.items[0]?.icon && (() => {
                    const IconComponent = group.items[0].icon;
                    return IconComponent ? <IconComponent className="!size-4" /> : null;
                  })()}
                  <span className="font-medium">{group.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                  {group.items.map((item) => (
                    <SidebarMenuSubItem key={item.title} className="list-none">
                      <SidebarMenuSubButton 
                        asChild
                        className={`hover:bg-[#189BAF]/5 hover:text-[#189BAF] transition-colors ${
                          isActive(item.href) 
                            ? 'bg-[#189BAF]/10 text-[#189BAF] font-medium border-r-2 border-[#189BAF]' 
                            : 'text-gray-700'
                        }`}
                      >
                        <Link href={item.href} prefetch>
                          {item.icon && (() => {
                            const IconComponent = item.icon;
                            return IconComponent ? <IconComponent className="!size-4" /> : null;
                          })()}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}