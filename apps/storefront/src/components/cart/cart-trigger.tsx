"use client";

import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartSheet } from "@/lib/store/ui";

export function CartTrigger() {
  const items = useCartStore(state => state.lines);
  const openSheet = useCartSheet(state => state.openSheet);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch since localstorage is client-only
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Button 
      variant="outline" 
      onClick={openSheet}
      className="border-crimson-spice/30 text-crimson-spice hover:bg-crimson-spice/5 font-medium flex items-center gap-2"
    >
      <ShoppingBag className="h-4 w-4" />
      <span>Cart {mounted && totalItems > 0 ? `(${totalItems})` : ''}</span>
    </Button>
  );
}
