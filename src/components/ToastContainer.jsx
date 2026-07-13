import { useToast } from '../hooks/useToast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 pointer-events-auto animate-[slideInToast_0.3s_ease-out]"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
