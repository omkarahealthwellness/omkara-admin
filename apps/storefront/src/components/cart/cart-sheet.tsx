'use client';

import { useCartStore } from '@/lib/store/cart';
import { useCartSheet } from '@/lib/store/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { getCachedManifest } from '@/lib/manifest-cache';
import { useEffect, useState } from 'react';
import { Manifest } from '@omkara/core-schemas';

export function CartSheet() {
  const { isCartSheetOpen, closeSheet } = useCartSheet();
  const { lines, removeItem, updateQuantity, clearCart } = useCartStore();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getCachedManifest()
      .then((m) => {
        if (m) setManifest(m);
      })
      .catch(console.error);
  }, []);

  const totalAmount = lines.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const handleCheckout = () => {
    // Generate WhatsApp link
    let text = `*New Order - Omkara*\n\n`;
    lines.forEach((item) => {
      text += `- ${item.quantity}x ${item.productName} (₹${(item.unitPrice / 100).toFixed(2)})\n`;
    });
    text += `\n*Total: ₹${(totalAmount / 100).toFixed(2)}*\n\n`;
    text += `Please confirm my order.`;

    // Use phone number from manifest
    const phone = manifest?.store?.whatsappNumber || manifest?.store?.phone || '919999999999';
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  if (!mounted) return null;

  return (
    <Sheet open={isCartSheetOpen} onOpenChange={closeSheet}>
      <SheetContent
        className="w-full sm:max-w-md flex flex-col h-full bg-[#FDF5E6] border-l border-[#4A2B18]/15 shadow-2xl text-[#4A2B18] p-0"
        side="right"
      >
        <SheetHeader className="p-5 border-b border-[#4A2B18]/10 bg-[#FDF5E6]">
          <SheetTitle className="flex items-center gap-2 font-serif text-2xl text-[#C05A3E]">
            <ShoppingBag className="h-6 w-6" /> Your Cart
          </SheetTitle>
          <SheetDescription className="text-[#6B4C3A]">
            {lines.length === 0
              ? 'Your cart is currently empty.'
              : `You have ${lines.length} items in your cart.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#FDF5E6]">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#6B4C3A]/60 space-y-4 py-16">
              <ShoppingBag className="h-16 w-16 opacity-40" />
              <p className="font-medium">Nothing here yet.</p>
            </div>
          ) : (
            lines.map((item) => (
              <div
                key={item.lineId}
                className="flex bg-white p-3.5 rounded-xl border border-[#4A2B18]/10 shadow-sm items-center gap-4"
              >
                <div className="h-16 w-16 bg-[#F0E4D1] rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-serif font-bold text-[#6B4C3A]">OMKARA</span>
                </div>

                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-[#4A2B18] line-clamp-1">
                    {item.productName}
                  </span>
                  <span className="text-sm font-bold text-[#C05A3E] mt-0.5">
                    ₹{(item.unitPrice / 100).toFixed(2)}
                  </span>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-[#4A2B18]/20 bg-[#FDF5E6] rounded-lg h-8 w-24 justify-between px-2">
                      <button
                        onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                        className="text-[#6B4C3A] hover:text-[#4A2B18] font-bold"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-[#4A2B18]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                        className="text-[#6B4C3A] hover:text-[#4A2B18] font-bold"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.lineId)}
                      className="text-destructive/80 hover:text-destructive p-1 rounded transition-colors"
                      aria-label="Remove item"
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
          <div className="border-t border-[#4A2B18]/10 p-5 space-y-3 mt-auto bg-[#FDF5E6] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center text-lg font-bold text-[#4A2B18]">
              <span>Total</span>
              <span className="text-[#C05A3E] text-xl">₹{(totalAmount / 100).toFixed(2)}</span>
            </div>
            <p className="text-xs text-[#6B4C3A] text-center">
              Shipping and taxes calculated at checkout.
            </p>
            <Button
              className="w-full h-12 text-base font-bold bg-[#C05A3E] hover:bg-[#A84A30] text-white shadow-md rounded-xl transition-all"
              onClick={handleCheckout}
            >
              Order via WhatsApp
            </Button>
            <Button
              variant="ghost"
              className="w-full text-[#6B4C3A] hover:text-[#4A2B18] hover:bg-[#4A2B18]/5 text-xs font-semibold"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
