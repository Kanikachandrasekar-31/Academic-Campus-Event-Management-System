const ConfirmDialog = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title || 'Confirm Action'}</h5>
          </div>
          <div className="modal-body text-muted">{message || 'Are you sure you want to proceed?'}</div>
          <div className="modal-footer border-0 pt-0">
            <button className="btn btn-light px-4" onClick={onCancel}>Cancel</button>
            <button className="btn btn-danger px-4" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
