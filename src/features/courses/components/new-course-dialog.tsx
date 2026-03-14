// src/features/courses/components/new-course-dialog.tsx
// Dialog shown when admin clicks "Add Course" — lets them choose between
// building from scratch OR importing a curriculum JSON file.
import { useNavigate } from 'react-router-dom';
import { FileJson, Pencil } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { ROUTES } from '@/shared/constants';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewCourseDialog({ open, onClose }: Props) {
  const navigate = useNavigate();

  const go = (path: string) => { onClose(); navigate(path); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>إضافة كورس جديد</DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            اختر طريقة إنشاء الكورس
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 pt-2'>
          {/* Build from scratch */}
          <button
            onClick={() => go(ROUTES.COURSE_CREATE)}
            className='group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-muted/20 p-6 text-center transition-all hover:border-primary hover:bg-primary/5'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-background transition-colors group-hover:border-primary group-hover:bg-primary/10'>
              <Pencil className='h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary' />
            </div>
            <div>
              <p className='font-semibold text-sm'>بناء من الصفر</p>
              <p className='text-xs text-muted-foreground mt-0.5'>إنشاء كورس فارغ وملء البيانات يدويًا</p>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => go('/courses/import')}
            className='group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-muted/20 p-6 text-center transition-all hover:border-primary hover:bg-primary/5'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-background transition-colors group-hover:border-primary group-hover:bg-primary/10'>
              <FileJson className='h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary' />
            </div>
            <div>
              <p className='font-semibold text-sm'>استيراد JSON</p>
              <p className='text-xs text-muted-foreground mt-0.5'>رفع ملف JSON لإنشاء الكورس تلقائيًا</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
