import React, { useEffect, useState } from 'react';
import { callLogsApi, clientsApi, employeesApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2, Phone, Volume2, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

const EMPTY = { client_id: '', employee_id: '', call_type: 'inbound', call_datetime: '', duration_minutes: 0, purpose: '', outcome: 'resolved', notes: '', recording_url: '' };

export default function CallLogsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';
  const [logs, setLogs] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [audioModal, setAudioModal] = useState({ open: false, url: '', title: '' });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.call_type = typeFilter;
      if (employeeFilter) params.employee_id = employeeFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const [lRes, cRes, eRes] = await Promise.all([
        callLogsApi.getAll(params), clientsApi.getAll(), employeesApi.getAll()
      ]);
      setLogs(lRes.data); setClients(cRes.data); setEmployees(eRes.data);
    } catch {
      if (!isSilent) toast.error('Lỗi tải dữ liệu');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    // Tự động làm mới 10s/lần ở chế độ im lặng để cập nhật file ghi âm sau khi Twilio hoàn tất mã hóa MP3
    const timer = setInterval(() => {
      fetchData(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [typeFilter, employeeFilter, dateFrom, dateTo]);

  const openAdd = () => {
    const base = { ...EMPTY, call_datetime: new Date().toISOString().slice(0, 16) };
    setForm(base);
    setModal({ open: true, mode: 'add' });
  };
  const openEdit = (l) => { setForm({ ...l, call_datetime: l.call_datetime?.slice(0, 16) }); setModal({ open: true, mode: 'edit', data: l }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await callLogsApi.create(form); toast.success('Tạo call log thành công!'); }
      else { await callLogsApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetchData(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await callLogsApi.delete(confirmId); toast.success('Đã xóa'); setConfirmId(null); fetchData(); }
    catch { toast.error('Không thể xóa'); }
  };

  const playRecording = (l) => {
    if (!l.recording_url) return toast.error('Cuộc gọi này không có file ghi âm');
    const proxyUrl = `${API_BASE_URL}/twilio/recording-proxy?url=${encodeURIComponent(l.recording_url)}`;
    const empName = l.employee ? `${l.employee.last_name} ${l.employee.first_name}` : '';
    setAudioModal({
      open: true,
      url: proxyUrl,
      title: `🎧 Ghi âm: ${l.client?.company_name || 'Khách hàng'} — ${empName} (${new Date(l.call_datetime).toLocaleDateString('vi-VN')})`,
    });
  };

  const downloadRecording = (l) => {
    if (!l.recording_url) return toast.error('Cuộc gọi này không có file ghi âm');
    const downloadUrl = `${API_BASE_URL}/twilio/recording-proxy?url=${encodeURIComponent(l.recording_url)}&download=1`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `recording-${l.id}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Đang tải file ghi âm...');
  };

  const outcomeColor = { resolved: 'success', callback: 'warning', no_answer: 'danger', escalated: 'danger', completed: 'active' };

  return (
    <div>
      <div className="page-header">
        <div><h2>📞 Call Logs</h2><p>Lịch sử cuộc gọi & file ghi âm trò chuyện</p></div>
        <button id="add-calllog-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} />Thêm Call Log</button>
      </div>
      <div className="filters-bar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <select id="calltype-filter" className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option value="inbound">In-bound</option>
          <option value="outbound">Out-bound</option>
          <option value="telemarketing">Tele Marketing</option>
        </select>
        {!isStaff && (
          <select id="calllog-employee-filter" className="filter-select" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
            <option value="">Tất cả nhân viên</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.last_name} {e.first_name}</option>)}
          </select>
        )}
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
        <div className="table-header"><h3>Lịch Sử Cuộc Gọi ({logs.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead><tr><th>Thời Gian</th><th>Khách Hàng</th><th>Nhân Viên</th><th>Loại</th><th>Thời Lượng</th><th>Mục Đích</th><th>Kết Quả</th><th>File Ghi Âm</th><th>Hành Động</th></tr></thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : logs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontSize: '12px' }}>{new Date(l.call_datetime).toLocaleString('vi-VN')}</td>
                  <td><strong>{l.client?.company_name}</strong></td>
                  <td>{l.employee ? `${l.employee.last_name} ${l.employee.first_name}` : '-'}</td>
                  <td><Badge type={l.call_type} /></td>
                  <td>{l.duration_minutes} phút</td>
                  <td style={{ maxWidth: '180px', fontSize: '12px' }}>{l.purpose || '-'}</td>
                  <td>
                    <span className={`text-${outcomeColor[l.outcome] || 'muted'}`} style={{ fontSize: '12px', fontWeight: 600 }}>{l.outcome}</span>
                  </td>
                  <td>
                    {l.recording_url ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => playRecording(l)}
                          title="Nghe file ghi âm"
                        >
                          <Volume2 size={13} /> Nghe
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => downloadRecording(l)}
                          title="Tải file ghi âm MP3 về máy"
                        >
                          <Download size={13} /> Tải MP3
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Không có</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button id={`edit-log-${l.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(l)}><Edit2 size={13} /></button>
                      <button id={`delete-log-${l.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(l.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal.open} onClose={closeModal} size="modal-lg"
        title={modal.mode === 'add' ? '📞 Thêm Call Log' : '✏️ Sửa Call Log'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-calllog-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Khách Hàng *</label>
            <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Chọn khách hàng...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select></div>
          {!isStaff && (
            <div className="form-group"><label className="form-label">Nhân Viên *</label>
              <select className="form-control" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                <option value="">Chọn nhân viên...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.last_name} {e.first_name} ({e.emp_code})</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Loại Cuộc Gọi *</label>
            <select className="form-control" value={form.call_type} onChange={e => setForm({ ...form, call_type: e.target.value })}>
              <option value="inbound">In-bound</option>
              <option value="outbound">Out-bound</option>
              <option value="telemarketing">Tele Marketing</option>
            </select></div>
          <div className="form-group"><label className="form-label">Thời Gian *</label>
            <input className="form-control" type="datetime-local" value={form.call_datetime} onChange={e => setForm({ ...form, call_datetime: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Thời Lượng (phút)</label>
            <input className="form-control" type="number" min="0" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Kết Quả</label>
            <select className="form-control" value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })}>
              <option value="resolved">Resolved</option>
              <option value="callback">Callback</option>
              <option value="no_answer">No Answer</option>
              <option value="escalated">Escalated</option>
              <option value="completed">Completed</option>
            </select></div>
        </div>
        <div className="form-group"><label className="form-label">Mục Đích Cuộc Gọi</label>
          <input className="form-control" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">URL File Ghi Âm (Tùy chọn)</label>
          <input className="form-control" value={form.recording_url || ''} onChange={e => setForm({ ...form, recording_url: e.target.value })} placeholder="https://api.twilio.com/..." /></div>
        <div className="form-group"><label className="form-label">Ghi Chú</label>
          <textarea className="form-control" rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </Modal>
      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Xóa call log này?" />

      {/* Audio Player Modal */}
      <Modal
        isOpen={audioModal.open}
        onClose={() => setAudioModal({ open: false, url: '', title: '' })}
        size="modal-md"
        title={audioModal.title || '🎧 Trình Phát File Ghi Âm'}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 12, marginBottom: 16 }}>
            <audio controls autoPlay src={audioModal.url} style={{ width: '100%', outline: 'none' }}>
              Trình duyệt của bạn không hỗ trợ thẻ audio.
            </audio>
          </div>
          <div>
            <a
              href={`${audioModal.url}&download=1`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              download
            >
              <Download size={15} /> Tải File Ghi Âm MP3
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
