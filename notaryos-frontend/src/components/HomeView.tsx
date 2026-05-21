import React, { useEffect, useRef } from 'react';
import { 
  ChartLineUp, 
  Files, 
  ShieldCheck, 
  ArrowRight, 
  DeviceMobile, 
  Clock, 
  CheckCircle 
} from '@phosphor-icons/react';

type HomeViewProps = {
  onStart: () => void;
};

// Custom hook for scroll animation
const useScrollReveal = () => {
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal-on-scroll');
    
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);
};

const HomeView: React.FC<HomeViewProps> = ({ onStart }) => {
  useScrollReveal();
  const features = [
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 21H3V3" />
          <path d="M7 14L12 9L15 12L20 7" />
          <circle cx="20" cy="7" r="1.5" fill="currentColor" />
        </svg>
      ),
      title: "Thống kê Thông minh",
      desc: "Theo dõi doanh thu và hiệu suất văn phòng theo thời gian thực với biểu đồ trực quan."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      title: "Nhập liệu Siêu tốc",
      desc: "Giao diện tối ưu giúp việc ghi nhận hóa đơn công chứng trở nên nhanh chóng và chính xác hơn bao giờ hết."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      title: "Bảo mật Tuyệt đối",
      desc: "Mọi thay đổi đều được lưu vết trong nhật ký hệ thống, đảm bảo tính minh bạch và an toàn dữ liệu."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
          <path d="M12 2a10 10 0 1 0 10 10" strokeDasharray="3 3" />
        </svg>
      ),
      title: "Cập nhật Tức thì",
      desc: "Công nghệ SignalR giúp đồng bộ dữ liệu giữa các máy tính trong văn phòng ngay lập tức."
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section-wide">
        <div className="hero-background">
          <img src="/assets/notary_hero_wide.png" alt="NOTA" />
          <div className="hero-mask"></div>
        </div>
        
        <div className="hero-content-wide container">
          <div className="hero-text-area">
            <h1>Giải pháp Quản lý Văn phòng Công chứng <span>Hiện đại</span></h1>
            <p>
              Chào mừng đến với hệ thống số hóa quy trình nghiệp vụ chuyên sâu cho các tổ chức hành nghề công chứng. 
              Tối giản, mạnh mẽ và cực kỳ an toàn.
            </p>
            <div className="hero-btns">
              <button className="btn btn-primary" style={{ padding: '18px 38px', fontSize: '18px' }} onClick={onStart}>
                Bắt đầu ngay <ArrowRight size={22} weight="bold" />
              </button>
              <button className="btn btn-secondary" style={{ padding: '18px 38px', fontSize: '18px' }}>
                Tìm hiểu thêm <DeviceMobile size={22} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section container reveal-on-scroll">
        <div className="section-header">
          <h2>Tại sao nên chọn chúng tôi?</h2>
          <p>Chúng tôi mang đến những công cụ tốt nhất để bạn tập trung vào nghiệp vụ chuyên môn.</p>
        </div>
        <div className="features-grid-minimal">
          {features.map((f, i) => (
            <div className="feature-item reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }} key={i}>
              <div className="feature-icon-minimal">
                {f.icon}
              </div>
              <div className="feature-text">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section container reveal-on-scroll">
        <div className="trust-card-new">
          <div className="trust-main">
            <div className="trust-info">
              <h2>Chính xác trên từng con số</h2>
              <p>Hệ thống được thiết kế để loại bỏ sai sót trong việc tính toán phí công chứng và lưu trữ thông tin khách hàng.</p>
              <ul className="trust-list">
                 <li className="reveal-on-scroll" style={{ transitionDelay: '100ms' }}><CheckCircle size={24} weight="fill" color="var(--success)" /> Kiểm tra mã hóa đơn tự động</li>
                 <li className="reveal-on-scroll" style={{ transitionDelay: '200ms' }}><CheckCircle size={24} weight="fill" color="var(--success)" /> Xuất báo cáo Excel/PDF chuẩn mẫu</li>
                 <li className="reveal-on-scroll" style={{ transitionDelay: '300ms' }}><CheckCircle size={24} weight="fill" color="var(--success)" /> Phân quyền người dùng chặt chẽ</li>
              </ul>
              
              <div className="trust-stats-row reveal-on-scroll" style={{ transitionDelay: '400ms' }}>
                <div className="t-stat">
                   <span className="t-val">99.9%</span>
                   <span className="t-lbl">Độ chính xác</span>
                </div>
                <div className="t-stat">
                   <span className="t-val">24/7</span>
                   <span className="t-lbl">Hỗ trợ kỹ thuật</span>
                </div>
              </div>
            </div>
            
            <div className="trust-visual-real reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
              <img src="/assets/trust_office.png" alt="Notary Office" className="trust-office-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="f-brand">
            <img src="/favicon.png" alt="Logo" style={{ height: '40px' }} />
          </div>
          <p>© 2026 NOTARYOS System. Thiết kế bởi LIT.</p>
          <div className="f-links">
             <span>Điều khoản</span>
             <span>Bảo mật</span>
             <span>Liên hệ</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
