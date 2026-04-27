"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden bg-[#f5f6fa]">
      <Sidebar className="fixed inset-y-0 left-0 z-40 hidden w-[280px] lg:flex" />

      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${
          mobileSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <Sidebar
        className={`fixed inset-y-0 left-0 z-[60] w-[280px] transform transition-transform duration-200 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

      <main className="h-screen overflow-y-auto pt-[72px] lg:pl-[280px]">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
