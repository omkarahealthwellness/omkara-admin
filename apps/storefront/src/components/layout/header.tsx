import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, ShoppingCart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8 justify-between">
        {/* Mobile Nav */}
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger className="md:hidden -ml-2 inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle>Menu</SheetTitle>
              <nav className="flex flex-col gap-4 mt-6">
                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors">Products</Link>
                <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">Our Heritage</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-primary">Omkara</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <Link href="/about" className="hover:text-primary transition-colors">Our Heritage</Link>
        </nav>

        {/* Cart */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Shopping Cart</span>
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
