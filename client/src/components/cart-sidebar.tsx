import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { formatPrice, getDeliveryFee, calculateTax } from "@/lib/utils";
import type { MenuItem } from "@shared/schema";

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartSidebarProps {
  cart: CartItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateQuantity: (itemId: number, change: number) => void;
  onRemoveItem: (itemId: number) => void;
  onPlaceOrder: () => void;
  orderType: string;
  deliveryLocation?: string;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  isPlacingOrder: boolean;
}

export function CartSidebar({
  cart,
  isOpen,
  onOpenChange,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  orderType,
  deliveryLocation,
  paymentMethod,
  onPaymentMethodChange,
  isPlacingOrder
}: CartSidebarProps) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? getDeliveryFee(deliveryLocation) : 0;
  const tax = calculateTax(subtotal, deliveryFee);
  const total = subtotal + deliveryFee + tax;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`relative border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300 backdrop-blur-sm ${
            totalItems > 0 
              ? 'bg-korean-red bg-opacity-90 hover:bg-korean-red hover:bg-opacity-100' 
              : 'bg-white bg-opacity-10'
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-white text-korean-red font-bold border-2 border-korean-red animate-pulse">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle>주문 내역</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center">장바구니가 비어있습니다</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-mannabean-border">
                  <div className="flex items-start space-x-3 mb-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base text-mannabean-text mb-1">{item.name}</h4>
                      <p className="text-mannabean-accent font-semibold text-sm">개당 {formatPrice(item.price)}</p>
                      <p className="text-xs text-muted-foreground">소계: {formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-mannabean-text">수량:</span>
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 border-mannabean-border hover:bg-mannabean-light-green"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg w-8 text-center text-mannabean-text">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 border-mannabean-border hover:bg-mannabean-light-green"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>소계:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>배달비:</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>부가세 (8%):</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>총 금액:</span>
                <span className="text-mannabean-accent">{formatPrice(total)}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">결제 방식</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={onPaymentMethodChange}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 border border-mannabean-border rounded-lg hover:bg-mannabean-light-green/30 transition-colors">
                  <RadioGroupItem value="cash" id="cash" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="cash" className="text-sm font-medium cursor-pointer">현금결제 (COD)</Label>
                    <p className="text-xs text-muted-foreground mt-1">배달받고 오토바이 기사에게 현금을 주는 방식</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 border border-mannabean-border rounded-lg hover:bg-mannabean-light-green/30 transition-colors">
                  <RadioGroupItem value="transfer" id="transfer" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="transfer" className="text-sm font-medium cursor-pointer">계좌이체</Label>
                    <p className="text-xs text-muted-foreground mt-1">주문 전 미리 입금하는 방식</p>
                    {paymentMethod === 'transfer' && (
                      <div className="mt-2 p-2 bg-mannabean-light-green/50 rounded border border-mannabean-border">
                        <div className="text-xs text-mannabean-text space-y-1">
                          <div className="flex justify-between">
                            <span>은행:</span>
                            <span className="font-medium">Vietcombank</span>
                          </div>
                          <div className="flex justify-between">
                            <span>계좌:</span>
                            <span className="font-medium">0123456789</span>
                          </div>
                          <div className="flex justify-between">
                            <span>예금주:</span>
                            <span className="font-medium">MANNABEAN</span>
                          </div>
                          <div className="pt-1 border-t border-mannabean-border/30">
                            <p className="text-mannabean-accent font-medium">입금 후 주문하기 클릭</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-mannabean-green hover:bg-mannabean-dark-green text-white"
            >
              {isPlacingOrder ? '주문 중...' : '주문하기'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
