import React, { useEffect, useState } from 'react';
import { reportsApi, servicesApi } from '../api';
import { Loading } from '../components/UI';
import { Download, FileSpreadsheet, FileText, RefreshCw, AlertTriangle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [loading, setLoading] = useState({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [paymentStatus, setPaymentStatus] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [services, setServices] = useState([]);
  const [previews, setPreviews] = useState({});
  const [previewLoading, setPreviewLoading] = useState({});
  const [performance, setPerformance] = useState([]);
  const [perfLoading, setPerfLoading] = useState(true);

  useEffect(() => {
    servicesApi.getAll().then(r => setServices(r.data)).catch(() => {});
    reportsApi.getEmployeePerformance()
      .then(r => { setPerformance(r.data); setPerfLoading(false); })
      .catch(() => setPerfLoading(false));
  }, []);

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const loadPreview = async (type) => {
    setPreviewLoading(prev => ({ ...prev, [type]: true }));
    try {
      const params = { ...dateRange };
      if (type === 'payments' && paymentStatus) params.status = paymentStatus;
      if (type === 'employees' && serviceId) params.service_id = serviceId;
      const res = await reportsApi.getPreview(type, params);
      setPreviews(prev => ({ ...prev, [type]: res.data.preview }));
    } catch { /* silent */ }
    finally { setPreviewLoading(prev => ({ ...prev, [type]: false })); }
  };

  const exportExcel = async (type) => {
    setLoading(prev => ({ ...prev, [`excel_${type}`]: true }));
    try {
      const params = { ...dateRange };
      if (type === 'payments' && paymentStatus) params.status = paymentStatus;
      if (type === 'employees' && serviceId) params.service_id = serviceId;
      const res = await reportsApi.exportExcel(type, params);
      downloadFile(res.data, `ecs_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Xuất Excel thành công!');
    } catch { toast.error('Lỗi xuất Excel'); }
    finally { setLoading(prev => ({ ...prev, [`excel_${type}`]: false })); }
  };

  const exportPdf = async (type) => {
    setLoading(prev => ({ ...prev, [`pdf_${type}`]: true }));
    try {
      const params = { ...dateRange };
      if (type === 'payments' && paymentStatus) params.status = paymentStatus;
      if (type === 'employees' && serviceId) params.service_id = serviceId;
      const res = await reportsApi.exportPdf(type, params);
      downloadFile(res.data, `ecs_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Xuất PDF thành công!');
    } catch { toast.error('Lỗi xuất PDF'); }
    finally { setLoading(prev => ({ ...prev, [`pdf_${type}`]: false })); }
  };

  const PreviewBox = ({ type, data }) => {
    if (!data) return null;
    const items = type === 'clients'
      ? [{ val: data.total, lbl: 'Tổng KH' }, { val: data.active, lbl: 'Active' }, { val: data.inactive, lbl: 'Inactive' }]
      : type === 'employees'
      ? [{ val: data.total, lbl: 'Tổng NV' }, { val: data.active, lbl: 'Active' }, { val: data.byService, lbl: 'Có phân công' }]
      : [{ val: data.total, lbl: 'Hóa đơn' }, { val: `$${data.totalAmount}`, lbl: 'Tổng tiền' }, { val: '', lbl: '' }];
    return (
      <div className="report-preview">
        <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}>📊 Xem trước dữ liệu</div>
        <div className="report-preview-grid">
          {items.filter(i => i.lbl).map(({ val, lbl }) => (
            <div className="rp-item" key={lbl}>
              <div className="rp-val">{val}</div>
              <div className="rp-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>📊 Báo Cáo</h2><p>Xuất báo cáo dạng Excel và PDF cho mọi module</p></div>
      </div>

      {/* Global Date Filter */}
      <div className="card mb-4">
        <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>📅 Bộ Lọc Chung</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Từ ngày</label>
            <input id="report-from" className="form-control" type="date" value={dateRange.from}
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Đến ngày</label>
            <input id="report-to" className="form-control" type="date" value={dateRange.to}
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái TT (cho báo cáo payment)</label>
            <select id="report-status" className="form-control" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chưa thanh toán (Pending)</option>
              <option value="paid">Đã thanh toán (Paid)</option>
              <option value="overdue">Trễ hạn (Overdue)</option>
              <option value="partial">Một phần (Partial)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dịch vụ (cho báo cáo nhân viên)</label>
            <select id="report-service" className="form-control" value={serviceId} onChange={e => setServiceId(e.target.value)}>
              <option value="">Tất cả dịch vụ</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {/* Clients Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 6 }}>🏢 Báo Cáo Khách Hàng</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Danh sách tất cả khách hàng và thông tin liên hệ đầy đủ</p>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}
            onClick={() => loadPreview('clients')} disabled={previewLoading['clients']}>
            <RefreshCw size={12} /> {previewLoading['clients'] ? 'Đang tải...' : 'Xem trước'}
          </button>
          <PreviewBox type="clients" data={previews['clients']} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
            <button id="export-excel-clients" className="btn btn-success" style={{ justifyContent: 'center' }}
              onClick={() => exportExcel('clients')} disabled={loading['excel_clients']}>
              <FileSpreadsheet size={15} />{loading['excel_clients'] ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
            <button id="export-pdf-clients" className="btn btn-secondary" style={{ justifyContent: 'center' }}
              onClick={() => exportPdf('clients')} disabled={loading['pdf_clients']}>
              <FileText size={15} />{loading['pdf_clients'] ? 'Đang xuất...' : 'Xuất PDF'}
            </button>
          </div>
        </div>

        {/* Payments Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 6 }}>💳 Báo Cáo Thanh Toán</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tình trạng thanh toán, hóa đơn theo khoảng thời gian và trạng thái</p>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}
            onClick={() => loadPreview('payments')} disabled={previewLoading['payments']}>
            <RefreshCw size={12} /> {previewLoading['payments'] ? 'Đang tải...' : 'Xem trước'}
          </button>
          <PreviewBox type="payments" data={previews['payments']} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
            <button id="export-excel-payments" className="btn btn-success" style={{ justifyContent: 'center' }}
              onClick={() => exportExcel('payments')} disabled={loading['excel_payments']}>
              <FileSpreadsheet size={15} />{loading['excel_payments'] ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
            <button id="export-pdf-payments" className="btn btn-secondary" style={{ justifyContent: 'center' }}
              onClick={() => exportPdf('payments')} disabled={loading['pdf_payments']}>
              <FileText size={15} />{loading['pdf_payments'] ? 'Đang xuất...' : 'Xuất PDF'}
            </button>
          </div>
        </div>

        {/* Employees Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 6 }}>👥 Báo Cáo Nhân Viên</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Danh sách nhân viên theo phòng ban và dịch vụ phụ trách</p>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}
            onClick={() => loadPreview('employees')} disabled={previewLoading['employees']}>
            <RefreshCw size={12} /> {previewLoading['employees'] ? 'Đang tải...' : 'Xem trước'}
          </button>
          <PreviewBox type="employees" data={previews['employees']} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
            <button id="export-excel-employees" className="btn btn-success" style={{ justifyContent: 'center' }}
              onClick={() => exportExcel('employees')} disabled={loading['excel_employees']}>
              <FileSpreadsheet size={15} />{loading['excel_employees'] ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
            <button id="export-pdf-employees" className="btn btn-secondary" style={{ justifyContent: 'center' }}
              onClick={() => exportPdf('employees')} disabled={loading['pdf_employees']}>
              <FileText size={15} />{loading['pdf_employees'] ? 'Đang xuất...' : 'Xuất PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Late Payments Report - Special Card */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.03)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <h3 style={{ fontSize: 16, color: '#ef4444' }}>Báo Cáo Thanh Toán Trễ Hạn</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Tất cả hóa đơn có trạng thái <strong style={{ color: '#ef4444' }}>OVERDUE</strong> – kèm thông tin liên hệ client và số ngày quá hạn. Xuất để theo dõi và thu hồi công nợ.
            </p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 10, width: 'fit-content' }}
              onClick={() => loadPreview('late_payments')} disabled={previewLoading['late_payments']}>
              <RefreshCw size={12} /> {previewLoading['late_payments'] ? 'Đang tải...' : 'Xem trước số liệu'}
            </button>
            <PreviewBox type="payments" data={previews['late_payments']} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button id="export-excel-late-payments" className="btn btn-danger"
              onClick={() => exportExcel('late_payments')} disabled={loading['excel_late_payments']}>
              <FileSpreadsheet size={15} />{loading['excel_late_payments'] ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
            <button id="export-pdf-late-payments" className="btn btn-secondary"
              onClick={() => exportPdf('late_payments')} disabled={loading['pdf_late_payments']}>
              <FileText size={15} />{loading['pdf_late_payments'] ? 'Đang xuất...' : 'Xuất PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Employee Call Center Performance KPI */}
      <div className="card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Activity size={20} color="var(--primary)" />
          <h3 style={{ fontSize: 16 }}>🎯 Hiệu Suất Cuộc Gọi Nhân Viên (Call Center KPIs)</h3>
        </div>
        {perfLoading ? <Loading /> : (
          <div className="grid-2" style={{ gap: 20 }}>
            <div>
              <div className="table-container" style={{ border: '1px solid var(--border)', background: 'transparent' }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr><th>Mã NV</th><th>Họ Tên</th><th>Dịch Vụ</th><th>Tổng Cuộc Gọi</th><th>Tỷ Lệ Thành Công</th></tr>
                  </thead>
                  <tbody>
                    {performance.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chưa có số liệu cuộc gọi</td></tr>
                    ) : performance.slice(0, 5).map(p => (
                      <tr key={p.employeeId}>
                        <td><strong>{p.empCode}</strong></td>
                        <td>{p.name}</td>
                        <td style={{ fontSize: 11 }}>{p.serviceName}</td>
                        <td><strong>{p.totalCalls}</strong> <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({p.totalMinutes} phút)</span></td>
                        <td>
                          <span style={{ fontWeight: 600, color: p.successRate > 75 ? 'var(--success)' : p.successRate > 50 ? 'var(--warning)' : 'var(--danger)' }}>
                            {p.successRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 13, marginBottom: 12, color: 'var(--text-muted)', textAlign: 'center' }}>So Sánh Tổng Cuộc Gọi Đã Thực Hiện</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performance.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis dataKey="empCode" type="category" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff', fontSize: 11 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                  />
                  <Bar dataKey="totalCalls" fill="#3b82f6" name="Cuộc gọi" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.2)' }}>
        <h3 style={{ marginBottom: 12, fontSize: 14 }}>ℹ️ Hướng Dẫn Xuất Báo Cáo</h3>
        <ul style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: '1.9', paddingLeft: 20 }}>
          <li>File <strong>Excel (.xlsx)</strong>: Dùng để tiếp tục chỉnh sửa, lọc dữ liệu, làm pivot table</li>
          <li>File <strong>PDF (.pdf)</strong>: Dùng để in ấn hoặc gửi email báo cáo chính thức</li>
          <li>Chọn khoảng <strong>thời gian</strong> để lọc dữ liệu thanh toán theo tháng/quý/năm</li>
          <li>Chọn <strong>dịch vụ</strong> để xuất báo cáo nhân viên chỉ theo một dịch vụ cụ thể</li>
          <li>Nhấn <strong>"Xem trước"</strong> để kiểm tra số lượng bản ghi trước khi xuất</li>
          <li>Không chọn ngày = xuất toàn bộ dữ liệu</li>
        </ul>
      </div>
    </div>
  );
}
