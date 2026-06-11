import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';
import toast, { Toaster } from 'react-hot-toast';

import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  getStats,
  login,
  register,
  updateInvoice,
  getAuditLogs,
  getServiceTypes,
  getBanks,
  exportExcel,
  exportPdf,
} from './services/api';

import { showSuccess, showError } from './utils/toast';

import type { User, Invoice, Stats, InvoicePayload, AuditLog } from './types';
import { toDateInputValue } from './utils/date';

import Navbar from './components/Navbar';
import type { TabType } from './components/Navbar';
import DashboardView from './components/DashboardView';
import InvoiceForm from './components/InvoiceForm';
import InvoiceTable from './components/InvoiceTable';
import AuthView from './components/AuthView';
import HomeView from './components/HomeView';
import AuditLogView from './components/AuditLogView';
import UserManagementView from './components/UserManagementView';
import ServiceManagementView from './components/ServiceManagementView';
import BankManagementView from './components/BankManagementView';
import RoleManagementView from './components/RoleManagementView';
import ProfileView from './components/ProfileView';
import InitInvoiceNumberView from './components/InitInvoiceNumberView';
import { useSessionSecurity } from './hooks/useSessionSecurity';

import './App.css';

function App() {
  // Kiểm tra token trong sessionStorage - nếu không có (tab mới/đóng tab) thì logout
  const [user, setUser] = useState<User | null>(() => {
    const token = sessionStorage.getItem('token');
    const saved = localStorage.getItem('user');
    // Nếu có user info nhưng không có token trong sessionStorage => đã đóng tab trước đó
    if (saved && !token) {
      localStorage.removeItem('user');
      localStorage.removeItem('activeTab');
      return null;
    }
    return saved ? JSON.parse(saved) : null;
  });

  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('activeTab') as TabType;
    const hasUser = !!localStorage.getItem('user');
    
    if (savedTab) {
      if (!hasUser && !['home', 'login', 'register'].includes(savedTab)) {
        return 'login';
      }
      return savedTab;
    }
    return 'home';
  });

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeTab !== 'create' && activeTab !== 'init-number') {
      setIsManualInit(false);
    }
  }, [activeTab]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAmount: 0, totalCount: 0, uniqueClients: 0, countByService: [] });
  const [prevStats, setPrevStats] = useState<Stats | null>(null);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterServiceType, setFilterServiceType] = useState<number | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'CongChung' | 'ChungThuc' | 'SaoY'>('all');
  const [filterBank, setFilterBank] = useState<string>('all');

  const [startDate, setStartDate] = useState<string>(toDateInputValue(new Date(new Date().setDate(1)).toISOString()));
  const [endDate, setEndDate] = useState<string>(toDateInputValue(new Date().toISOString()));

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isManualInit, setIsManualInit] = useState(false);

  const [authData, setAuthData] = useState({ username: '', password: '', fullName: '' });

  const [createForm, setCreateForm] = useState<InvoicePayload>({
    invoiceNumber: '',
    clientName: '',
    clientIdNumber: '',
    clientEmail: '',
    amount: 0,
    serviceTypeId: 1,
    notaryDate: toDateInputValue(new Date().toISOString()),
    bankName: '',
    bankAccount: '',
  });

  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<InvoicePayload>({
    invoiceNumber: '',
    clientName: '',
    clientIdNumber: '',
    clientEmail: '',
    amount: 0,
    serviceTypeId: 1,
    notaryDate: toDateInputValue(new Date().toISOString()),
    bankName: '',
    bankAccount: '',
  });

  const hasPermission = (permission: string) => {
    if (user?.role === 'Admin') return true;
    return user?.permissions?.includes(permission) ?? false;
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setDataLoading(true);
    try {
      const params = { startDate: startDate || undefined, endDate: endDate || undefined };
      
      let prevParams = undefined;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = end.getTime() - start.getTime();
        
        const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        const prevStart = new Date(prevEnd.getTime() - duration);
        
        prevParams = {
          startDate: toDateInputValue(prevStart.toISOString()),
          endDate: toDateInputValue(prevEnd.toISOString())
        };
      }

      const [invRes, statRes, servRes, prevStatRes, bankRes] = await Promise.all([
        getInvoices(params),
        getStats(params),
        getServiceTypes(),
        prevParams ? getStats(prevParams) : Promise.resolve({ data: null }),
        getBanks()
      ]);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
      setStats(statRes.data);
      setPrevStats(prevStatRes.data);
      setServiceTypes(Array.isArray(servRes.data) ? servRes.data : []);
      setBanks(Array.isArray(bankRes.data) ? bankRes.data : []);
      setRefreshTrigger(prev => prev + 1);
      if (activeTab === 'audit') fetchAuditLogs();
    } catch (err: any) {
      console.error('Fetch error:', err);
      const status = err.response?.status;
      const url = err.config?.url;
      
      if (status === 403) {
        console.error(`403 Forbidden at: ${url}`);
        showError('Quyền truy cập', `Bạn không có quyền truy cập dữ liệu (${url}). Vui lòng ĐĂNG XUẤT và ĐĂNG NHẬP LẠI để cập nhật quyền.`);
      } else {
        showError('Lỗi dữ liệu', 'Không thể đồng bộ dữ liệu từ máy chủ.');
      }
    } finally {
      if (showLoading) setDataLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const toastId = toast.loading('Đang chuẩn bị dữ liệu Excel...');
      const params = { startDate: startDate || undefined, endDate: endDate || undefined };
      const response = await exportExcel(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao-cao-doanh-thu-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss(toastId);
      showSuccess('Thành công', 'Đã tải xuống báo cáo Excel.');
    } catch (error) {
      toast.dismiss();
      showError('Lỗi', 'Không thể xuất dữ liệu Excel. Vui lòng thử lại.');
    }
  };

  const handleExportPdf = async () => {
    try {
      const toastId = toast.loading('Đang chuẩn bị dữ liệu PDF...');
      const params = { startDate: startDate || undefined, endDate: endDate || undefined };
      const response = await exportPdf(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao-cao-doanh-thu-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss(toastId);
      showSuccess('Thành công', 'Đã tải xuống báo cáo PDF.');
    } catch (error) {
      toast.dismiss();
      showError('Lỗi', 'Không thể xuất dữ liệu PDF. Vui lòng thử lại.');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await getAuditLogs();
      setAuditLogs(res.data);
    } catch {
      showError('Lỗi nhật ký', 'Không tải được nhật ký hệ thống.');
    }
  };

  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const startConnection = async () => {
      if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
        return;
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5202/api';
      const hubBase = apiBase
        .replace(/\/api\/api$/, '/api')
        .replace(/\/api$/, '');
      const hubUrl = hubBase.replace(/\/$/, '') + '/invoiceHub';

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();

      connectionRef.current = connection;

      try {
        await connection.start();
        console.log('SignalR Connected');
        connection.on('ReceiveInvoiceUpdate', () => {
          fetchData(false);
        });
      } catch (err) {
        console.error('SignalR Connection Error: ', err);
      }
    };

    fetchData(true);
    startConnection();

    return () => {
      if (connectionRef.current && connectionRef.current.state === HubConnectionState.Connected) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    if (user) fetchData(true);
  }, [startDate, endDate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const modeRegister = activeTab === 'register';
    
    try {
      if (modeRegister) {
        // Frontend Password Strength Check
        const { password } = authData;
        if (password.length < 8) {
          showError('Mật khẩu yếu', 'Mật khẩu phải có ít nhất 8 ký tự.');
          setLoading(false);
          return;
        }
        if (!/[A-Z]/.test(password)) {
          showError('Mật khẩu yếu', 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa.');
          setLoading(false);
          return;
        }
        if (!/[a-z]/.test(password)) {
          showError('Mật khẩu yếu', 'Mật khẩu phải chứa ít nhất một chữ cái viết thường.');
          setLoading(false);
          return;
        }
        if (!/[0-9]/.test(password)) {
          showError('Mật khẩu yếu', 'Mật khẩu phải chứa ít nhất một chữ số.');
          setLoading(false);
          return;
        }
        if (!/[\W_]/.test(password)) {
          showError('Mật khẩu yếu', 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@, #, $, ...).');
          setLoading(false);
          return;
        }

        await register(authData);
        showSuccess('Đăng ký thành công', 'Bạn có thể đăng nhập ngay bây giờ.');
        setActiveTab('login');
      } else {
        const res = await login(authData);
        const userData = res.data.user;
        // Lưu token vào sessionStorage (tự xóa khi đóng tab)
        sessionStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setActiveTab('dashboard');
        showSuccess('Chào mừng trở lại', `Chào ${userData.fullName}!`);
      }
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || (modeRegister ? 'Đăng ký thất bại' : 'Sai tài khoản hoặc mật khẩu.'));
      showError('Thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback((reason?: string) => {
    sessionStorage.removeItem('token');
    localStorage.clear();
    setUser(null);
    setInvoices([]);
    setStats({ totalAmount: 0, totalCount: 0, uniqueClients: 0, countByService: [] });
    setShowInactivityWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setActiveTab('login');
    if (reason === 'inactivity') {
      setTimeout(() => showError('Phiên hết hạn', 'Bạn đã không hoạt động trong 30 phút. Vui lòng đăng nhập lại.'), 100);
    } else if (reason === 'tab_closed') {
      setTimeout(() => showError('Phiên đã kết thúc', 'Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại.'), 100);
    }
  }, []);

  const handleInactivityWarning = useCallback(() => {
    setShowInactivityWarning(true);
    setWarningCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setWarningCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useSessionSecurity({
    isLoggedIn: !!user,
    onLogout: () => handleLogout('inactivity'),
    onWarning: handleInactivityWarning,
  });

  const dismissWarning = useCallback(() => {
    setShowInactivityWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleCreateInvoice = async (event: React.FormEvent, frontFile?: File | null, backFile?: File | null) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(createForm).forEach(key => {
        const val = (createForm as any)[key];
        formData.append(key, val === null || val === undefined ? '' : val.toString());
      });

      if (frontFile) formData.append('idCardFront', frontFile);
      if (backFile) formData.append('idCardBack', backFile);

      // Backend trả về invoice với số hợp đồng thực tế đã được cấp (tránh race condition)
      const res = await createInvoice(formData);
      const savedInvoice = res.data;
      const assignedNumber = savedInvoice?.invoiceNumber || '';

      showSuccess(
        'Đã lưu hóa đơn',
        assignedNumber
          ? `Số hợp đồng được cấp: ${assignedNumber}`
          : 'Hóa đơn mới đã được tạo thành công.'
      );
      setIsManualInit(false);

      // Reset form — giữ lại serviceTypeId hiện tại để InvoiceForm tự fetch số tiếp theo
      const currentServiceTypeId = createForm.serviceTypeId;
      setCreateForm({
        invoiceNumber: '',   // Xóa để InvoiceForm trigger fetch số mới
        clientName: '',
        clientIdNumber: '',
        clientEmail: '',
        amount: 0,
        serviceTypeId: currentServiceTypeId,
        notaryDate: toDateInputValue(new Date().toISOString()),
        bankName: '',
        bankAccount: '',
      });
      fetchData(false);
      setActiveTab('history');
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể tạo hóa đơn. Vui lòng kiểm tra lại.');
      showError('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };


  const startEditInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setEditForm({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientIdNumber: invoice.clientIdNumber || '',
      clientEmail: invoice.clientEmail || '',
      amount: invoice.amount,
      serviceTypeId: invoice.serviceTypeId,
      notaryDate: toDateInputValue(new Date(invoice.notaryDate).toISOString()),
      bankName: invoice.bankName || '',
      bankAccount: invoice.bankAccount || '',
    });
  };

  const cancelEditInvoice = () => {
    setEditingInvoiceId(null);
  };

  const saveEditInvoice = async () => {
    if (!editingInvoiceId) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        const val = (editForm as any)[key];
        if (val !== undefined && val !== null) {
          formData.append(key, val.toString());
        }
      });
      await updateInvoice(editingInvoiceId, formData);
      showSuccess('Đã cập nhật', 'Thông tin hóa đơn đã được thay đổi.');
      setEditingInvoiceId(null);
      fetchData(false);
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể cập nhật hóa đơn.');
      showError('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  const removeInvoice = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    const toastId = toast.loading('Đang xóa...');
    try {
      await deleteInvoice(id);
      toast.dismiss(toastId);
      showSuccess('Đã xóa', 'Hóa đơn đã được gỡ khỏi hệ thống.');
      fetchData(false);
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể xóa hóa đơn này.');
      showError('Lỗi xóa', msg);
    }
  };

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    // Lọc theo từ khóa
    const keyword = searchTerm.trim().toLowerCase();
    if (keyword) {
      result = result.filter(
        (inv) =>
          inv.invoiceNumber?.toLowerCase().includes(keyword) ||
          inv.clientName?.toLowerCase().includes(keyword) ||
          inv.clientIdNumber?.toLowerCase().includes(keyword)
      );
    }

    // Lọc theo loại dịch vụ
    if (filterServiceType !== 'all') {
      result = result.filter((inv) => inv.serviceTypeId === filterServiceType);
    }

    // Lọc theo danh mục (Công chứng / Chứng thực)
    if (filterCategory !== 'all') {
      result = result.filter((inv) => inv.serviceType?.category === filterCategory);
    }

    // Lọc theo ngân hàng
    if (filterBank !== 'all') {
      result = result.filter((inv) => inv.bankName === filterBank);
    }

    return result;
  }, [invoices, searchTerm, filterServiceType, filterCategory, filterBank]);

  return (
    <div className="app-container">
      <Toaster position="top-right" />

      {/* Modal cảnh báo hết phiên */}
      {showInactivityWarning && (
        <div className="inactivity-overlay">
          <div className="inactivity-modal">
            <div className="inactivity-icon">⚠️</div>
            <h2>Phiên sắp hết hạn</h2>
            <p>Bạn không hoạt động trong một thời gian dài.</p>
            <p>Hệ thống sẽ tự động đăng xuất sau <strong>{warningCountdown}s</strong></p>
            <div className="inactivity-progress">
              <div
                className="inactivity-progress-bar"
                style={{ width: `${(warningCountdown / 60) * 100}%` }}
              />
            </div>
            <button className="btn btn-primary" onClick={dismissWarning}>
              Tiếp tục làm việc
            </button>
          </div>
        </div>
      )}
      
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        hasPermission={hasPermission}
        isLoggedIn={!!user}
        userFullName={user?.fullName}
        userRole={user?.role}
      />

      {(activeTab === 'login' || activeTab === 'register') && !user && (
        <AuthView
          isRegister={activeTab === 'register'}
          setIsRegister={(val) => setActiveTab(val ? 'register' : 'login')}
          authData={authData}
          setAuthData={setAuthData}
          handleAuth={handleAuth}
          loading={loading}
          onClose={() => setActiveTab('home')}
        />
      )}

      {activeTab === 'home' && (
        <HomeView onStart={() => user ? setActiveTab('dashboard') : setActiveTab('login')} />
      )}

      {user && activeTab !== 'home' && (
        <main className="main-content">
          {dataLoading && activeTab !== 'audit' ? (
            <div className="container">
              <div className="stat-cards">
                <div className="skeleton" style={{ height: '140px' }}></div>
                <div className="skeleton" style={{ height: '140px' }}></div>
                <div className="skeleton" style={{ height: '140px' }}></div>
              </div>
              <div className="card skeleton" style={{ marginTop: '32px', height: '400px' }}></div>
            </div>
          ) : (
            <div className="container">
              {/* --- Page Title --- */}
              {['dashboard', 'create', 'history'].includes(activeTab) && (
                <div className="page-title-block" style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                    {activeTab === 'dashboard' ? 'Tổng quan' :
                     activeTab === 'create' ? 'Nhập mới' : 
                     activeTab === 'history' ? 'Lịch sử hóa đơn' : ''}
                  </h1>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  prevStats={prevStats}
                  invoices={invoices}
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  onExportExcel={hasPermission('Invoices.Export') ? handleExportExcel : undefined}
                  onExportPdf={hasPermission('Invoices.Export') ? handleExportPdf : undefined}
                />
              )}

              {activeTab === 'create' && (
                <InvoiceForm
                  createForm={createForm}
                  setCreateForm={setCreateForm}
                  handleCreateInvoice={handleCreateInvoice}
                  loading={loading}
                  serviceTypes={serviceTypes}
                  banks={banks}
                  refreshTrigger={refreshTrigger}
                  userRole={user?.role}
                  isManualInit={isManualInit}
                  setIsManualInit={setIsManualInit}
                />
              )}

              {activeTab === 'init-number' && (user?.role === 'Manager' || user?.role === 'Admin') && (
                <InitInvoiceNumberView 
                  setActiveTab={setActiveTab}
                  setCreateForm={setCreateForm}
                  refreshTrigger={refreshTrigger}
                  setIsManualInit={setIsManualInit}
                />
              )}

              {activeTab === 'history' && (
                <InvoiceTable
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterServiceType={filterServiceType}
                  setFilterServiceType={setFilterServiceType}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterBank={filterBank}
                  setFilterBank={setFilterBank}
                  filteredInvoices={filteredInvoices}
                  editingInvoiceId={editingInvoiceId}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  startEditInvoice={startEditInvoice}
                  cancelEditInvoice={cancelEditInvoice}
                  saveEditInvoice={saveEditInvoice}
                  removeInvoice={removeInvoice}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  serviceTypes={serviceTypes}
                  banks={banks}
                  hasPermission={hasPermission}
                  currentUserId={user?.id ?? 0}
                  onExportExcel={hasPermission('Invoices.Export') ? handleExportExcel : undefined}
                  onExportPdf={hasPermission('Invoices.Export') ? handleExportPdf : undefined}
                />
              )}

              {activeTab === 'audit' && <AuditLogView />}
              {activeTab === 'profile' && <ProfileView />}
              {activeTab === 'accounts' && (hasPermission('Users.Manage') ? <UserManagementView /> : (
                <DashboardView stats={stats} prevStats={prevStats} invoices={invoices} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} onExportExcel={hasPermission('Invoices.Export') ? handleExportExcel : undefined} onExportPdf={hasPermission('Invoices.Export') ? handleExportPdf : undefined} />
              ))}
              {activeTab === 'roles' && hasPermission('Roles.Manage') && (
                <RoleManagementView />
              )}
              {activeTab === 'services' && hasPermission('ServiceTypes.Manage') && (
                <ServiceManagementView onServiceChange={() => fetchData(false)} />
              )}
              {activeTab === 'services' && !hasPermission('ServiceTypes.Manage') && (
                <DashboardView stats={stats} prevStats={prevStats} invoices={invoices} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} onExportExcel={hasPermission('Invoices.Export') ? handleExportExcel : undefined} onExportPdf={hasPermission('Invoices.Export') ? handleExportPdf : undefined} />
              )}
              {activeTab === 'banks' && hasPermission('Banks.Manage') && (
                <BankManagementView onBankChange={() => fetchData(false)} />
              )}
              {activeTab === 'banks' && !hasPermission('Banks.Manage') && (
                <DashboardView stats={stats} prevStats={prevStats} invoices={invoices} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} onExportExcel={hasPermission('Invoices.Export') ? handleExportExcel : undefined} onExportPdf={hasPermission('Invoices.Export') ? handleExportPdf : undefined} />
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
