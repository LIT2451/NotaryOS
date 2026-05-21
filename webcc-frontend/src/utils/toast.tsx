import toast from 'react-hot-toast';
import { Check, X } from '@phosphor-icons/react';

export const showSuccess = (message: string, description?: string) => {
  toast.custom((t) => (
    <div className={`custom-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
      <div className="toast-content">
        <div className="toast-left">
          <div className="toast-icon">
            <Check size={24} weight="bold" />
          </div>
          <div className="toast-text">
            <p className="toast-title">{message}</p>
            {description && <p className="toast-desc">{description}</p>}
          </div>
        </div>
        <button className="toast-close" onClick={() => toast.dismiss(t.id)}>
          <X size={20} weight="bold" />
        </button>
      </div>
    </div>
  ), {
    duration: 3000,
    position: 'top-right',
  });
};

export const showError = (message: string, description?: string) => {
  toast.custom((t) => (
    <div className={`custom-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
      <div className="toast-content" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <div className="toast-left">
          <div className="toast-icon" style={{ color: '#ef4444' }}>
            <X size={24} weight="bold" />
          </div>
          <div className="toast-text">
            <p className="toast-title">{message}</p>
            {description && <p className="toast-desc">{description}</p>}
          </div>
        </div>
        <button className="toast-close" onClick={() => toast.dismiss(t.id)}>
          <X size={20} weight="bold" />
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right',
  });
};
