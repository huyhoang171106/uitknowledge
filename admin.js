let currentTab = 'videos';
let currentItem = null;

// Security: Sanitization helper to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// DOM Elements
const authContainer = document.getElementById('auth-container');
const adminContainer = document.getElementById('admin-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const tabTitle = document.getElementById('tab-title');
const contentArea = document.getElementById('content-area');
const addBtn = document.getElementById('add-btn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const itemForm = document.getElementById('item-form');
const dynamicFields = document.getElementById('dynamic-fields');

// Initialize
async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        showAdmin();
    } else {
        showAuth();
    }
}

// Auth UI Toggle
function showAdmin() {
    authContainer.style.display = 'none';
    adminContainer.style.display = 'grid';
    loadData();
}

function showAuth() {
    authContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
}

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        loginError.textContent = error.message;
    } else {
        showAdmin();
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showAuth();
});

// Tab Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.id === 'logout-btn') return;

        document.querySelector('.nav-item.active').classList.remove('active');
        btn.classList.add('active');
        currentTab = btn.dataset.tab;

        const label = btn.querySelector('span').textContent;
        tabTitle.textContent = label;
        loadData();
    });
});

// Load Data from Supabase
async function loadData() {
    contentArea.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p style="font-family: 'Fira Code'; font-size: 12px; letter-spacing: 0.1em;">FETCHING_RESOURCES...</p>
        </div>
    `;

    const { data, error } = await supabaseClient
        .from(currentTab)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        contentArea.innerHTML = `<div class="error-message">Lỗi: ${error.message}</div>`;
        return;
    }

    renderItems(data);
}

// Render Items to Dashboard
function renderItems(items) {
    if (items.length === 0) {
        contentArea.innerHTML = `
            <div class="loading-state">
                <div style="opacity: 0.2; font-size: 4rem; margin-bottom: 2rem;">📂</div>
                <p>Kho dữ liệu trống. Hãy khởi tạo mục mới.</p>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = items.map(item => `
        <div class="admin-item-card" data-id="${item.id}">
            <div class="item-info">
                <h3>${escapeHTML(item.title || item.name)}</h3>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <p>ID: ${escapeHTML(item.video_id || item.price || item.id.substring(0, 8))}</p>
                    <span style="width: 4px; height: 4px; border-radius: 50%; background: var(--text-muted);"></span>
                    <p>${item.image_url ? 'IMAGE_SYNCED' : escapeHTML(item.placeholder_class || 'UIT_KNOWLEDGE_CORE')}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary btn-small" onclick="openEditModal('${item.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    Sửa
                </button>
                <button class="btn btn-secondary btn-small" onclick="deleteItem('${item.id}')" style="color: #ff4b4b; border-color: rgba(255, 75, 75, 0.2);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Xóa
                </button>
            </div>
        </div>
    `).join('');
}

// Modal Handlers
addBtn.addEventListener('click', () => {
    openAddModal();
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
});

function openAddModal() {
    currentItem = null;
    modalTitle.textContent = `Thêm ${currentTab.slice(0, -1)} mới`;
    modalSubtitle.textContent = 'INIT_NEW_ENTRY';
    renderFields();
    modal.classList.add('active');
}

async function openEditModal(id) {
    const { data, error } = await supabaseClient
        .from(currentTab)
        .select('*')
        .eq('id', id)
        .single();

    if (error) return alert(error.message);

    currentItem = data;
    modalTitle.textContent = `Chỉnh sửa ${currentTab.slice(0, -1)}`;
    modalSubtitle.textContent = 'PATCH_DATABASE_RECORDS';
    renderFields(data);
    modal.classList.add('active');
}

