"use client";

import { useCartStore } from "@/lib/store/cart";
import { useCartSheet } from "@/lib/store/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { getCachedManifest } from "@/lib/manifest-cache";
import { useEffect, useState } from "react";
import { Manifest } from "@omkara/core-schemas";

export function CartSheet() {
  const { isCartSheetOpen, closeSheet } = useCartSheet();
  const { lines, removeItem, updateQuantity, clearCart } = useCartStore();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getCachedManifest().then(m => {
      if (m) setManifest(m);
    }).catch(console.error);
  }, []);

  const totalAmount = lines.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  const handleCheckout = () => {
    // Generate WhatsApp link
    let text = `*New Order - Omkara*\n\n`;
    lines.forEach(item => {
      text += `- ${item.quantity}x ${item.productName} (₹${(item.unitPrice / 100).toFixed(2)})\n`;
    });
    text += `\n*Total: ₹${(totalAmount / 100).toFixed(2)}*\n\n`;
    text += `Please confirm my order.`;

    // Use phone number from manifest
    const phone = manifest?.store?.whatsappNumber || manifest?.store?.phone || "919999999999";
    const cleanPhone = phone.replace(/\D/g, "");
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  if (!mounted) return null;

  return (
    <Sheet open={isCartSheetOpen} onOpenChange={closeSheet}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-sandstone/10 border-l-0 sm:border-l" side="right">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 font-serif text-2xl text-crimson-spice">
            <ShoppingBag className="h-6 w-6" /> Your Cart
          </SheetTitle>
          <SheetDescription>
            {lines.length === 0 ? "Your cart is currently empty." : `You have ${lines.length} items in your cart.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
              <ShoppingBag className="h-16 w-16" />
              <p>Nothing here yet.</p>
            </div>
          ) : (
            lines.map((item) => (
              <div key={item.lineId} className="flex bg-white p-3 rounded-lg border shadow-sm items-center gap-4">
                <div className="h-16 w-16 bg-sandstone/20 rounded-md flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Img</span>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-gray-900 line-clamp-1">{item.productName}</span>
                  <span className="text-sm font-bold text-crimson-spice">₹{(item.unitPrice / 100).toFixed(2)}</span>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border rounded h-8 w-24 justify-between px-2">
                      <button 
                        onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.lineId)}
                      className="text-destructive/70 hover:text-destructive text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t pt-4 space-y-4 mt-auto bg-white/50 p-4 -mx-6 mb-[-24px]">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-crimson-spice">₹{(totalAmount / 100).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">Shipping and taxes calculated at checkout.</p>
            <Button 
              className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg"
              onClick={handleCheckout}
            >
              Order via WhatsApp
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
