
import { Archive, BarChart3, Plus, User, Home } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

const menuItems = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Archivio",
    url: "/app/archive",
    icon: Archive,
  },
  {
    title: "Nuova Scommessa",
    url: "/app/add-bet",
    icon: Plus,
  },
  {
    title: "Analisi",
    url: "/app/analysis",
    icon: BarChart3,
  },
  {
    title: "Profilo",
    url: "/app/profile",
    icon: User,
  },
]

export function AppSidebar() {
  const location = useLocation()
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary mb-4">
            BetTracker Pro
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  >
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
