import React, { useEffect, useState } from 'react';
import { reportsApi } from '../api';
import { Loading } from '../components/UI';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [loading, setLoading] = useState({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async (type) => {
    setLoading(prev => ({ ...prev, [`excel_${type}`]: true }));
    try {
      const res = await reportsApi.exportExcel(type, dateRange);
      downloadFile(res.data, `ecs_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Xuất Excel thành công!');
    } catch { toast.error('Lỗi xuất Excel'); }
    finally { setLoading(prev => ({ ...prev, [`excel_${type}`]: false })); }
  };

  const exportPdf = async (type) => {
    setLoading(prev => ({ ...prev, [`pdf_${type}`]: true }));
    try {
      const res = await reportsApi.exportPdf(type, dateRange);
      downloadFile(res.data, `ecs_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Xuất PDF thành công!');
    } catch { toast.error('Lỗi xuất PDF'); }
    finally { setLoading(prev => ({ ...prev, [`pdf_${type}`]: false })); }
  };

  const reportTypes = [
    { type: 'clients', title: '🏢 Báo Cáo Khách Hàng', desc: 'Danh sách tất cả khách hàng và thông tin liên hệ', hasPdf: true, hasExcel: true },
    { type: 'payments', title: '💳 Báo Cáo Thanh Toán', desc: 'Tình trạng thanh toán, hóa đơn đến hạn và quá hạn', hasPdf: true, hasExcel: true },
    { type: 'employees', title: '👥 Báo Cáo Nhân Viên', desc: 'Danh sách nhân viên theo phòng ban và dịch vụ', hasPdf: false, hasExcel: true },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h2>📊 Báo Cáo</h2><p>Xuất báo cáo dạng Excel và PDF</p></div>
      </div>

      {/* Date range filter */}
      <div className="card mb-4">
        <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>📅 Lọc Theo Khoảng Thời Gian (áp dụng cho báo cáo thanh toán)</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Từ ngày</label>
            <input id="report-from" className="form-control" type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Đến ngày</label>
            <input id="report-to" className="form-control" type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="grid-3">
        {reportTypes.map(({ type, title, desc, hasPdf, hasExcel }) => (
          <div key={type} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{desc}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              {hasExcel && (
                <button id={`export-excel-${type}`} className="btn btn-success" style={{ justifyContent: 'center' }}
                  onClick={() => exportExcel(type)} disabled={loading[`excel_${type}`]}>
                  <FileSpreadsheet size={16} />
                  {loading[`excel_${type}`] ? 'Đang xuất...' : 'Xuất Excel (.xlsx)'}
                </button>
              )}
              {hasPdf && (
                <button id={`export-pdf-${type}`} className="btn btn-secondary" style={{ justifyContent: 'center' }}
                  onClick={() => exportPdf(type)} disabled={loading[`pdf_${type}`]}>
                  <FileText size={16} />
                  {loading[`pdf_${type}`] ? 'Đang xuất...' : 'Xuất PDF (.pdf)'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="card mt-4" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.2)' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '14px' }}>ℹ️ Hướng Dẫn Xuất Báo Cáo</h3>
        <ul style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>File <strong>Excel (.xlsx)</strong>: Phù hợp để tiếp tục chỉnh sửa, lọc dữ liệu trong Excel</li>
          <li>File <strong>PDF (.pdf)</strong>: Phù hợp để in ấn hoặc gửi email báo cáo chuyên nghiệp</li>
          <li>Chọn khoảng thời gian để lọc báo cáo thanh toán theo tháng/quý/năm</li>
          <li>Không chọn ngày = xuất toàn bộ dữ liệu</li>
        </ul>
      </div>
    </div>
  );
}
