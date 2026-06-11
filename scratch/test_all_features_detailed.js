const API_BASE = 'http://localhost:5202/api';
const { execSync } = require('child_process');

// Color helpers
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let tokens = {
  admin: '',
  manager: '',
  staffA: '',
  staffB: ''
};

let usernames = {
  admin: `admin_${Date.now()}`,
  manager: `manager_${Date.now()}`,
  staffA: `staffa_${Date.now()}`,
  staffB: `staffb_${Date.now()}`
};

const PASSWORD = 'SecurePassword123!';

function logHeader(title) {
  console.log(`\n${CYAN}=====================================================`);
  console.log(`🔹 ${title}`);
  console.log(`=====================================================${RESET}`);
}

function assertStatus(response, expectedStatuses, testName) {
  const statuses = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
  if (statuses.includes(response.status)) {
    console.log(`  ✅ [PASS] ${testName} (Status: ${response.status})`);
    return true;
  } else {
    console.log(`  ❌ [FAIL] ${testName} (Expected: ${statuses.join(' or ')}, Actual: ${response.status})`);
    return false;
  }
}

async function runTests() {
  logHeader('KHỞI ĐỘNG HỆ THỐNG KIỂM THỬ CHI TIẾT TOÀN DIỆN');

  // ==========================================
  // I. AUTHENTICATION & RBAC SEEDING SETUP
  // ==========================================
  logHeader('I. AUTHENTICATION (ĐĂNG KÝ, ĐĂNG NHẬP & PHÂN QUYỀN)');

  try {
    for (const key of Object.keys(usernames)) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernames[key], password: PASSWORD, fullName: `${key.toUpperCase()} User` })
      });
      assertStatus(res, 200, `Đăng ký tài khoản ${usernames[key]}`);
    }

    console.log('\n  ⏳ Đang cập nhật RoleId trong database...');
    execSync(`mysql -u root -pDql2451@ -D congchungtanmai -e "UPDATE Users SET RoleId = 1 WHERE Username = '${usernames.admin}';"`);
    execSync(`mysql -u root -pDql2451@ -D congchungtanmai -e "UPDATE Users SET RoleId = 3 WHERE Username = '${usernames.manager}';"`);
    console.log('  ✅ Cập nhật RoleId thành công.');

    for (const key of Object.keys(usernames)) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernames[key], password: PASSWORD })
      });
      if (res.status === 200) {
        const data = await res.json();
        tokens[key] = data.token;
        console.log(`  ✅ Đăng nhập ${key.toUpperCase()} thành công và nhận Token.`);
      } else {
        console.log(`  ❌ Đăng nhập ${key.toUpperCase()} thất bại.`);
      }
    }

    const loginFailRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernames.staffA, password: 'WrongPassword!' })
    });
    assertStatus(loginFailRes, 400, 'Đăng nhập với mật khẩu sai bị chặn');

    const getMeRes = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(getMeRes, 200, 'Lấy profile cá nhân (/auth/me)');
    const meData = await getMeRes.json();
    if (meData.username === usernames.staffA) {
      console.log('  ✅ Xác nhận thông tin trả về chính xác.');
    } else {
      console.log('  ❌ Thông tin trả về không đúng.');
    }

  } catch (err) {
    console.error('❌ Lỗi thiết lập Auth:', err);
    return;
  }

  // ==========================================
  // II. INVOICES / CONTRACT MANAGEMENT
  // ==========================================
  logHeader('II. INVOICES / HỢP ĐỒNG (THÊM, SỬA, XÓA, LẤP SỐ TRỐNG, PHÂN QUYỀN)');

  let invoiceAId, invoiceBId, invoiceCId;
  let invoiceANumber, invoiceBNumber, invoiceCNumber;

  try {
    const nextNumRes = await fetch(`${API_BASE}/invoices/next-number?serviceTypeId=1`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(nextNumRes, 200, 'Lấy số hợp đồng tiếp theo');

    // Tạo Hợp đồng A (do Staff A tạo)
    const formA = new FormData();
    formA.append('clientName', 'Khách hàng A');
    formA.append('amount', '100000');
    formA.append('serviceTypeId', '1'); // Hợp đồng Mua bán
    formA.append('notaryDate', new Date().toISOString().split('T')[0]);

    const createARes = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`
      },
      body: formA
    });
    assertStatus(createARes, 200, 'Staff A tạo Hợp đồng A');
    const invA = await createARes.json();
    invoiceAId = invA.id;
    invoiceANumber = invA.invoiceNumber;
    console.log(`  👉 Hợp đồng A: ID = ${invoiceAId}, Số HD = ${invoiceANumber}`);

    // Tạo Hợp đồng B (do Staff A tạo)
    const formB = new FormData();
    formB.append('clientName', 'Khách hàng B');
    formB.append('amount', '200000');
    formB.append('serviceTypeId', '1');
    formB.append('notaryDate', new Date().toISOString().split('T')[0]);

    const createBRes = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`
      },
      body: formB
    });
    const invB = await createBRes.json();
    invoiceBId = invB.id;
    invoiceBNumber = invB.invoiceNumber;
    console.log(`  👉 Hợp đồng B: ID = ${invoiceBId}, Số HD = ${invoiceBNumber}`);

    // Tạo Hợp đồng C (do Staff A tạo)
    const formC = new FormData();
    formC.append('clientName', 'Khách hàng C');
    formC.append('amount', '300000');
    formC.append('serviceTypeId', '1');
    formC.append('notaryDate', new Date().toISOString().split('T')[0]);

    const createCRes = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`
      },
      body: formC
    });
    const invC = await createCRes.json();
    invoiceCId = invC.id;
    invoiceCNumber = invC.invoiceNumber;
    console.log(`  👉 Hợp đồng C: ID = ${invoiceCId}, Số HD = ${invoiceCNumber}`);

    // KIỂM TRA KHỞI TẠO SỐ HỢP ĐỒNG (JUMP INITIALIZATION)
    const randomSuffix = Math.floor(Math.random() * 8000) + 1000; // e.g. 5432 (4 digits to avoid overflow)
    const customInitNumber = `CC-${new Date().getFullYear()}-00${randomSuffix}`;
    
    // Kiểm tra tính khả dụng của số khởi tạo này
    const checkInitRes = await fetch(`${API_BASE}/invoices/check-number?invoiceNumber=${customInitNumber}`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(checkInitRes, 200, 'Kiểm tra tính khả dụng của số hợp đồng khởi tạo mới');
    const initCheckData = await checkInitRes.json();
    if (!initCheckData.exists) {
      console.log(`  ✅ Số hợp đồng ${customInitNumber} sẵn sàng để khởi tạo.`);
    } else {
      console.log(`  ❌ Số hợp đồng ${customInitNumber} đã tồn tại trong hệ thống.`);
    }

    // Tiến hành khởi tạo hợp đồng bằng số tự nhập này
    const formInit = new FormData();
    formInit.append('invoiceNumber', customInitNumber);
    formInit.append('clientName', 'Khách hàng Khởi Tạo');
    formInit.append('amount', '500000');
    formInit.append('serviceTypeId', '1');
    formInit.append('notaryDate', new Date().toISOString().split('T')[0]);

    const createInitRes = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`
      },
      body: formInit
    });
    assertStatus(createInitRes, 200, 'Staff A khởi tạo hợp đồng mới với số tự nhập (Jump Initialization)');
    const invInit = await createInitRes.json();
    console.log(`  👉 Hợp đồng Khởi Tạo: ID = ${invInit.id}, Số HD = ${invInit.invoiceNumber}`);
    if (invInit.invoiceNumber === customInitNumber) {
      console.log('  ✅ [PASS] Khởi tạo số hợp đồng thành công! Số tự nhập được chấp nhận.');
    } else {
      console.log(`  ❌ [FAIL] Khởi tạo thất bại. Hệ thống tự gán số: ${invInit.invoiceNumber}`);
    }

    // Đảm bảo số tự sinh tiếp theo bắt đầu tăng từ số khởi tạo này
    const nextNumberResAfterInit = await fetch(`${API_BASE}/invoices/next-number?serviceTypeId=1`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    const nextNumAfterInitData = await nextNumberResAfterInit.json();
    const expectedNextNumber = `CC-${new Date().getFullYear()}-00${randomSuffix + 1}`;
    console.log(`  👉 Số tiếp theo do hệ thống gợi ý: ${nextNumAfterInitData.nextNumber}`);
    if (nextNumAfterInitData.nextNumber === expectedNextNumber) {
      console.log('  ✅ [PASS] Số tự sinh tiếp theo tăng tiến chính xác từ số khởi tạo!');
    } else {
      console.log(`  ❌ [FAIL] Số tự sinh tiếp theo bị sai. Gợi ý: ${nextNumAfterInitData.nextNumber}, Kỳ vọng: ${expectedNextNumber}`);
    }

    // Kiểm tra trùng số hợp đồng (CheckInvoiceNumber)
    const checkRes = await fetch(`${API_BASE}/invoices/check-number?invoiceNumber=${invoiceANumber}`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(checkRes, 200, 'Kiểm tra trùng số hợp đồng');
    const checkData = await checkRes.json();
    if (checkData.exists) {
      console.log('  ✅ Xác nhận số đã tồn tại.');
    } else {
      console.log('  ❌ Lỗi: Số hợp đồng đáng lẽ phải báo đã tồn tại.');
    }

    // Sửa Hợp đồng A (Sở hữu bởi Staff A) -> thành công
    const editForm = new FormData();
    editForm.append('invoiceNumber', invoiceANumber);
    editForm.append('clientName', 'Khách hàng A - Đã sửa');
    editForm.append('amount', '150000');
    editForm.append('serviceTypeId', '1');

    const editRes = await fetch(`${API_BASE}/invoices/${invoiceAId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`
      },
      body: editForm
    });
    assertStatus(editRes, 200, 'Staff A tự sửa Hợp đồng A');

    // Sửa Hợp đồng A bởi Staff B (Không sở hữu) -> bị chặn 403
    const editResFail = await fetch(`${API_BASE}/invoices/${invoiceAId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.staffB}`
      },
      body: editForm
    });
    assertStatus(editResFail, 403, 'Staff B cố sửa Hợp đồng A của Staff A (Bị chặn 403)');

    // Xóa Hợp đồng A bởi Staff B (Không sở hữu) -> bị chặn 403
    const deleteFail = await fetch(`${API_BASE}/invoices/${invoiceAId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokens.staffB}` }
    });
    assertStatus(deleteFail, 403, 'Staff B cố xóa Hợp đồng A của Staff A (Bị chặn 403)');

    // Xóa Hợp đồng B bởi Staff A (Sở hữu) -> thành công (tạo khoảng trống ở vị trí B)
    const deleteSuccess = await fetch(`${API_BASE}/invoices/${invoiceBId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(deleteSuccess, 204, 'Staff A xóa Hợp đồng B (Thành công - tạo số khuyết)');

    // KIỂM TRA TÁI SỬ DỤNG SỐ KHUYẾT (GAP-FILLING / LẤP SỐ TRỐNG)
    const getNextGapRes = await fetch(`${API_BASE}/invoices/next-number?serviceTypeId=1`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    const nextGapData = await getNextGapRes.json();
    console.log(`  👉 Hệ thống gợi ý số tiếp theo: ${nextGapData.nextNumber}`);
    if (nextGapData.nextNumber === invoiceBNumber) {
      console.log(`  ✅ [PASS] Tái sử dụng số đã xóa thành công! Vị trí khuyết (${invoiceBNumber}) được đề xuất lại.`);
    } else {
      console.log(`  ❌ [FAIL] Không tái sử dụng được số khuyết. Đề xuất: ${nextGapData.nextNumber}, Mong muốn: ${invoiceBNumber}`);
    }

    // KIỂM TRA PHÂN QUYỀN XEM HỢP ĐỒNG ĐÃ XÓA (MỌI NHÂN VIÊN ĐỀU XEM ĐƯỢC)
    const listRes = await fetch(`${API_BASE}/invoices`, {
      headers: { 'Authorization': `Bearer ${tokens.staffB}` }
    });
    assertStatus(listRes, 200, 'Staff B lấy danh sách hóa đơn');
    const invoicesList = await listRes.json();

    const hasActiveOwn = invoicesList.some(i => i.id === invoiceAId && !i.isDeleted);
    const hasActiveOther = invoicesList.some(i => i.id === invoiceCId && !i.isDeleted);
    const hasDeletedOther = invoicesList.some(i => i.id === invoiceBId && i.isDeleted);

    console.log(`  👉 Có thấy Hợp đồng A hoạt động của người khác không: ${hasActiveOwn ? 'Có' : 'Không'}`);
    console.log(`  👉 Có thấy Hợp đồng C hoạt động của người khác không: ${hasActiveOther ? 'Có' : 'Không'}`);
    console.log(`  👉 Có thấy Hợp đồng B đã xóa (số trống) của người khác không: ${hasDeletedOther ? 'Có' : 'Không'}`);

    if (!hasActiveOwn && !hasActiveOther && hasDeletedOther) {
      console.log('  ✅ [PASS] Phân quyền hiển thị số trống hoạt động hoàn hảo! Nhân viên xem được số trống của người khác nhưng không xem được số hoạt động.');
    } else {
      console.log('  ❌ [FAIL] Phân quyền hiển thị số trống chưa đúng.');
    }

    // KIỂM TRA: ÔNG B SỬA HỢP ĐỒNG ĐÃ XOÁ CỦA ÔNG A THÌ PHẢI ĐỔI OWNER SANG ÔNG B
    const getMeBRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokens.staffB}` }
    });
    const meBData = await getMeBRes.json();
    const staffBUserId = meBData.id;

    const editFormB = new FormData();
    editFormB.append('invoiceNumber', invoiceBNumber);
    editFormB.append('clientName', 'Khách hàng B - Khôi phục bởi Staff B');
    editFormB.append('amount', '280000');
    editFormB.append('serviceTypeId', '1');

    const editResByB = await fetch(`${API_BASE}/invoices/${invoiceBId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.staffB}`
      },
      body: editFormB
    });
    assertStatus(editResByB, 200, 'Staff B chỉnh sửa và khôi phục hợp đồng đã xoá của Staff A');
    const restoredInvoiceB = await editResByB.json();

    console.log(`  👉 ID người khôi phục hợp đồng (Staff B): ${staffBUserId}`);
    console.log(`  👉 CreatedBy thực tế của hợp đồng sau khi khôi phục: ${restoredInvoiceB.createdBy}`);

    if (restoredInvoiceB.createdBy === staffBUserId) {
      console.log('  ✅ [PASS] Cập nhật chủ sở hữu thành công! Hợp đồng đã xoá sau khi sửa đã đổi sang tên người sửa mới.');
    } else {
      console.log('  ❌ [FAIL] Chủ sở hữu vẫn giữ nguyên là người tạo ban đầu.');
    }

  } catch (err) {
    console.error('❌ Lỗi kiểm thử Invoices:', err);
  }

  // ==========================================
  // III. SERVICE TYPES MANAGEMENT
  // ==========================================
  logHeader('III. SERVICE TYPES / LOẠI DỊCH VỤ (PHÂN QUYỀN VÀ CRUD)');

  let testServiceTypeId;

  try {
    const createTypeFail = await fetch(`${API_BASE}/servicetypes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: 'SaoY', typeName: 'Dịch vụ Staff Tạo', description: 'Test' })
    });
    assertStatus(createTypeFail, 403, 'Staff cố tạo Loại dịch vụ (Bị chặn 403)');

    const createTypeSuccess = await fetch(`${API_BASE}/servicetypes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.admin}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: 'SaoY', typeName: 'Dịch vụ Admin Tạo', description: 'Test' })
    });
    assertStatus(createTypeSuccess, [200, 201], 'Admin tạo Loại dịch vụ (Thành công)');
    const newType = await createTypeSuccess.json();
    testServiceTypeId = newType.id;

    const editTypeFail = await fetch(`${API_BASE}/servicetypes/${testServiceTypeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: 'SaoY', typeName: 'Sửa bởi Staff', description: 'Test' })
    });
    assertStatus(editTypeFail, 403, 'Staff cố sửa Loại dịch vụ (Bị chặn 403)');

    const editTypeSuccess = await fetch(`${API_BASE}/servicetypes/${testServiceTypeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.manager}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: 'SaoY', typeName: 'Sửa bởi Manager', description: 'Test' })
    });
    assertStatus(editTypeSuccess, [200, 204], 'Manager sửa Loại dịch vụ (Thành công)');

    const deleteTypeFail = await fetch(`${API_BASE}/servicetypes/${testServiceTypeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(deleteTypeFail, 403, 'Staff cố xóa Loại dịch vụ (Bị chặn 403)');

    const deleteTypeSuccess = await fetch(`${API_BASE}/servicetypes/${testServiceTypeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    assertStatus(deleteTypeSuccess, [200, 204], 'Admin xóa Loại dịch vụ (Thành công)');

  } catch (err) {
    console.error('❌ Lỗi kiểm thử ServiceTypes:', err);
  }

  // ==========================================
  // IV. BANKS MANAGEMENT
  // ==========================================
  logHeader('IV. BANKS / NGÂN HÀNG (PHÂN QUYỀN VÀ CRUD)');

  let testBankId;

  try {
    const createBankFail = await fetch(`${API_BASE}/banks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.staffA}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bankName: 'Ngân hàng Staff', code: 'NHS', description: 'Test' })
    });
    assertStatus(createBankFail, 403, 'Staff cố tạo Ngân hàng (Bị chặn 403)');

    const createBankSuccess = await fetch(`${API_BASE}/banks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.admin}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bankName: 'Ngân hàng Admin', code: 'NHA', description: 'Test' })
    });
    assertStatus(createBankSuccess, [200, 201], 'Admin tạo Ngân hàng (Thành công)');
    const newBank = await createBankSuccess.json();
    testBankId = newBank.id;

    const editBankFail = await fetch(`${API_BASE}/banks/${testBankId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.manager}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bankName: 'Sửa bởi Manager', code: 'NHA', description: 'Test' })
    });
    assertStatus(editBankFail, 403, 'Manager cố sửa Ngân hàng (Bị chặn 403)');

    const editBankSuccess = await fetch(`${API_BASE}/banks/${testBankId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.admin}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bankName: 'Sửa bởi Admin', code: 'NHA', description: 'Test' })
    });
    assertStatus(editBankSuccess, [200, 204], 'Admin sửa Ngân hàng (Thành công)');

    const deleteBankSuccess = await fetch(`${API_BASE}/banks/${testBankId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    assertStatus(deleteBankSuccess, [200, 204], 'Admin xóa Ngân hàng (Thành công)');

  } catch (err) {
    console.error('❌ Lỗi kiểm thử Banks:', err);
  }

  // ==========================================
  // V. DASHBOARD STATS & REPORT EXPORTS
  // ==========================================
  logHeader('V. STATS & EXPORTS (THỐNG KÊ, XUẤT EXCEL & PDF)');

  try {
    const statsRes = await fetch(`${API_BASE}/invoices/stats`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(statsRes, 200, 'Xem thống kê Dashboard');

    const excelRes = await fetch(`${API_BASE}/invoices/export`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(excelRes, 200, 'Xuất báo cáo Excel');
    const excelType = excelRes.headers.get('content-type');
    if (excelType.includes('spreadsheetml')) {
      console.log('  ... Nhận đúng định dạng Excel.');
    }

    const pdfRes = await fetch(`${API_BASE}/invoices/export-pdf`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(pdfRes, 200, 'Xuất báo cáo PDF');
    const pdfType = pdfRes.headers.get('content-type');
    if (pdfType.includes('pdf')) {
      console.log('  ... Nhận đúng định dạng PDF.');
    }

  } catch (err) {
    console.error('❌ Lỗi kiểm thử Stats & Exports:', err);
  }

  // ==========================================
  // VI. AUDIT LOGS
  // ==========================================
  logHeader('VI. AUDIT LOGS (NHẬT KÝ HỆ THỐNG VÀ PHÂN QUYỀN)');

  try {
    const logsFail = await fetch(`${API_BASE}/auditlogs`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(logsFail, 403, 'Staff xem nhật ký hệ thống (Bị chặn 403)');

    const logsSuccess = await fetch(`${API_BASE}/auditlogs`, {
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    assertStatus(logsSuccess, 200, 'Admin xem nhật ký hệ thống (Thành công)');
    const logData = await logsSuccess.json();
    if (logData.length > 0) {
      console.log(`  ... Tìm thấy ${logData.length} nhật ký ghi nhận trên hệ thống.`);
    }

  } catch (err) {
    console.error('❌ Lỗi kiểm thử AuditLogs:', err);
  }

  // ==========================================
  // VII. USER MANAGEMENT
  // ==========================================
  logHeader('VII. USER MANAGEMENT (QUẢN LÝ NHÂN VIÊN, KHÓA/MỞ TÀI KHOẢN)');

  try {
    const listUsersFail = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${tokens.staffA}` }
    });
    assertStatus(listUsersFail, 403, 'Staff xem danh sách nhân viên (Bị chặn 403)');

    const listUsersSuccess = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    assertStatus(listUsersSuccess, 200, 'Admin xem danh sách nhân viên (Thành công)');
    const usersList = await listUsersSuccess.json();
    const targetUser = usersList.find(u => u.username === usernames.staffB);
    const targetUserId = targetUser.id;

    // 3. Admin đặt lại mật khẩu nhân viên về mặc định 123456
    const changePwdRes = await fetch(`${API_BASE}/users/${targetUserId}/reset-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.admin}`
      }
    });
    assertStatus(changePwdRes, 200, 'Admin reset mật khẩu nhân viên');

    // Đăng nhập lại bằng mật khẩu reset "123456" để kiểm tra
    const loginNewPwd = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernames.staffB, password: '123456' })
    });
    assertStatus(loginNewPwd, 200, 'Đăng nhập bằng mật khẩu mặc định sau reset (123456)');

    // Đăng nhập lại với Token mới để cập nhật mật khẩu riêng phù hợp độ mạnh phức tạp
    const loginNewPwdData = await loginNewPwd.json();
    const tempToken = loginNewPwdData.token;

    // Đổi mật khẩu sang mật khẩu mạnh mới để đảm bảo tính an toàn
    const changeOwnPwdRes = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tempToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ oldPassword: '123456', newPassword: 'NewSecurePassword123!' })
    });
    assertStatus(changeOwnPwdRes, 200, 'Người dùng tự đổi mật khẩu yếu sang mật khẩu mạnh phức tạp');

    // Đăng nhập lại bằng mật khẩu mạnh mới
    const loginFinal = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernames.staffB, password: 'NewSecurePassword123!' })
    });
    assertStatus(loginFinal, 200, 'Đăng nhập lại bằng mật khẩu mạnh mới');

    // 4. Admin khóa tài khoản nhân viên (sử dụng toggle-lock)
    const lockRes = await fetch(`${API_BASE}/users/${targetUserId}/toggle-lock`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    assertStatus(lockRes, 200, 'Admin gọi toggle-lock để khóa tài khoản nhân viên');

    // Thử đăng nhập bằng tài khoản bị khóa -> bị chặn
    const loginLocked = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernames.staffB, password: 'NewSecurePassword123!' })
    });
    assertStatus(loginLocked, 400, 'Đăng nhập vào tài khoản bị khóa bị chặn');
    const lockedMsg = await loginLocked.text();
    console.log(`  👉 Thông báo khóa trả về: "${lockedMsg}"`);

    // 5. Admin mở khóa tài khoản nhân viên (sử dụng toggle-lock lại)
    const unlockRes = await fetch(`${API_BASE}/users/${targetUserId}/toggle-lock`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    assertStatus(unlockRes, 200, 'Admin gọi toggle-lock lần 2 để mở khóa tài khoản nhân viên');

    // Thử đăng nhập lại -> thành công
    const loginUnlocked = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernames.staffB, password: 'NewSecurePassword123!' })
    });
    assertStatus(loginUnlocked, 200, 'Đăng nhập lại thành công sau khi được mở khóa');

  } catch (err) {
    console.error('❌ Lỗi kiểm thử UserManagement:', err);
  }

  logHeader('TẤT CẢ KIỂM THỬ ĐÃ HOÀN TẤT!');
}

runTests();
