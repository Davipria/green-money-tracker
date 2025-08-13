import { memo } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import UserMenu from "@/components/UserMenu";

const AppLayout = memo(() => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-2 flex justify-between items-center">
            <SidebarTrigger />
            <UserMenu />
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
});

AppLayout.displayName = "AppLayout";

export default AppLayout;