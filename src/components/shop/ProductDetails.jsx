import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Package } from "lucide-react";

export default function ProductDetails({ product, onClose, isCustomerView = false, onAddToCart, onEdit }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
            {!isCustomerView && onEdit && (
              <Button onClick={onEdit} variant="outline">
                ערוך
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Image */}
          <div className="space-y-4">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full rounded-lg object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
            
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
              
              {product.average_rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < product.average_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.total_sales || 0} ביקורות)
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-purple-600">₪{product.price}</span>
                {product.sale_price && (
                  <span className="text-2xl text-gray-500 line-through">₪{product.sale_price}</span>
                )}
              </div>
              {product.sale_price && (
                <Badge className="bg-red-500 text-white">
                  חסכון של ₪{product.sale_price - product.price}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">סטטוס:</span>
                <Badge className={
                  product.status === "זמין" ? "bg-green-100 text-green-800" :
                  product.status === "אזל מהמלאי" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }>
                  {product.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold">במלאי:</span>
                <span className={product.stock_quantity <= 5 ? "text-red-600 font-bold" : ""}>
                  {product.stock_quantity} יחידות
                </span>
              </div>

              {product.manufacturer && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">יצרן:</span>
                  <span>{product.manufacturer}</span>
                </div>
              )}

              {product.sku && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">מק"ט:</span>
                  <span className="font-mono text-sm">{product.sku}</span>
                </div>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="font-bold text-lg mb-2">תיאור המוצר</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {isCustomerView && onAddToCart && product.status === "זמין" && (
              <Button
                onClick={onAddToCart}
                className="w-full bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
              >
                <ShoppingCart className="w-6 h-6 ml-2" />
                הוסף לעגלה
              </Button>
            )}

            {product.reviews && product.reviews.length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="font-bold text-lg mb-4">ביקורות</h3>
                <div className="space-y-4">
                  {product.reviews.map((review, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{review.user_name}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}