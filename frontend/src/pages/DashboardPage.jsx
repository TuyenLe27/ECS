import React, { useEffect, useState } from 'react';
import { reportsApi } from '../api';
import { StatCard, Loading } from '../components/UI';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, Briefcase, Settings, AlertTriangle } from 'lucide-react';

const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getDashboard().then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <Loading />;

  const revenueData = data?.revenueByMonth?.map(m => ({
    month: m.month, revenue: parseFloat(m.total || 0)
  })) || [];

  const serviceData = data?.clientsByService?.map(s => ({
    name: s.service?.name?.split(' ')[0] || 'Other',
    value: parseInt(s.count || 0)
  })) || [];

  const paymentData = data?.paymentStats?.map(p => ({
    name: p.status, count: parseInt(p.count), total: parseFloat(p.total || 0)
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📊 Dashboard</h2>
          <p>Tổng quan hệ thống Excell-On Consulting Services</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-4">
        <StatCard value={data?.totalClients ?? 0} label="Khách Hàng Active" icon={<Briefcase size={24} color="#3b82f6" />} color="blue" />
        <StatCard value={data?.totalEmployees ?? 0} label="Nhân Viên Active" icon={<Users size={24} color="#10b981" />} color="green" />
        <StatCard value={data?.totalServices ?? 0} label="Loại Dịch Vụ" icon={<Settings size={24} color="#f59e0b" />} color="yellow" />
        <StatCard value={data?.overduePayments ?? 0} label="Thanh Toán Trễ Hạn" icon={<AlertTriangle size={24} color="#ef4444" />} color="red" />
      </div>

      <div className="grid-2 mb-4">
        {/* Revenue Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>📈 Doanh Thu Theo Tháng</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Doanh thu']}
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>💳 Trạng Thái Thanh Toán</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services Pie */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>🎯 Phân Bổ Dịch Vụ</h3>
          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={serviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>Chưa có dữ liệu</p>}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>ℹ️ Thông Tin Hệ Thống</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Tên Hệ Thống', value: 'ECS Management Portal' },
              { label: 'Phiên Bản', value: 'v1.0.0' },
              { label: 'Công Ty', value: 'Excell-On Consulting Services' },
              { label: 'Ngày Triển Khai', value: new Date().toLocaleDateString('vi-VN') },
              { label: 'Biểu Phí In-bound', value: '$4,500 / ngày / NV' },
              { label: 'Biểu Phí Out-bound', value: '$6,000 / ngày / NV' },
              { label: 'Biểu Phí Tele Marketing', value: '$5,500 / ngày / NV' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
