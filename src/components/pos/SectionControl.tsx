import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SectionControlProps {
  workerName: string;
  sectionRevenue: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const SectionControl = ({ workerName, sectionRevenue, isOpen, onOpen, onClose }: SectionControlProps) => {
  const [openStartDialog, setOpenStartDialog] = useState(false);
  const [openCloseDialog, setOpenCloseDialog] = useState(false);

  const handleOpenClick = () => {
    setOpenStartDialog(true);
  };

  const handleCloseClick = () => {
    setOpenCloseDialog(true);
  };

  const handleConfirmOpen = () => {
    setOpenStartDialog(false);
    onOpen();
  };

  const handleConfirmClose = () => {
    setOpenCloseDialog(false);
    onClose();
  };

  return (
    <>
      <div
        className="px-4 pt-4 pb-3 border-b border-border bg-background sticky top-0 z-30"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">العامل</p>
            <p className="font-semibold text-foreground">{workerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">إجمالي الجلسة</p>
            <p className="text-xl font-bold text-foreground tabular-nums">
              {sectionRevenue.toLocaleString()} دج
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isOpen ? (
            <Button onClick={handleOpenClick} className="flex-1 h-10 rounded-xl text-sm font-medium">
              فتح الجلسة
            </Button>
          ) : (
            <Button
              onClick={handleCloseClick}
              variant="outline"
              className="flex-1 h-10 rounded-xl text-sm font-medium"
            >
              إغلاق الجلسة
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Opening Session */}
      <AlertDialog open={openStartDialog} onOpenChange={setOpenStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد فتح الجلسة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من فتح جلسة جديدة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOpen}>نعم، فتح الجلسة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Closing Session */}
      <AlertDialog open={openCloseDialog} onOpenChange={setOpenCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إغلاق الجلسة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إغلاق الجلسة؟ سيتم تسجيل الخروج من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>نعم، إغلاق الجلسة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SectionControl;
