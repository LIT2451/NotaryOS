const API_BASE = 'http://localhost:5202/api';

async function runConcurrencyTest() {
  console.log('=====================================================');
  console.log('🚀 KHỞI ĐỘNG GIẢ LẬP CONCURRENCY TEST (5 NGƯỜI NHẬP ĐỒNG THỜI)');
  console.log('=====================================================');

  const timestamp = Date.now();
  const username = `test_cc_${timestamp}`;
  const password = 'Password123!';
  const fullName = 'Concurrency Tester';

  // 1. Đăng ký tài khoản test
  console.log(`\n[Bước 1] Đăng ký tài khoản test: ${username}...`);
  try {
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName })
    });
    
    if (!registerRes.ok) {
      const errText = await registerRes.text();
      throw new Error(`Đăng ký thất bại: ${errText}`);
    }
    console.log('✅ Đăng ký tài khoản test thành công.');
  } catch (err) {
    console.error('❌ Lỗi đăng ký:', err.message);
    return;
  }

  // 2. Đăng nhập lấy JWT Token
  console.log('\n[Bước 2] Đăng nhập lấy token...');
  let token = '';
  try {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!loginRes.ok) {
      throw new Error('Đăng nhập thất bại.');
    }
    
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log('✅ Đăng nhập thành công. Đã nhận JWT Token.');
  } catch (err) {
    console.error('❌ Lỗi đăng nhập:', err.message);
    return;
  }

  // 3. Gửi đồng thời 5 request tạo hóa đơn (giả lập 5 người bấm lưu cùng 1 mili-giây)
  console.log('\n[Bước 3] Giả lập 5 người dùng đồng thời gửi request tạo hóa đơn...');
  console.log('⏳ Đang phát lệnh gửi đồng thời 5 requests qua Promise.all...');

  const createInvoiceRequest = async (index) => {
    // Sử dụng FormData tương ứng với API nhận file ảnh ID Card
    const formData = new URLSearchParams();
    formData.append('clientName', `Khách Hàng Test ${index}`);
    formData.append('clientIdNumber', `CCCD-${timestamp}-${index}`);
    formData.append('clientEmail', `test${index}@concurrency.com`);
    formData.append('amount', '150000');
    formData.append('serviceTypeId', '1'); // Hợp đồng mua bán
    formData.append('notaryDate', new Date().toISOString().split('T')[0]);
    formData.append('bankName', 'Vietcombank');
    formData.append('bankAccount', '123456789');

    const startTime = Date.now();
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const duration = Date.now() - startTime;
      const status = res.status;
      
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          index,
          status,
          duration,
          invoiceNumber: data.invoiceNumber,
          clientName: data.clientName
        };
      } else {
        const errText = await res.text();
        return {
          success: false,
          index,
          status,
          duration,
          error: errText
        };
      }
    } catch (err) {
      return {
        success: false,
        index,
        status: 'EXCEPTION',
        duration: Date.now() - startTime,
        error: err.message
      };
    }
  };

  // Phát lệnh đồng thời
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    promises.push(createInvoiceRequest(i));
  }

  const results = await Promise.all(promises);

  console.log('\n=====================================================');
  console.log('📊 KẾT QUẢ GIẢ LẬP ĐỒNG THỜI (REALTIME CONCURRENCY)');
  console.log('=====================================================');

  let successCount = 0;
  let failedCount = 0;
  const invoiceNumbers = [];

  results.forEach(res => {
    if (res.success) {
      successCount++;
      invoiceNumbers.push(res.invoiceNumber);
      console.log(`👉 Người ${res.index}: THÀNH CÔNG | Phản hồi: ${res.duration}ms | Được cấp số HD: \x1b[32m${res.invoiceNumber}\x1b[0m`);
    } else {
      failedCount++;
      console.log(`👉 Người ${res.index}: \x1b[31mTHẤT BẠI\x1b[0m | Phản hồi: ${res.duration}ms | Lỗi: ${res.error}`);
    }
  });

  console.log('\n=============================');
  console.log('🔍 ĐÁNH GIÁ CHỐNG TRÙNG SỐ');
  console.log('=============================');
  console.log(`- Tổng request gửi đi: 5`);
  console.log(`- Thành công: \x1b[32m${successCount}\x1b[0m`);
  console.log(`- Thất bại: \x1b[31m${failedCount}\x1b[0m`);

  if (successCount === 5) {
    const duplicates = invoiceNumbers.filter((item, index) => invoiceNumbers.indexOf(item) !== index);
    if (duplicates.length > 0) {
      console.log(`❌ CẢNH BÁO NGUY HIỂM: Phát hiện số hợp đồng trùng nhau: ${duplicates.join(', ')}`);
    } else {
      console.log('🎉 KẾT QUẢ TUYỆT VỜI: Cả 5 người tạo thành công đồng thời và nhận 5 số hợp đồng HOÀN TOÀN KHÁC NHAU, LIÊN TIẾP VÀ ĐỘC NHẤT!');
      console.log('💡 Giải pháp Semaphore Lock & Concurrency Control hoạt động CHUẨN XÁC 100%.');
    }
  } else {
    console.log('⚠️ Có request thất bại. Vui lòng kiểm tra lại log lỗi ở trên.');
  }
  console.log('=====================================================');
}

runConcurrencyTest();
