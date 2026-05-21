import React, { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  ShieldCheck, 
  CalendarBlank, 
  IdentificationCard,
  Eye,
  EyeSlash,
  CheckCircle,
  DeviceMobile
} from '@phosphor-icons/react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile update state
  const [fullName, setFullName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setProfile(res.data);
      setFullName(res.data.fullName || '');
    } catch (err) {
      showError('Lỗi', 'Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return showError('Lỗi', 'Vui lòng nhập Họ và tên.');

    try {
      setIsUpdatingProfile(true);
      await api.put('/auth/profile', { fullName: fullName.trim() });
      showSuccess('Thành công', 'Thông tin hồ sơ đã được cập nhật.');
      fetchProfile();
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể cập nhật hồ sơ.');
      showError('Lỗi', msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.oldPassword) return showError('Lỗi', 'Vui lòng nhập mật khẩu cũ.');
    if (passwordForm.newPassword.length < 6) return showError('Lỗi', 'Mật khẩu mới phải từ 6 ký tự.');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return showError('Lỗi', 'Mật khẩu xác nhận không khớp.');

    try {
      setIsChangingPassword(true);
      await api.put('/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      showSuccess('Thành công', 'Mật khẩu đã được thay đổi.');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể đổi mật khẩu.');
      showError('Lỗi', msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) return <div className="loading-state">Đang tải hồ sơ...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>Hồ sơ cá nhân</h1>
        <p className="text-muted">Quản lý thông tin tài khoản và bảo mật của bạn</p>
      </div>

      <div className="profile-grid">
        {/* Personal Info Card */}
        <div className="glass-card profile-card" style={{ padding: '32px', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'var(--primary-soft)', borderRadius: '12px', color: 'var(--primary)' }}>
              <IdentificationCard size={24} weight="bold" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Thông tin cá nhân</h2>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: 'var(--primary-gradient)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700,
                color: 'white'
              }}>
                {profile?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>@{profile?.username}</div>
                <div className="badge primary" style={{ marginTop: '4px' }}>{profile?.role || 'Staff'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ink-muted)', fontSize: '14px' }}>
                <CalendarBlank size={18} />
                <span>Tham gia từ: {new Date(profile?.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ink-muted)', fontSize: '14px' }}>
                <ShieldCheck size={18} />
                <span>Trạng thái: <span style={{ color: 'var(--success)', fontWeight: 600 }}>Đang hoạt động</span></span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-soft)', margin: '24px 0' }} />

          <form onSubmit={handleUpdateProfile}>
            <div className="field-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>HỌ VÀ TÊN</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  className="form-control"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    fontSize: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)',
                    background: '#fff',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
                />
                <User size={18} style={{ position: 'absolute', right: '16px', top: '14px', color: 'var(--ink-muted)', opacity: 0.5 }} />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px' }}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </button>
          </form>
        </div>

        {/* Security Card */}
        <div className="glass-card profile-card" style={{ padding: '32px', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'var(--warning-soft)', borderRadius: '12px', color: 'var(--warning)' }}>
              <Key size={24} weight="bold" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Bảo mật & Mật khẩu</h2>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="field-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>MẬT KHẨU CŨ</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showOldPassword ? "text" : "password"}
                  className="form-control"
                  style={{ 
                    width: '100%', 
                    padding: '12px 40px 12px 16px', 
                    fontSize: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)',
                    background: '#fff',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}
                >
                  {showOldPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>MẬT KHẨU MỚI</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  style={{ 
                    width: '100%', 
                    padding: '12px 40px 12px 16px', 
                    fontSize: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)',
                    background: '#fff',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}
                >
                  {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: '32px' }}>
              <label className="form-label" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>XÁC NHẬN MẬT KHẨU MỚI</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  style={{ 
                    width: '100%', 
                    padding: '12px 40px 12px 16px', 
                    fontSize: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)',
                    background: '#fff',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-warning" 
              style={{ width: '100%', padding: '14px', background: 'var(--warning)', color: 'white' }}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
