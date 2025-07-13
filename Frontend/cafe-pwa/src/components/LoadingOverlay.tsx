import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay = ({ message = "لطفا صبر کنید..." }: LoadingOverlayProps) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="mt-4 text-lg text-slate-700 dark:text-slate-200">{message}</p>
        </div>
    );
};