import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const ToastContainer = () => {
    const { toasts, dismissToast } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-primary" />;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'success': return 'border-emerald-200 bg-emerald-50';
            case 'warning': return 'border-amber-200 bg-amber-50';
            case 'error': return 'border-red-200 bg-red-50';
            default: return 'border-primary/20 bg-primary/5';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300 ${getStyles(toast.type)}`}
                >
                    {getIcon(toast.type)}
                    <p className="flex-1 text-sm font-medium text-slate-800">{toast.message}</p>
                    <button
                        onClick={() => dismissToast(toast.id)}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
