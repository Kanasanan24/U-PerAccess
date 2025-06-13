// icon
import {
    ChevronRight
} from "lucide-react";
// collapsible
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";
// sidebar
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { data } from "../../data/sidebar_menu";
// public
import Logo from "/U-PerAccess_Logo.png";

interface IFSidebar {
    title: string
}
const SidebarDashboard = ({ title }:IFSidebar) => {
    return (
        <Sidebar>
            {/* Header */}
            <SidebarHeader className="flex flex-row justify-center items-center gap-4">
                <img src={Logo} alt="logo" className="w-11 h-11" />
                <span className="font-bold text-xl">U-PerAccess</span>
            </SidebarHeader>
            {/* Content */}
            <SidebarContent className="gap-0">
                {/* Collap */}
                {data.navMenu.map(nav => (
                    <Collapsible key={nav.title} title={nav.title} defaultOpen className="group/collapsible">
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm">
                                {/* Main Menu */}
                                <CollapsibleTrigger>
                                    <span className="text-[0.9rem]">{nav.title}{" "}</span>
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    {/* Sub Menu */}
                                    <SidebarMenu>
                                        {nav.items?.map(menu => (
                                            <SidebarMenuItem key={menu.title}>
                                                <SidebarMenuButton className="!px-4 !py-5" asChild isActive={menu.title === title}>
                                                    <Link className="text-[0.84rem] !text-gray-800" to={menu.url}>{menu.title}</Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}

export default SidebarDashboard;