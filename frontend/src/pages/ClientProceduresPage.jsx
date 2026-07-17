import React, { useEffect, useState } from 'react';
import { clientProceduresApi, clientsApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { client_id: '', title: '', steps: '', is_active: 1 };

export default function ClientProceduresPage() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const [procedures, setProcedures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (clientFilter) params.client_id = clientFilter;
      if (search) params.search = search;
      const [pRes, cRes] = await Promise.all([clientProceduresApi.getAll(params), clientsApi.getAll()]);
      setProcedures(pRes.data); setClients(cRes.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [clientFilter, search]);

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add' }); };
  const openEdit = (p) => { setForm({ ...p }); setModal({ open: true, mode: 'edit', data: p }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await clientProceduresApi.create(form); toast.success('Thêm quy trình thành công!'); }
      else { await clientProceduresApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetchData(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await clientProceduresApi.delete(confirmId); toast.success('Đã xóa'); setConfirmId(null); fetchData(); }
    catch { toast.error('Không thể xóa'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>📝 Quy Trình Hỗ Trợ</h2><p>Quy trình và các bước xử lý khi nhận cuộc gọi hỗ trợ từ khách hàng</p></div>
        {isAdminOrManager && (
          <button id="add-proc-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} />Thêm Quy Trình</button>
        )}
      </div>
      <div className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <div className="search-input-wrap" style={{ flex: '1 1 200px' }}>
          <Search size={16} />
          <input id="proc-search" className="form-control search-input" placeholder="Tìm theo tên quy trình..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
        </div>
        <select id="proc-client-filter" className="filter-select" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">Tất cả khách hàng</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
      </div>
      <div className="table-container">
        <div className="table-header"><h3>Danh Sách Quy Trình ({procedures.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead><tr><th>Khách Hàng</th><th>Tên Quy Trình</th><th>Chi Tiết Các Bước Xử Lý</th><th>Trạng Trái</th>{isAdminOrManager && <th>Hành Động</th>}</tr></thead>
            <tbody>
              {procedures.length === 0 ? (
                <tr><td colSpan={isAdminOrManager ? 5 : 4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : procedures.map(p => (
                <tr key={p.id}>
                  <td>{p.client?.company_name || '-'}</td>
                  <td><strong>{p.title}</strong></td>
                  <td style={{ maxWidth: '400px', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{p.steps || '-'}</td>
                  <td><Badge status={p.is_active ? 'active' : 'inactive'} /></td>
                  {isAdminOrManager && (
                    <td>
                      <div className="action-btns">
                        <button id={`edit-proc-${p.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                        <button id={`delete-proc-${p.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(p.id)}><Trash2 size={13} /></button>
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
        title={modal.mode === 'add' ? '➕ Thêm Quy Trình' : '✏️ Sửa Quy Trình'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-proc-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <div className="form-group"><label className="form-label">Khách Hàng *</label>
          <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
            <option value="">Chọn khách hàng...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Tên Quy Trình *</label>
          <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="VD: Quy trình xử lý lỗi tủ lạnh Toshiba" /></div>
        <div className="form-group"><label className="form-label">Chi Tiết Các Bước Xử Lý *</label>
          <textarea className="form-control" rows={6} value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })} placeholder="1. Hỏi thăm tình trạng khách hàng&#10;2. Xác minh thông tin hóa đơn mua hàng&#10;3. Hướng dẫn reset nút nguồn..." /></div>
        <div className="form-group"><label className="form-label">Trạng Thái</label>
          <select className="form-control" value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value })}>
            <option value={1}>Active</option><option value={0}>Inactive</option>
          </select></div>
      </Modal>
      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Xóa quy trình này?" />
    </div>
  );
}