async function fetchYouTubeData() {
    const videoIdField = document.querySelector('input[name="video_id"]');
    const titleField = document.querySelector('input[name="title"]');
    const videoId = videoIdField.value.trim();

    if (!videoId) return alert('Vui lòng nhập YouTube ID trước!');

    const btn = document.getElementById('fetch-yt-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width:12px;height:12px;margin:0"></span>';
    btn.disabled = true;

    try {
        const response = await fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();

        if (data.title) {
            titleField.value = data.title;
        } else {
            alert('Không tìm thấy thông tin video. Vui lòng kiểm tra lại ID.');
        }
    } catch (err) {
        alert('Lỗi khi kết nối với máy chủ YouTube.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function renderFields(data = {}) {
    let fields = '';

    if (currentTab === 'videos') {
        fields = `
            <div class="form-group">
                <label>YouTube ID</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" name="video_id" value="${data.video_id || ''}" required placeholder="Ví dụ: dQw4w9WgXcQ" style="flex: 1;">
                    <button type="button" id="fetch-yt-btn" class="btn btn-secondary btn-small" onclick="fetchYouTubeData()">Lấy thông tin</button>
                </div>
            </div>
            <div class="form-group">
                <label>Tiêu đề Video</label>
                <input type="text" name="title" value="${data.title || ''}" required>
            </div>
            <div class="form-group">
                <label>Mô tả chi tiết</label>
                <textarea rows="3" name="description">${data.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Thời lượng (MM:SS)</label>
                <input type="text" name="duration" value="${data.duration || ''}" placeholder="vd: 12:45">
            </div>
            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.8rem; cursor: pointer; text-transform: none; color: var(--text);">
                    <input type="checkbox" name="is_featured" ${data.is_featured ? 'checked' : ''} style="width: auto;"> Đánh dấu là Video nổi bật
                </label>
            </div>
        `;
    } else if (currentTab === 'courses') {
        fields = `
            <div class="form-group">
                <label>Tên khóa học</label>
                <input type="text" name="title" value="${data.title || ''}" required>
            </div>
            <div class="form-group">
                <label>Mô tả ngắn</label>
                <textarea rows="3" name="description">${data.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Học phí / Trạng thái</label>
                <input type="text" name="price" value="${data.price || ''}">
            </div>
            <div class="form-group">
                <label>Link đăng ký</label>
                <input type="text" name="registration_link" value="${data.registration_link || ''}">
            </div>
            <div class="form-group">
                <label>QR Thanh toán (Upload)</label>
                <input type="file" id="course-qr-file" accept="image/*" style="margin-bottom: 0.5rem;">
                ${data.payment_qr_url ? `<p style="font-size: 11px; color: var(--primary);">Đã có QR: ${data.payment_qr_url.split('/').pop()}</p>` : ''}
            </div>
            <div class="form-group">
                <label>Màu sắc giao diện (pastel-1 -> 4)</label>
                <select name="image_class">
                    <option value="pastel-1" ${data.image_class === 'pastel-1' ? 'selected' : ''}>Màu hồng nhạt</option>
                    <option value="pastel-2" ${data.image_class === 'pastel-2' ? 'selected' : ''}>Màu xanh tím</option>
                    <option value="pastel-3" ${data.image_class === 'pastel-3' ? 'selected' : ''}>Màu xanh lá</option>
                    <option value="pastel-4" ${data.image_class === 'pastel-4' ? 'selected' : ''}>Màu trung tính</option>
                </select>
            </div>
        `;
    } else if (currentTab === 'merch') {
        fields = `
            <div class="form-group">
                <label>Tên sản phẩm</label>
                <input type="text" name="name" value="${data.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea rows="3" name="description">${data.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Giá bán</label>
                <input type="text" name="price" value="${data.price || ''}">
            </div>
            <div class="form-group">
                <label>Hình ảnh sản phẩm (Upload)</label>
                <input type="file" id="merch-image-file" accept="image/*" style="margin-bottom: 0.5rem;">
                ${data.image_url ? `<p style="font-size: 11px; color: var(--primary);">Đã có ảnh: ${data.image_url.split('/').pop()}</p>` : ''}
            </div>
            <div class="form-group">
                <label>QR Thanh toán (Upload)</label>
                <input type="file" id="merch-qr-file" accept="image/*" style="margin-bottom: 0.5rem;">
                ${data.payment_qr_url ? `<p style="font-size: 11px; color: var(--primary);">Đã có QR: ${data.payment_qr_url.split('/').pop()}</p>` : ''}
            </div>
            <div class="form-group">
                <label>Loại sản phẩm (Nếu không upload ảnh)</label>
                <select name="placeholder_class">
                    <option value="merch-shirt" ${data.placeholder_class === 'merch-shirt' ? 'selected' : ''}>Áo thun</option>
                    <option value="merch-keychain" ${data.placeholder_class === 'merch-keychain' ? 'selected' : ''}>Móc khóa</option>
                    <option value="merch-hoodie" ${data.placeholder_class === 'merch-hoodie' ? 'selected' : ''}>Dây đeo thẻ</option>
                    <option value="merch-sticker" ${data.placeholder_class === 'merch-sticker' ? 'selected' : ''}>Sticker</option>
                </select>
            </div>
        `;
    }

    dynamicFields.innerHTML = fields;
}

// Form Submission
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-btn');
    const originalBtnText = saveBtn.textContent;
    saveBtn.textContent = 'ĐANG XỬ LÝ...';
    saveBtn.disabled = true;

    const allowedKeys = {
        'videos': ['video_id', 'title', 'description', 'duration', 'is_featured'],
        'courses': ['title', 'description', 'price', 'registration_link', 'image_class', 'category', 'is_hot', 'payment_qr_url'],
        'merch': ['name', 'description', 'price', 'placeholder_class', 'payment_qr_url']
    };

    const formData = new FormData(itemForm);
    const payload = {};

    formData.forEach((value, key) => {
        if (!allowedKeys[currentTab].includes(key)) return; // Filter out unauthorized keys

        if (itemForm.elements[key].type === 'checkbox') {
            payload[key] = itemForm.elements[key].checked;
        } else {
            payload[key] = value;
        }
    });

    // Handle Image Upload for Courses (QR Code)
    if (currentTab === 'courses') {
        const fileInput = document.getElementById('course-qr-file');
        const file = fileInput.files[0];

        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `qrs/${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from('courses')
                .upload(filePath, file);

            if (uploadError) {
                alert('Lỗi upload QR: ' + uploadError.message);
                saveBtn.textContent = originalBtnText;
                saveBtn.disabled = false;
                return;
            }

            const { data: { publicUrl } } = supabaseClient.storage
                .from('courses')
                .getPublicUrl(filePath);

            payload.payment_qr_url = publicUrl;
        } else if (currentItem && currentItem.payment_qr_url) {
            payload.payment_qr_url = currentItem.payment_qr_url;
        }
    }

    // Handle Image Upload for Merch
    if (currentTab === 'merch') {
        const fileInput = document.getElementById('merch-image-file');
        const file = fileInput.files[0];

        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `merch/${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from('merch')
                .upload(filePath, file);

            if (uploadError) {
                alert('Lỗi upload ảnh: ' + uploadError.message);
                saveBtn.textContent = originalBtnText;
                saveBtn.disabled = false;
                return;
            }

            const { data: { publicUrl } } = supabaseClient.storage
                .from('merch')
                .getPublicUrl(filePath);

            payload.image_url = publicUrl;
        } else if (currentItem && currentItem.image_url) {
            payload.image_url = currentItem.image_url;
        }

        // Handle QR Upload for Merch
        const qrInput = document.getElementById('merch-qr-file');
        const qrFile = qrInput.files[0];

        if (qrFile) {
            const fileExt = qrFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `qrs/${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from('merch')
                .upload(filePath, qrFile);

            if (uploadError) {
                alert('Lỗi upload QR: ' + uploadError.message);
                saveBtn.textContent = originalBtnText;
                saveBtn.disabled = false;
                return;
            }

            const { data: { publicUrl } } = supabaseClient.storage
                .from('merch')
                .getPublicUrl(filePath);

            payload.payment_qr_url = publicUrl;
        } else if (currentItem && currentItem.payment_qr_url) {
            payload.payment_qr_url = currentItem.payment_qr_url;
        }
    }

    let result;
    if (currentItem) {
        result = await supabaseClient.from(currentTab).update(payload).eq('id', currentItem.id);
    } else {
        result = await supabaseClient.from(currentTab).insert([payload]);
    }

    if (result.error) {
        alert(result.error.message);
    } else {
        modal.classList.remove('active');
        loadData();
    }

    saveBtn.textContent = originalBtnText;
    saveBtn.disabled = false;
});

// Delete Item
async function deleteItem(id) {
    if (!confirm('Xác nhận gỡ bỏ dữ liệu này khỏi hệ thống?')) return;

    const { error } = await supabaseClient.from(currentTab).delete().eq('id', id);

    if (error) {
        alert(error.message);
    } else {
        loadData();
    }
}

// Global exposure
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;
window.fetchYouTubeData = fetchYouTubeData;

init();
