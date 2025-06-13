// sidebar option
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar";
// breadcrumb
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// line
import { data } from "../data/sidebar_menu";
import UserMenu from "./components/UserMenu";
import { Separator } from "@/components/ui/separator";
import SidebarDashboard from "./components/SidebarDashboard";

interface IFDashboard {
    title: string,
    children: React.ReactNode
}

const DashboardLayout = ({ children, title }:IFDashboard) => {
    const currentPath = data.navMenu.find(menu => menu.items.flatMap(sub_menu => sub_menu.title).includes(title));

    return (
        <SidebarProvider>
            <SidebarDashboard title={title} />
            <SidebarInset>
                <header className="bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-7 bg-gray-300"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            {currentPath?.title ? currentPath.title : "Unknown path"}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto">
                        <UserMenu />
                    </div>
                </header>
                <div id="main-dashboard-content">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default DashboardLayout;