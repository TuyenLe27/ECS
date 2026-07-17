import React, { useEffect, useState } from 'react';
import { paymentsApi, clientsApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Search, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  client_id: '', client_service_id: '', invoice_no: '', amount: '',
  due_date: '', paid_date: '', payment_method: 'bank_transfer', status: 'pending', notes: ''
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [reminderModal, setReminderModal] = useState({ open: false, email: null, clientName: '' });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (clientFilter) params.client_id = clientFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const [pRes, cRes] = await Promise.all([paymentsApi.getAll(params), clientsApi.getAll()]);
      setPayments(pRes.data); setClients(cRes.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter, clientFilter, dateFrom, dateTo]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (p) => { setForm({ ...p, client_id: p.client_id || '', amount: p.amount || '' }); setModal({ open: true, mode: 'edit', data: p }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const markPaid = async (id) => {
    try {
      await paymentsApi.update(id, { status: 'paid', paid_date: new Date().toISOString().split('T')[0] });
      toast.success('Đánh dấu đã thanh toán!'); fetchData();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const sendReminder = async (p) => {
    try {
      const res = await paymentsApi.sendReminder(p.id);
      setReminderModal({ open: true, email: res.data.email, clientName: p.client?.company_name });
      toast.success('Đã gửi email nhắc nợ và tạo Call Log!');
      fetchData();
    } catch {
      toast.error('Gửi nhắc nợ thất bại');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await paymentsApi.create(form); toast.success('Tạo thanh toán thành công!'); }
      else { await paymentsApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetchData(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await paymentsApi.delete(confirmId);
      toast.success('Đã xóa'); setConfirmId(null); fetchData();
    } catch { toast.error('Không thể xóa'); }
  };

  // Client-side search filter on invoice_no and company_name
  const filtered = payments.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.invoice_no?.toLowerCase().includes(term) ||
           p.client?.company_name?.toLowerCase().includes(term);
  });

  const overdueCount = payments.filter(p => p.status === 'overdue').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>💳 Thanh Toán</h2>
          <p>Quản lý hóa đơn và thanh toán của khách hàng</p>
        </div>
        <button id="add-payment-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Tạo Hóa Đơn</button>
      </div>

      {overdueCount > 0 && (
        <div className="alert-banner danger">
          <AlertTriangle size={18} />
          <span>{overdueCount} hóa đơn đã quá hạn thanh toán!</span>
        </div>
      )}

      {/* Advanced Search & Filters */}
      <div className="filters-bar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <div className="search-input-wrap" style={{ flex: '1 1 200px' }}>
          <Search size={16} />
          <input id="payment-search" className="form-control search-input"
            placeholder="Tìm số HĐ, tên khách hàng..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%' }} />
        </div>
        <select id="payment-client-filter" className="filter-select" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">Tất cả khách hàng</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
        <select id="payment-status-filter" className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
        <div className="date-range-group">
          <label>Từ</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <label style={{ marginLeft: 4 }}>Đến</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          {(dateFrom || dateTo) && (
            <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }}
              onClick={() => { setDateFrom(''); setDateTo(''); }}>✕</button>
          )}
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Hóa Đơn ({filtered.length}{filtered.length !== payments.length ? ` / ${payments.length}` : ''})</h3>
        </div>
        {loading ? <Loading /> : (
          <table>
            <thead>
              <tr>
                <th>Số HĐ</th><th>Khách Hàng</th><th>Số Tiền</th>
                <th>Hạn TT</th><th>Ngày TT</th><th>Phương Thức</th>
                <th>Trạng Thái</th><th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.invoice_no}</strong></td>
                  <td><strong>{p.client?.company_name || '-'}</strong></td>
                  <td><strong style={{ color: 'var(--success)' }}>${Number(p.amount).toLocaleString()}</strong></td>
                  <td style={{ color: p.status === 'overdue' ? 'var(--danger)' : 'inherit' }}>
                    {new Date(p.due_date).toLocaleDateString('vi-VN')}
                    {p.status === 'overdue' && (
                      <span style={{ marginLeft: 4, fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1px 5px', borderRadius: 4 }}>
                        {Math.floor((Date.now() - new Date(p.due_date)) / 86400000)} ngày
                      </span>
                    )}
                  </td>
                  <td>{p.paid_date ? new Date(p.paid_date).toLocaleDateString('vi-VN') : <span className="text-muted">-</span>}</td>
                  <td style={{ fontSize: '12px' }}>{p.payment_method}</td>
                  <td><Badge status={p.status} /></td>
                  <td>
                    <div className="action-btns">
                      {p.status !== 'paid' && (
                        <button id={`mark-paid-${p.id}`} className="btn btn-sm btn-success" onClick={() => markPaid(p.id)} title="Đánh dấu đã TT">
                          <CheckCircle size={13} />
                        </button>
                      )}
                      {p.status === 'overdue' && (
                        <button id={`remind-${p.id}`} className="btn btn-sm btn-warning" onClick={() => sendReminder(p)} title="Gửi nhắc nợ qua email">
                          <Bell size={13} />
                        </button>
                      )}
                      <button id={`edit-payment-${p.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(p)} title="Sửa"><Edit2 size={13} /></button>
                      <button id={`delete-payment-${p.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(p.id)} title="Xóa"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal}
        title={modal.mode === 'add' ? '➕ Tạo Hóa Đơn' : '✏️ Sửa Hóa Đơn'}
        footer={<>
          <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-payment-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </>}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Số Hóa Đơn *</label>
            <input className="form-control" value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} placeholder="INV-2024-XXX" />
          </div>
          <div className="form-group">
            <label className="form-label">Khách Hàng *</label>
            <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Chọn khách hàng...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Số Tiền ($) *</label>
            <input className="form-control" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phương Thức TT</label>
            <select className="form-control" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hạn Thanh Toán *</label>
            <input className="form-control" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Ngày Đã Thanh Toán</label>
            <input className="form-control" type="date" value={form.paid_date || ''} onChange={e => setForm({ ...form, paid_date: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Trạng Thái</label>
          <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Ghi Chú</label>
          <textarea className="form-control" rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>

      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Bạn có chắc muốn xóa hóa đơn này không?" />

      {/* Reminder Email Modal */}
      <Modal isOpen={reminderModal.open} onClose={() => setReminderModal({ open: false, email: null })}
        title={`✉️ Preview Email Nhắc Nợ - ${reminderModal.clientName}`}
        footer={<button className="btn btn-primary" onClick={() => setReminderModal({ open: false, email: null })}>Đóng</button>}>
        {reminderModal.email && (
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
            <p style={{ margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
              <strong>Tiêu đề:</strong> <span style={{ color: 'var(--success)' }}>{reminderModal.email.subject}</span>
            </p>
            <div style={{ marginTop: '12px', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#f1f5f9' }}>
              {reminderModal.email.body}
            </div>
            <p style={{ marginTop: '16px', margin: 0, padding: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', fontSize: '11px', color: '#3b82f6', textAlign: 'center' }}>
              ℹ️ Một cuộc gọi đi (Outbound Call Log) đã được ghi nhận tự động vào hệ thống.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
