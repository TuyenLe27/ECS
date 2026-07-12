import React, { useEffect, useState } from 'react';
import { clientProductsApi, clientsApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { client_id: '', product_name: '', category: '', description: '', price: '', is_active: 1 };

export default function ClientProductsPage() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const [pRes, cRes] = await Promise.all([clientProductsApi.getAll(params), clientsApi.getAll()]);
      setProducts(pRes.data); setClients(cRes.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [clientFilter]);

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add' }); };
  const openEdit = (p) => { setForm({ ...p }); setModal({ open: true, mode: 'edit', data: p }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await clientProductsApi.create(form); toast.success('Thêm sản phẩm thành công!'); }
      else { await clientProductsApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetchData(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await clientProductsApi.delete(confirmId); toast.success('Đã xóa'); setConfirmId(null); fetchData(); }
    catch { toast.error('Không thể xóa'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>📦 Sản Phẩm Khách Hàng</h2><p>Sản phẩm/dịch vụ mà khách hàng cung cấp</p></div>
        <button id="add-product-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} />Thêm Sản Phẩm</button>
      </div>
      <div className="filters-bar">
        <select id="product-client-filter" className="filter-select" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">Tất cả khách hàng</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
      </div>
      <div className="table-container">
        <div className="table-header"><h3>Danh Sách Sản Phẩm ({products.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead><tr><th>Khách Hàng</th><th>Tên Sản Phẩm</th><th>Danh Mục</th><th>Giá</th><th>Mô Tả</th><th>Trạng Thái</th><th>Hành Động</th></tr></thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>{p.client?.company_name || '-'}</td>
                  <td><strong>{p.product_name}</strong></td>
                  <td>{p.category || '-'}</td>
                  <td>{p.price ? `$${Number(p.price).toLocaleString()}` : '-'}</td>
                  <td style={{ maxWidth: '250px', fontSize: '12px' }}>{p.description || '-'}</td>
                  <td><Badge status={p.is_active ? 'active' : 'inactive'} /></td>
                  <td>
                    <div className="action-btns">
                      <button id={`edit-product-${p.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                      <button id={`delete-product-${p.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(p.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal.open} onClose={closeModal}
        title={modal.mode === 'add' ? '➕ Thêm Sản Phẩm' : '✏️ Sửa Sản Phẩm'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-product-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <div className="form-group"><label className="form-label">Khách Hàng *</label>
          <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
            <option value="">Chọn khách hàng...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Tên Sản Phẩm *</label>
            <input className="form-control" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Danh Mục</label>
            <input className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="VD: Electronics, Software..." /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Giá ($)</label>
            <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Trạng Thái</label>
            <select className="form-control" value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value })}>
              <option value={1}>Active</option><option value={0}>Inactive</option>
            </select></div>
        </div>
        <div className="form-group"><label className="form-label">Mô Tả</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      </Modal>
      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Xóa sản phẩm này?" />
    </div>
  );
}
