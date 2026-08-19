"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@omkara/core-schemas";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { useCartSheet } from "@/lib/store/ui";

export function AddToCartButton({ product, disabled }: { product: Product, disabled?: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: product.variants?.[0]?.id || product.id,
      variantName: product.variants?.[0]?.name || "Default",
      quantity,
      unitPrice: product.variants?.[0]?.price || 0,
      addonIds: [],
      addonNames: [],
      note: "",
      addedAt: new Date().toISOString(),
    });
    
    useCartSheet.getState().openSheet();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center border rounded-md h-12 w-32 justify-between px-3 bg-white">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          disabled={disabled || quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="font-semibold text-lg">{quantity}</span>
        <button 
          onClick={() => setQuantity(quantity + 1)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <Button 
        size="lg" 
        className="flex-1 h-12 text-base font-bold bg-gray-900 hover:bg-gray-800 text-white border-none shadow-md hover:shadow-lg transition-all"
        onClick={handleAdd}
        disabled={disabled}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {disabled ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
