"use client";

import Link from "next/link";
import { LayoutDashboard, Store, Tag, Package, Image as ImageIcon, Settings, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Tags", href: "/tags", icon: Tag },
  { name: "Navigation", href: "/navigation", icon: Store },
  { name: "Hero Banner", href: "/hero", icon: ImageIcon },
  { name: "WhatsApp Templates", href: "/whatsapp", icon: Store },
  { name: "UI Theme", href: "/theme", icon: Settings },
  { name: "Store Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const { logout } = useAuth();
  
  return (
    <aside className="w-64 border-r bg-background/50 backdrop-blur flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-serif text-2xl font-bold text-primary">Omkara Admin</span>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="grid gap-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t mt-auto">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
