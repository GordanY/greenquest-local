import './Modal.css';

interface ModalProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  accessCode?: string;
  onConfirm: () => void;
}

export function Modal({ type, title, message, accessCode, onConfirm }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onConfirm}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <span className="modal-icon">
            {type === 'success' && '✓'}
            {type === 'error' && '⚠'}
            {type === 'warning' && '⚠'}
            {type === 'info' && 'ℹ'}
          </span>
        </div>
        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          <p className="modal-message">{message}</p>
          {accessCode && (
            <div className="access-code-box">
              <p className="access-code-label">課程碼</p>
              <p className="access-code-value">{accessCode}</p>
            </div>
          )}
        </div>
        <button
          className="modal-btn"
          onClick={onConfirm}
        >
          確認
        </button>
      </div>
    </div>
  );
}
