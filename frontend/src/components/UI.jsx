import React from 'react';

export function Badge({ status, type }) {
  const val = status || type || '';
  return <span className={`badge badge-${val.toLowerCase().replace(' ', '_')}`}>{val}</span>;
}

export function StatCard({ value, label, icon, color = 'blue' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function Loading() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
}

export function EmptyState({ message = 'Không có dữ liệu' }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header"><h3>⚠️ Xác Nhận</h3></div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn btn-danger" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}
