import React, { useState, useEffect, useRef } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { FileText, Users, CurrencyCircleDollar, ArrowUpRight, ArrowDownRight, Minus, DownloadSimple } from '@phosphor-icons/react';
import type { Stats } from '../types';

type DashboardViewProps = {
  stats: Stats | null;
  prevStats?: Stats | null;
  invoices: any[];
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
};

// Animated counter hook
function useCountUp(target: number, duration = 1200, trigger: boolean = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, trigger]);
  return value;
}

const StatCard: React.FC<{
  label: string;
  value: number;
  prevValue?: number;
  format?: 'number' | 'currency';
  icon: React.ReactNode;
  iconBg: string;
  delay?: number;
}> = ({ label, value, prevValue, format = 'number', icon, iconBg, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const displayed = useCountUp(value, 1000, visible);

  let trendBadge = null;
  if (prevValue !== undefined) {
    if (prevValue === 0 && value === 0) {
      trendBadge = <div className="stat-trend-badge trend-neutral" title="So với kỳ trước"><Minus size={12} weight="bold" /> 0%</div>;
    } else if (prevValue === 0 && value > 0) {
      trendBadge = <div className="stat-trend-badge trend-up" title="So với kỳ trước"><ArrowUpRight size={12} weight="bold" /> 100%</div>;
    } else {
      const change = ((value - prevValue) / prevValue) * 100;
      if (change > 0) {
        trendBadge = <div className="stat-trend-badge trend-up" title="So với kỳ trước"><ArrowUpRight size={12} weight="bold" /> {change.toFixed(1)}%</div>;
      } else if (change < 0) {
        trendBadge = <div className="stat-trend-badge trend-down" title="So với kỳ trước"><ArrowDownRight size={12} weight="bold" /> {Math.abs(change).toFixed(1)}%</div>;
      } else {
        trendBadge = <div className="stat-trend-badge trend-neutral" title="So với kỳ trước"><Minus size={12} weight="bold" /> 0%</div>;
      }
    }
  }

  return (
    <div
      ref={ref}
      className={`dash-stat-card ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="dash-stat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="dash-stat-label">{label}</span>
          {trendBadge}
        </div>
        <div className="dash-stat-icon" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <div className="dash-stat-value">
        {format === 'currency'
          ? displayed.toLocaleString('vi-VN')
          : displayed.toLocaleString()}
      </div>
      {format === 'currency' && (
        <div className="dash-stat-unit">VNĐ</div>
      )}
    </div>
  );
};

const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  prevStats,
  invoices,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onExportExcel,
  onExportPdf,
}) => {
  const [chartVisible, setChartVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setChartVisible(true); },
      { threshold: 0.1 }
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const chartData = invoices.slice(0, 12).reverse().map(inv => ({
    name: inv.invoiceNumber,
    amount: inv.amount
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="dash-tooltip">
          <p className="dash-tooltip-label">{label}</p>
          <p className="dash-tooltip-value">{payload[0].value.toLocaleString('vi-VN')} ₫</p>
        </div>
      );
    }
    return null;
  };

  const pieData = stats?.countByService.map(item => ({
    name: item.serviceType,
    value: item.count
  })) || [];

  const PIE_COLORS = ['#0066FF', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  return (
    <div className="dash-root">
      <div className="page-title-block" style={{ marginBottom: '32px' }}>
        <p className="text-muted">
          Theo dõi hiệu quả hoạt động và phân tích số liệu hóa đơn.
        </p>
      </div>

      {/* Date filter row */}
      <div className="dash-filter-row">
        <div className="dash-filter-group">
          <span className="dash-filter-label">Từ</span>
          <input
            type="date"
            className="dash-date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="dash-filter-sep">→</div>
        <div className="dash-filter-group">
          <span className="dash-filter-label">Đến</span>
          <input
            type="date"
            className="dash-date-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          {onExportExcel && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', gap: '6px', background: '#e1f5fe', color: '#01579b', border: '1px solid #b3e5fc' }}
              onClick={onExportExcel}
            >
              <DownloadSimple size={18} weight="bold" />
              Xuất Excel
            </button>
          )}
          
          {onExportPdf && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', gap: '6px', background: '#fce4ec', color: '#880e4f', border: '1px solid #f8bbd0' }}
              onClick={onExportPdf}
            >
              <FileText size={18} weight="bold" />
              Xuất PDF
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid">
        <StatCard
          label="Tổng hóa đơn"
          value={stats?.totalCount || 0}
          prevValue={prevStats?.totalCount}
          icon={<FileText size={20} weight="duotone" />}
          iconBg="var(--primary-soft)"
          delay={0}
        />
        <StatCard
          label="Doanh thu"
          value={stats?.totalAmount || 0}
          prevValue={prevStats?.totalAmount}
          format="currency"
          icon={<CurrencyCircleDollar size={20} weight="duotone" />}
          iconBg="#e8f5e9"
          delay={80}
        />
        <StatCard
          label="Khách hàng"
          value={stats?.uniqueClients || 0}
          prevValue={prevStats?.uniqueClients}
          icon={<Users size={20} weight="duotone" />}
          iconBg="#f3e5f5"
          delay={160}
        />
      </div>

      {/* Charts List */}
      <div className="dash-charts-list">
        {/* Area Chart */}
        <div
          ref={chartRef}
          className={`dash-chart-section ${chartVisible ? 'is-visible' : ''}`}
        >
          <div className="dash-chart-header">
            <div>
              <h2 className="dash-chart-title">Biến động doanh thu</h2>
              <p className="dash-chart-sub">Dữ liệu gần đây</p>
            </div>
          </div>

          <div className={`dash-chart-wrap ${chartVisible ? 'chart-animate-in' : ''}`} style={{ minHeight: '300px' }}>
            {chartVisible && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-soft)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--ink-muted)', fontSize: 11 }} dy={8} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--ink-muted)', fontSize: 11 }}
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaGrad)"
                    dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className={`dash-chart-section pie-section ${chartVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '100ms' }}>
          <div className="dash-chart-header">
            <div>
              <h2 className="dash-chart-title">Cơ cấu dịch vụ</h2>
              <p className="dash-chart-sub">Phân bổ theo loại hình</p>
            </div>
          </div>
          
          <div className="dash-chart-wrap pie-container" style={{ minHeight: '240px' }}>
            <div className="pie-main" style={{ width: '100%', height: '240px' }}>
              {chartVisible && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: '...', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="pie-legend-custom">
              {pieData.map((item, index) => (
                <div key={item.name} className="pie-legend-row">
                  <div className="pie-legend-info">
                    <span className="pie-dot" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                    <span className="pie-label">{item.name}</span>
                  </div>
                  <div className="pie-legend-stats">
                    <span className="pie-count">{item.value}</span>
                    <span className="pie-percent">
                      ({stats?.totalCount ? ((item.value / stats.totalCount) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
