import React, { useEffect, useState } from 'react';
import { clientsApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  client_code: '', company_name: '', contact_person: '', email: '',
  phone: '', address: '', city: '', country: 'Vietnam', industry: '', status: 'active', notes: ''
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await clientsApi.getAll(params);
      setClients(res.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, [search, statusFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (c) => { setForm({ ...c }); setModal({ open: true, mode: 'edit', data: c }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await clientsApi.create(form);
        toast.success('Thêm khách hàng thành công!');
      } else {
        await clientsApi.update(modal.data.id, form);
        toast.success('Cập nhật thành công!');
      }
      fetchClients(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await clientsApi.delete(confirmId);
      toast.success('Đã xóa khách hàng');
      setConfirmId(null); fetchClients();
    } catch { toast.error('Không thể xóa'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>🏢 Khách Hàng</h2><p>Quản lý thông tin khách hàng của ECS</p></div>
        <button id="add-client-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Thêm Khách Hàng
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input id="client-search" className="form-control search-input" placeholder="Tìm kiếm công ty, mã KH, email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="status-filter" className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Khách Hàng ({clients.length})</h3>
        </div>
        {loading ? <Loading /> : (
          <table>
            <thead>
              <tr>
                <th>Mã KH</th><th>Tên Công Ty</th><th>Người Liên Hệ</th>
                <th>Email</th><th>Thành Phố</th><th>Ngành</th>
                <th>Dịch Vụ</th><th>Trạng Thái</th><th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : clients.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.client_code}</strong></td>
                  <td><strong>{c.company_name}</strong></td>
                  <td>{c.contact_person}</td>
                  <td style={{ fontSize: '12px' }}>{c.email}</td>
                  <td>{c.city || '-'}</td>
                  <td>{c.industry || '-'}</td>
                  <td>
                    {c.clientServices?.length > 0
                      ? c.clientServices.map(s => <span key={s.id} style={{ marginRight: 4 }}><Badge type={s.service?.type} /></span>)
                      : <span className="text-muted">-</span>}
                  </td>
                  <td><Badge status={c.status} /></td>
                  <td>
                    <div className="action-btns">
                      <button id={`edit-client-${c.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(c)} title="Sửa">
                        <Edit2 size={13} />
                      </button>
                      <button id={`delete-client-${c.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(c.id)} title="Xóa">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal.open} onClose={closeModal}
        title={modal.mode === 'add' ? '➕ Thêm Khách Hàng' : '✏️ Sửa Khách Hàng'}
        size="modal-lg"
        footer={<>
          <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-client-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </>}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Mã KH *</label>
            <input className="form-control" value={form.client_code} onChange={e => setForm({ ...form, client_code: e.target.value })} placeholder="VD: CLI006" />
          </div>
          <div className="form-group">
            <label className="form-label">Trạng Thái</label>
            <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Tên Công Ty *</label>
          <input className="form-control" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="Nhập tên công ty..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Người Liên Hệ *</label>
            <input className="form-control" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Điện Thoại</label>
            <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Ngành Nghề</label>
            <input className="form-control" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="VD: Electronics, IT..." />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Thành Phố</label>
            <input className="form-control" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Quốc Gia</label>
            <input className="form-control" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Địa Chỉ</label>
          <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Ghi Chú</label>
          <textarea className="form-control" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>

      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={handleDelete} message="Bạn có chắc muốn xóa khách hàng này không? Tất cả dữ liệu liên quan sẽ bị xóa." />
    </div>
  );
}
