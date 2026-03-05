import { useState } from "react";
import type { Product, ProductSize } from "@/types";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, size?: ProductSize) => void;
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  return (
    <div className="flex-1 px-4 pb-32 overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-center text-muted-foreground mt-12 text-sm">لا توجد منتجات</p>
      )}
    </div>
  );
};

const ProductCard = ({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product, size?: ProductSize) => void;
}) => {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const hasSizes = product.quantity_type === "ml" && product.product_sizes && product.product_sizes.length > 0;
  const displayPrice = selectedSize ? selectedSize.selling_price : product.selling_price;
  const inStock = hasSizes
    ? (selectedSize ? selectedSize.stock > 0 : true)
    : product.stock > 0;

  return (
    <div
      className="bg-card rounded-xl p-3 shadow-sm border border-border transition-transform active:scale-[0.98]"
    >
      <div className="mb-2">
        <h3 className="font-medium text-sm text-foreground leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
          {Number(displayPrice).toLocaleString()} دج
        </p>
        {!inStock && (
          <span className="text-xs text-destructive font-medium">نفدت الكمية</span>
        )}
      </div>

      {hasSizes && (
        <div className="flex flex-wrap gap-1 mb-2">
          {product.product_sizes!.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size.id === selectedSize?.id ? null : size)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${selectedSize?.id === size.id
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground"
                } ${size.stock <= 0 ? "opacity-40" : ""}`}
              disabled={size.stock <= 0}
            >
              {size.size_ml}ml
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          if (hasSizes && !selectedSize) return;
          onAdd(product, selectedSize || undefined);
        }}
        disabled={!inStock || (hasSizes && !selectedSize)}
        className="w-full py-2 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-30 active:scale-95 transition-transform"
      >
        إضافة
      </button>
    </div>
  );
};

export default ProductGrid;
