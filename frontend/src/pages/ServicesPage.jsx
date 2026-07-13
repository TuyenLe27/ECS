import React, { useEffect, useState } from 'react';
import { servicesApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { name: '', type: 'inbound', description: '', charge_per_day: '', is_active: 1 };

export default function ServicesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const res = await servicesApi.getAll(); setServices(res.data); }
    catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (s) => { setForm({ ...s }); setModal({ open: true, mode: 'edit', data: s }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await servicesApi.create(form); toast.success('Thêm dịch vụ thành công!'); }
      else { await servicesApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetch(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await servicesApi.delete(confirmId); toast.success('Đã xóa'); setConfirmId(null); fetch(); }
    catch { toast.error('Không thể xóa (dịch vụ đang được sử dụng)'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>⚙️ Dịch Vụ</h2><p>Quản lý biểu phí và loại dịch vụ ECS</p></div>
        {isAdmin && (
          <button id="add-service-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} />Thêm Dịch Vụ</button>
        )}
      </div>

      {/* Price summary cards - dynamic from DB */}
      <div className="grid-3 mb-4">
        {[
          { label: 'In-bound', color: '#3b82f6', type: 'inbound' },
          { label: 'Out-bound', color: '#8b5cf6', type: 'outbound' },
          { label: 'Tele Marketing', color: '#f59e0b', type: 'telemarketing' },
        ].map(({ label, color, type }) => {
          const typeServices = services.filter(s => s.type === type && s.is_active);
          const avgPrice = typeServices.length > 0
            ? typeServices.reduce((sum, s) => sum + Number(s.charge_per_day), 0) / typeServices.length
            : 0;
          return (
            <div key={type} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color }}>
                {typeServices.length > 0 ? `$${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{label} / ngày / nhân viên</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({typeServices.length} dịch vụ)</div>
            </div>
          );
        })}
      </div>

      <div className="table-container">
        <div className="table-header"><h3>Danh Sách Dịch Vụ ({services.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead><tr><th>Tên Dịch Vụ</th><th>Loại</th><th>Phí/Ngày/NV</th><th>Mô Tả</th><th>Trạng Thái</th>{isAdmin && <th>Hành Động</th>}</tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td><Badge type={s.type} /></td>
                  <td><strong style={{ color: 'var(--success)' }}>${Number(s.charge_per_day).toLocaleString()}</strong></td>
                  <td style={{ maxWidth: '300px' }}>{s.description || '-'}</td>
                  <td><Badge status={s.is_active ? 'active' : 'inactive'} /></td>
                  {isAdmin && (
                    <td>
                      <div className="action-btns">
                        <button id={`edit-service-${s.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}><Edit2 size={13} /></button>
                        <button id={`delete-service-${s.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(s.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal}
        title={modal.mode === 'add' ? '➕ Thêm Dịch Vụ' : '✏️ Sửa Dịch Vụ'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-service-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <div className="form-group">
          <label className="form-label">Tên Dịch Vụ *</label>
          <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Loại Dịch Vụ *</label>
            <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="inbound">In-bound</option>
              <option value="outbound">Out-bound</option>
              <option value="telemarketing">Tele Marketing</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Phí/Ngày/NV ($) *</label>
            <input className="form-control" type="number" value={form.charge_per_day} onChange={e => setForm({ ...form, charge_per_day: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Mô Tả</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Trạng Thái</label>
          <select className="form-control" value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value })}>
            <option value={1}>Active</option><option value={0}>Inactive</option>
          </select>
        </div>
      </Modal>
      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Xóa dịch vụ này?" />
    </div>
  );
}
