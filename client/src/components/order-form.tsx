import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bike, Utensils, MapPin, Phone, User } from "lucide-react";

interface OrderFormProps {
  orderType: string;
  onOrderTypeChange: (type: string) => void;
  deliveryLocation?: string;
  onDeliveryLocationChange: (location: string) => void;
  detailAddress: string;
  onDetailAddressChange: (address: string) => void;
  customAddress: string;
  onCustomAddressChange: (address: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (phone: string) => void;
}

export function OrderForm({
  orderType,
  onOrderTypeChange,
  deliveryLocation,
  onDeliveryLocationChange,
  detailAddress,
  onDetailAddressChange,
  customAddress,
  onCustomAddressChange,
  customerPhone,
  onCustomerPhoneChange
}: OrderFormProps) {
  return (
    <Card className="bg-amber-50/80 border-amber-200/60 shadow-lg backdrop-blur-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4 text-center tracking-wide font-serif">
          주문 정보
        </h3>
        <div className="space-y-4">
          {/* Phone Number */}
          <div>
            <Label htmlFor="customerPhone" className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2 font-semibold">
              <Phone className="h-4 w-4 text-mannabean-green" />
              연락처 *
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="전화번호를 입력하세요"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              className="border-amber-300 focus:border-mannabean-green bg-white/80"
            />
          </div>

          {/* Order Type */}
          <div>
            <Label className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2 font-semibold">
              <Utensils className="h-4 w-4 text-mannabean-green" />
              주문 방식
            </Label>
            <RadioGroup value={orderType} onValueChange={onOrderTypeChange} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex items-center gap-1 cursor-pointer text-sm font-medium text-amber-800">
                  <Bike className="h-3 w-3 text-mannabean-green" />
                  배달
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="table" id="table" />
                <Label htmlFor="table" className="flex items-center gap-1 cursor-pointer text-sm font-medium text-amber-800">
                  <Utensils className="h-3 w-3 text-mannabean-green" />
                  테이블예약
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Location - Only shown for delivery orders */}
          {orderType === 'delivery' && (
            <div>
              <Label className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 text-mannabean-green" />
                배달 장소
              </Label>
              <RadioGroup 
                value={deliveryLocation} 
                onValueChange={onDeliveryLocationChange} 
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2 border border-amber-300 rounded-lg p-3 bg-white/60">
                  <RadioGroupItem value="kalidas" id="kalidas" />
                  <Label htmlFor="kalidas" className="text-sm cursor-pointer flex-1 font-medium text-amber-800">
                    칼리다스 <span className="text-korean-red font-semibold">(무료)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-amber-300 rounded-lg p-3 bg-white/60">
                  <RadioGroupItem value="kyeongnam" id="kyeongnam" />
                  <Label htmlFor="kyeongnam" className="text-sm cursor-pointer flex-1 font-medium text-amber-800">
                    경남A <span className="text-korean-red font-semibold">(무료)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-amber-300 rounded-lg p-3 bg-white/60">
                  <RadioGroupItem value="kyeongnamB" id="kyeongnamB" />
                  <Label htmlFor="kyeongnamB" className="text-sm cursor-pointer flex-1 font-medium text-amber-800">
                    경남B <span className="text-korean-red font-semibold">(무료)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-amber-300 rounded-lg p-3 bg-white/60">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="text-sm cursor-pointer flex-1 font-medium text-amber-800">
                    기타 <span className="text-orange-600 font-semibold">(30,000VND)</span>
                  </Label>
                </div>
              </RadioGroup>

              {/* Detail Address for known locations */}
              {deliveryLocation && deliveryLocation !== 'other' && (
                <div className="mt-3">
                  <Label htmlFor="detailAddress" className="text-sm font-medium text-amber-800 mb-1 block">
                    상세 주소
                  </Label>
                  <Input
                    id="detailAddress"
                    type="text"
                    placeholder="동호수, 층수 등 상세 주소를 입력하세요"
                    value={detailAddress}
                    onChange={(e) => onDetailAddressChange(e.target.value)}
                    className="text-sm border-amber-300 border-opacity-50 focus:border-korean-red bg-white/80"
                  />
                </div>
              )}

              {/* Custom Address for 'other' location */}
              {deliveryLocation === 'other' && (
                <div className="mt-3">
                  <Label htmlFor="customAddress" className="text-sm font-medium text-amber-800 mb-1 block">
                    주소 입력
                  </Label>
                  <Input
                    id="customAddress"
                    type="text"
                    placeholder="정확한 주소를 입력하세요"
                    value={customAddress}
                    onChange={(e) => onCustomAddressChange(e.target.value)}
                    className="text-sm border-amber-300 border-opacity-50 focus:border-korean-red bg-white/80"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}