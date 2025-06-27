import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import type { MenuItem } from "@shared/schema";

interface MenuGridProps {
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

export function MenuGrid({ menuItems, onAddToCart }: MenuGridProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    soup: true,  // Default open
    noodles: false,
    rice: false,
    meat: false,
    appetizer: false,
    hotpot: false
  });

  const categoryDisplayNames: Record<string, string> = {
    soup: '국물요리 (Soup Dishes)',
    rice: '밥류 (Rice Dishes)', 
    noodles: '면류 (Noodle Dishes)',
    meat: '고기요리 (Meat Dishes)',
    appetizer: '안주/전류 (Appetizers)',
    hotpot: '전골류 (Hot Pot)'
  };

  const categoryOrder = ['soup', 'noodles', 'rice', 'meat', 'appetizer', 'hotpot'];

  const categorizedMenus = menuItems
    .filter(item => item.isVisible !== false) // Only show visible items
    .reduce((acc, item) => {
      const category = item.category || 'main';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-3">
      {categoryOrder
        .filter(category => categorizedMenus[category] && categorizedMenus[category].length > 0)
        .map((category) => {
          const items = categorizedMenus[category];
          return (
            <Collapsible
              key={category}
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between p-4 h-auto border-mannabean-border hover:bg-mannabean-light-green/30 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-bold text-mannabean-text">
                      {categoryDisplayNames[category] || category}
                    </span>
                    <span className="text-sm text-muted-foreground bg-mannabean-green/10 px-2 py-1 rounded-full">
                      {items.length}개
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 text-mannabean-green ${openCategories[category] ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
          
              <CollapsibleContent className="space-y-2 mt-2">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border-mannabean-border">
                    <div className="flex">
                      <div className="relative w-20 h-16 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-l-lg"
                          loading="lazy"
                        />
                        {!item.available && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-l-lg">
                            <span className="text-white text-xs font-bold">품절</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="flex-1 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-3">
                            <h4 className="font-bold text-mannabean-text text-sm mb-1 truncate">{item.name}</h4>
                            <p className="text-red-500 font-bold text-base">{formatPrice(item.price)}</p>
                          </div>
                          <Button
                            onClick={() => onAddToCart(item)}
                            disabled={!item.available}
                            className="bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white font-medium px-4 py-1 rounded-full text-xs flex-shrink-0 transition-colors duration-200"
                            size="sm"
                            variant="outline"
                          >
                            {item.available ? '담기' : '품절'}
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
    </div>
  );
}
