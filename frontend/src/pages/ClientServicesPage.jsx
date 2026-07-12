import React, { useEffect, useState } from 'react';
import { clientServicesApi, clientsApi, servicesApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { client_id: '', service_id: '', num_employees: 1, start_date: '', end_date: '', status: 'active', notes: '' };

export default function ClientServicesPage() {
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lRes, cRes, sRes] = await Promise.all([clientServicesApi.getAll(), clientsApi.getAll(), servicesApi.getAll()]);
      setList(lRes.data); setClients(cRes.data); setServices(sRes.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Tính phí preview
  useEffect(() => {
    if (form.service_id && form.num_employees && form.start_date) {
      const svc = services.find(s => String(s.id) === String(form.service_id));
      if (svc) {
        const start = new Date(form.start_date);
        const end = form.end_date ? new Date(form.end_date) : new Date();
        const days = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);
        const total = svc.charge_per_day * form.num_employees * days;
        setPreview({ days, total, daily: svc.charge_per_day });
      }
    } else setPreview(null);
  }, [form.service_id, form.num_employees, form.start_date, form.end_date, services]);

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add' }); };
  const openEdit = (cs) => { setForm({ ...cs }); setModal({ open: true, mode: 'edit', data: cs }); };
  const closeModal = () => { setModal({ open: false, mode: '', data: null }); setPreview(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await clientServicesApi.create(form); toast.success('Đăng ký dịch vụ thành công!'); }
      else { await clientServicesApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetchData(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await clientServicesApi.delete(confirmId); toast.success('Đã xóa'); setConfirmId(null); fetchData(); }
    catch { toast.error('Không thể xóa'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>📋 Đăng Ký Dịch Vụ</h2><p>Dịch vụ ECS mà khách hàng đã đăng ký</p></div>
        <button id="add-cs-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} />Đăng Ký Mới</button>
      </div>
      <div className="table-container">
        <div className="table-header"><h3>Danh Sách Đăng Ký ({list.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead><tr><th>Khách Hàng</th><th>Dịch Vụ</th><th>Số NV</th><th>Ngày Bắt Đầu</th><th>Ngày Kết Thúc</th><th>Tổng Phí</th><th>Trạng Thái</th><th>Hành Động</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : list.map(cs => (
                <tr key={cs.id}>
                  <td><strong>{cs.client?.company_name}</strong></td>
                  <td><Badge type={cs.service?.type} /> <span style={{ fontSize: '12px', marginLeft: '4px' }}>{cs.service?.name}</span></td>
                  <td>{cs.num_employees} NV</td>
                  <td>{cs.start_date ? new Date(cs.start_date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>{cs.end_date ? new Date(cs.end_date).toLocaleDateString('vi-VN') : <span style={{ color: 'var(--success)' }}>Đang chạy</span>}</td>
                  <td><strong style={{ color: 'var(--accent)' }}>{cs.total_charge ? `$${Number(cs.total_charge).toLocaleString()}` : '-'}</strong></td>
                  <td><Badge status={cs.status} /></td>
                  <td>
                    <div className="action-btns">
                      <button id={`edit-cs-${cs.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(cs)}><Edit2 size={13} /></button>
                      <button id={`delete-cs-${cs.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(cs.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal.open} onClose={closeModal} size="modal-lg"
        title={modal.mode === 'add' ? '➕ Đăng Ký Dịch Vụ' : '✏️ Sửa Đăng Ký'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-cs-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Khách Hàng *</label>
            <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Chọn khách hàng...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Dịch Vụ *</label>
            <select className="form-control" value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}>
              <option value="">Chọn dịch vụ...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.charge_per_day}/ngày/NV)</option>)}
            </select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Số Nhân Viên *</label>
            <input className="form-control" type="number" min="1" value={form.num_employees} onChange={e => setForm({ ...form, num_employees: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Trạng Thái</label>
            <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Ngày Bắt Đầu *</label>
            <input className="form-control" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Ngày Kết Thúc (để trống = đang chạy)</label>
            <input className="form-control" type="date" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
        </div>
        {/* Preview tính phí */}
        {preview && (
          <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Calculator size={16} color="#3b82f6" />
              <strong style={{ fontSize: '14px' }}>Tính Phí Tự Động</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              ${preview.daily.toLocaleString()} × {form.num_employees} NV × {preview.days} ngày = <strong style={{ color: 'var(--accent)', fontSize: '16px' }}>${preview.total.toLocaleString()}</strong>
            </p>
          </div>
        )}
        <div className="form-group"><label className="form-label">Ghi Chú</label>
          <textarea className="form-control" rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </Modal>
      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Xóa đăng ký dịch vụ này?" />
    </div>
  );
}
