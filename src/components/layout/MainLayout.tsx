import React, { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { TopBar } from "./TopBar";
import { SidebarNav } from "./SidebarNav";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("jeeva-sidebar-collapsed");
    return saved !== null ? saved === "true" : true; // Default to collapsed
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem("jeeva-sidebar-collapsed", String(newCollapsed));
  };

  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <TopBar
        onMenuClick={handleDrawerToggle}
        onSidebarToggle={handleSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      <SidebarNav
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: { xs: "100%", md: `calc(100% - ${sidebarWidth}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
          mt: "64px",
          ml: { xs: 0, md: `${sidebarWidth}px` },
          transition: "margin 0.3s, width 0.3s",
        }}
      >
        <Box sx={{ flexGrow: 1, p: { xs: 3, sm: 4 } }}>{children}</Box>
        <Footer />
      </Box>
    </Box>
  );
};
