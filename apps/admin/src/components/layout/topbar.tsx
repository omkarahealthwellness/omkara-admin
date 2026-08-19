"use client";

import { Menu, CloudUpload, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { PublishButton } from "./publish-button";
import { useAuth } from "@/components/providers/auth-provider";

export function Topbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger className="md:hidden -ml-2 inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-border md:hidden" aria-hidden="true" />

      {/* Topbar Content */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
        <div className="flex flex-1">
          {/* Breadcrumbs or Page Title could go here */}
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            Admin Panel
          </div>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <PublishButton />
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Button>

          {/* Profile dropdown placeholder */}
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 overflow-hidden flex items-center justify-center text-xs font-bold uppercase">
            {user?.email?.charAt(0) || "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
