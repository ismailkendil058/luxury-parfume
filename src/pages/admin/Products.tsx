import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get unique products by name for suggestions
  const uniqueProducts = Array.from(new Map(products.map((p) => [p.name, p])).values());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at");
    if (data) setProducts(data);
  };

  const resetForm = () => {
    setName(""); setPurchasePrice(""); setSellingPrice("");
    setStock("");
    setEditing(null);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setName(p.name);
    setPurchasePrice(String(p.purchase_price));
    setSellingPrice(String(p.selling_price));
    setStock(String(p.stock));
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("الاسم مطلوب"); return; }

    const productData = {
      name,
      purchase_price: Number(purchasePrice) || 0,
      selling_price: Number(sellingPrice) || 0,
      stock: Number(stock) || 0,
    };

    let productId: string;

    if (editing) {
      const { error } = await supabase.from("products").update(productData).eq("id", editing.id);
      if (error) { toast.error("فشل التحديث"); return; }
      productId = editing.id;
      toast.success("تم تحديث المنتج");
    } else {
      const existingProduct = products.find(
        (p) =>
          p.name === productData.name &&
          Number(p.purchase_price) === productData.purchase_price &&
          Number(p.selling_price) === productData.selling_price
      );

      if (existingProduct) {
        const newStock = Number(existingProduct.stock || 0) + productData.stock;
        const { error } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", existingProduct.id);

        if (error) { toast.error("فشل تحديث الكمية"); return; }
        productId = existingProduct.id;
        toast.success("هذا المنتج موجود مسبقاً، تم إضافة الكمية بنجاح");
      } else {
        const { data, error } = await supabase.from("products").insert(productData).select().single();
        if (error || !data) { toast.error("فشل الإنشاء"); return; }
        productId = data.id;
        toast.success("تمت إضافة المنتج");
      }
    }

    setShowDialog(false);
    resetForm();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
    toast.success("تم الحذف");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">المنتجات</h2>
        <Button onClick={() => { resetForm(); setShowDialog(true); }} size="sm" className="rounded-xl gap-1">
          <Plus className="w-4 h-4" /> إضافة
        </Button>
      </div>

      <div className="space-y-3">
        {products.map((p) => (
          <Card key={p.id} className="rounded-xl shadow-sm border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.quantity_type === "ml" ? "أحجام مل" : `${p.stock} في المخزون`}
                  </p>
                  <div className="flex gap-3 mt-1 text-sm tabular-nums">
                    <span>شراء: {Number(p.purchase_price).toLocaleString()} دج</span>
                    <span>بيع: {Number(p.selling_price).toLocaleString()} دج</span>
                    <span className="text-muted-foreground">
                      أرباح: {(Number(p.selling_price) - Number(p.purchase_price)).toLocaleString()} دج
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-secondary rounded-xl" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-secondary rounded-xl text-destructive" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && <p className="text-center text-muted-foreground text-sm mt-8">لا يوجد منتجات بعد</p>}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل المنتج" : "إضافة منتج"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Input
                placeholder="اسم المنتج"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="h-11 rounded-xl"
                autoComplete="off"
              />
              {showSuggestions && name && !editing && uniqueProducts.filter((p) => p.name.toLowerCase().startsWith(name.toLowerCase())).length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-background border border-border/50 rounded-xl shadow-lg z-[100] max-h-48 overflow-y-auto">
                  {uniqueProducts
                    .filter((p) => p.name.toLowerCase().startsWith(name.toLowerCase()))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="px-4 py-3 hover:bg-secondary cursor-pointer border-b border-border/50 last:border-0 text-sm transition-colors text-right"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setName(p.name);
                          setPurchasePrice(String(p.purchase_price));
                          setSellingPrice(String(p.selling_price));
                          setShowSuggestions(false);
                        }}
                      >
                        {p.name}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="سعر الشراء (دج)" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="h-11 rounded-xl" />
              <Input placeholder="سعر البيع (دج)" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="h-11 rounded-xl" />
            </div>

            <Input placeholder="كمية المخزون" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="h-11 rounded-xl" />

            <Button onClick={handleSave} className="w-full h-11 rounded-xl">{editing ? "تحديث" : "إضافة منتج"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
