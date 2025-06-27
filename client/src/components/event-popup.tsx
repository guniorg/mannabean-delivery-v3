import { useState, useEffect } from "react";
import { useActivePopup } from "@/hooks/use-popups";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function EventPopup() {
  // 임시로 팝업 기능을 비활성화하여 오류 방지
  return null;
  
  /*
  const { data: popup, isLoading } = useActivePopup();
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    if (popup && !hasBeenShown) {
      setIsOpen(true);
      setHasBeenShown(true);
    }
  }, [popup, hasBeenShown]);

  if (isLoading || !popup) {
    return null;
  }
  */

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 bg-white rounded-lg shadow-2xl border-4 border-korean-red">
        <div className="relative">
          <DialogTitle className="sr-only">{popup.title}</DialogTitle>
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 z-50 bg-white/80 hover:bg-white text-korean-red rounded-full p-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Popup Content */}
          <div className="p-6">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-korean-red mb-4 text-center">
              {popup.title}
            </h2>

            {/* Image */}
            {popup.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={popup.imageUrl}
                  alt={popup.title}
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}

            {/* Description */}
            {popup.description && (
              <div className="mb-6">
                <p className="text-korean-dark text-center whitespace-pre-line leading-relaxed">
                  {popup.description}
                </p>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-mannabean-green hover:bg-mannabean-green/90 text-white px-8 py-2 rounded-full font-medium"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}