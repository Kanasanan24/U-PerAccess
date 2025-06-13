const data = {
    navMenu: [
        {
            title: "Dashboard Overview",
            url: "#",
            items: [
                {
                    title: "Dashboard",
                    url: "#",
                    permission: ["find_user", "find_permission", "find_statistic"]
                }
            ]
        },
        {
            title: "User & Permission",
            url: "#",
            items: [
                {
                    title: "User Manage",
                    url: "#",
                    permission: ["find_user"]
                },
                {
                    title: "Role Manage",
                    url: "#",
                    permission: ["find_role"]
                },
                {
                    title: "Permission Manage",
                    url: "#",
                    permission: ["find_permission"]
                }
            ]
        },
        
    ]
}

export {
    data
}