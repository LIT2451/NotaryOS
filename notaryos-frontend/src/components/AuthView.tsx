import React from 'react';
import { User, Lock, IdentificationCard, CaretLeft, Eye, EyeSlash } from '@phosphor-icons/react';

type AuthViewProps = {
  isRegister: boolean;
  setIsRegister: (val: boolean) => void;
  authData: any;
  setAuthData: (data: any) => void;
  handleAuth: (event: React.FormEvent) => void;
  loading?: boolean;
  onClose?: () => void;
};

const AuthView: React.FC<AuthViewProps> = ({ 
  isRegister, 
  setIsRegister, 
  authData, 
  setAuthData, 
  handleAuth,
  loading,
  onClose
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className="auth-split-container">
      {/* Back to Home Button */}
      {onClose && (
        <button className="auth-close-btn" onClick={onClose} title="Quay lại trang chủ">
          <CaretLeft size={24} weight="bold" />
        </button>
      )}

      {/* Left Side: Image Only */}
      <div className="auth-visual">
        <div className="auth-visual-overlay"></div>
        <img src="/assets/login-bg.png" alt="Notary Office" className="auth-visual-img" />
      </div>

      {/* Right Side: Form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '12px' }}>{isRegister ? 'Bắt đầu với NOTA' : 'Đăng nhập vào NOTA'}</h1>
            <p className="text-muted">{isRegister ? 'Khởi tạo tài khoản quản trị để bắt đầu.' : 'Quản lý công chứng chuyên nghiệp và hiệu quả.'}</p>
          </div>
          
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập</label>
              <div style={{ position: 'relative' }}>
                <User size={20} color="var(--ink-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                <input
                  required
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '48px' }}
                  placeholder="Nhập username..."
                  value={authData.username}
                  onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--ink-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  style={{ paddingLeft: '48px', paddingRight: '48px' }}
                  placeholder="••••••••"
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '14px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <div style={{ position: 'relative' }}>
                  <IdentificationCard size={20} color="var(--ink-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                  <input
                    required
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                    placeholder="Nguyễn Văn A"
                    value={authData.fullName}
                    onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '24px', padding: '14px' }}
            >
              {loading ? 'Đang xử lý...' : (isRegister ? 'Đăng ký' : 'Tiếp tục')}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
            <span className="text-muted">{isRegister ? 'Bạn đã có tài khoản? ' : 'Chưa có tài khoản? '}</span>
            <button 
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              {isRegister ? 'Đăng nhập ngay' : 'Đăng ký tài khoản mới'}
            </button>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--ink-muted)', justifyContent: 'center' }}>
             <span>Thiết kế bởi LIT</span>
             <span>•</span>
             <span>Bảo mật bởi NOTA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
