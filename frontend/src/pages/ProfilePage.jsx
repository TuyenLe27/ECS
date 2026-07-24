import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import toast from 'react-hot-toast';
import { User, Lock, Mail, Shield, BadgeCheck, Save, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form state
  const [oldPassword, setOldPassword]         = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword]   = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      setProfileData(res.data);
      setFullName(res.data.full_name || '');
      setEmail(res.data.email || '');
    } catch {
      toast.error('Lỗi khi tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      return toast.error('Vui lòng điền đầy đủ Họ tên và Email');
    }
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile({ full_name: fullName, email });
      toast.success('Cập nhật thông tin thành công!');
      updateUser({ full_name: fullName, email });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('Vui lòng điền đầy đủ thông tin mật khẩu');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }
    if (newPassword.length < 6) {
      return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>Đang tải thông tin cá nhân...</div>
      </div>
    );
  }

  const emp = profileData?.employee;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2>👤 Hồ Sơ Cá Nhân</h2>
          <p>Quản lý thông tin tài khoản và đổi mật khẩu bảo mật</p>
        </div>
      </div>

      {/* Main Info Card */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 24, marginBottom: 24,
        border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, color: '#fff',
          boxShadow: '0 8px 24px rgba(59,130,246,0.3)', flexShrink: 0,
        }}>
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {profileData?.full_name || user?.username}
            </h3>
            <span className={`badge badge-${user?.role === 'admin' ? 'danger' : user?.role === 'manager' ? 'warning' : 'primary'}`}
                  style={{ textTransform: 'uppercase', fontSize: 11, padding: '4px 10px' }}>
              {user?.role}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>👤 Username: <strong style={{ color: 'var(--text-primary)' }}>{profileData?.username}</strong></span>
            <span>✉️ Email: <strong style={{ color: 'var(--text-primary)' }}>{profileData?.email}</strong></span>
          </div>
        </div>

        {emp && (
          <div style={{
            background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: 12,
            border: '1px solid var(--border-color)', fontSize: 13, minWidth: 220,
          }}>
            <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: 4 }}>🪪 Nhân Viên Liên Kết</div>
            <div>Mã NV: <strong>{emp.emp_code}</strong></div>
            <div>Chức danh: <strong>{emp.designation}</strong></div>
          </div>
        )}
      </div>

      {/* Grid Forms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>

        {/* Edit Profile Form */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 24,
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
            <User size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Chỉnh Sửa Thông Tin</h3>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Họ và Tên</label>
              <input
                className="form-control"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nhập họ và tên..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Địa Chỉ Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Nhập email..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Tên Đăng Nhập (Username)</label>
              <input
                className="form-control"
                type="text"
                value={profileData?.username || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Username không thể thay đổi</span>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Vai Trò (Role)</label>
              <input
                className="form-control"
                type="text"
                value={profileData?.role?.toUpperCase() || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Save size={16} />
              {savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 24,
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
            <KeyRound size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Đổi Mật Khẩu</h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Mật Khẩu Hiện Tại *</label>
              <input
                className="form-control"
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Mật Khẩu Mới *</label>
              <input
                className="form-control"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Xác Nhận Mật Khẩu Mới *</label>
              <input
                className="form-control"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-warning"
              disabled={savingPassword}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#fff',
              }}
            >
              <Lock size={16} />
              {savingPassword ? 'Đang đổi...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
