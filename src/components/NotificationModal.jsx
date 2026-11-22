import React from 'react';
import { useNotification } from '../context/NotificationContext.jsx';
import { CheckCircleIcon, XMarkIcon } from './Icons.jsx';

export default function NotificationModal() {
  const { modal, closePopup, toasts, removeToast } = useNotification();

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-slate-800'
                : toast.type === 'error'
                ? 'bg-white/95 border-rose-200 text-slate-800'
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
          >
            <div className={`mt-0.5 p-1 rounded-full ${
              toast.type === 'success'
                ? 'bg-emerald-100 text-emerald-600'
                : toast.type === 'error'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <CheckCircleIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-sm font-semibold text-slate-900">{toast.title}</p>}
              <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Pop-up Milestone Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with soft blur */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={closePopup}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all transform animate-scaleUp z-10">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mb-4 shadow-sm">
                <CheckCircleIcon className="w-9 h-9" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full mb-2">
                Action Confirmed
              </span>

              <h3 className="text-xl font-bold text-slate-900">{modal.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{modal.message}</p>

              {modal.details && (
                <div className="mt-4 w-full rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs text-slate-700 font-mono text-left">
                  {modal.details}
                </div>
              )}

              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (modal.onAction) modal.onAction();
                    closePopup();
                  }}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 hover:shadow transition-all duration-150 active:scale-[0.98] border border-slate-900"
                >
                  {modal.actionLabel || 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
