// component
import { 
    BadgeCheck,
    LogOut,
    ChevronsUpDown
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
// other lib
import axios from "axios";
import Space from "/Profile.jpg";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { toastOptions } from "../../components/LoginPage/SignupDialog";

const UserMenu = () => {
    // router
    const navigate = useNavigate();
    // function
    const logout = async() => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API}/signout`, {}, {withCredentials:true});
            if (response?.data?.message) {
                toast.success(response.data.message, toastOptions);
                navigate("/");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.data?.message) toast.error(error.response.data.message, toastOptions);
                else toast.error("Something went wrong.", toastOptions);
            } else toast.error("Something went wrong.", toastOptions);
        }
    };
    // render
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                    <Avatar className="h-10 w-10 rounded-lg">
                        {/* Avatar Image */}
                        <AvatarImage src={Space} alt="Space" />
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{"test"}</span>
                        <span className="truncate text-xs">{"test@gmail.com"}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    side={"bottom"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={Space} alt="Space" />
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{"test"}</span>
                            <span className="truncate text-xs">{"test@gmail.com"}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <BadgeCheck />
                            Account
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async() => await logout()}>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default UserMenu;