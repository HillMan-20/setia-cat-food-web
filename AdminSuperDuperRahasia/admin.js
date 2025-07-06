// admin.js (Versi Perbaikan untuk Masalah Penyimpanan)

document.addEventListener('DOMContentLoaded', () => {

    // --- PEMBAGIAN ELEMEN ---
    const loginContainer = document.getElementById('login-container');
    const mainAdminContainer = document.getElementById('main-admin-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const logList = document.getElementById('log-list');

    // --- VARIABEL GLOBAL ---
    let websiteData = {};
    const defaultCategories = [
        { name: 'Makanan Kering', id: 'makanan-kering', imageUrl: '' },
        { name: 'Makanan Basah', id: 'makanan-basah', imageUrl: '' },
        { name: 'Aksesoris', id: 'aksesoris', imageUrl: '' },
        { name: 'Obat-obatan', id: 'obat-obatan', imageUrl: '' }
    ];

    // --- FUNGSI UTAMA ---

    function logActivity(message, type = 'info') {
        if (!logList) return;
        const newLog = document.createElement('li');
        newLog.className = type;
        newLog.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logList.prepend(newLog);
    }

    async function uploadImageAndGetUrl(file) {
        if (!file) return null;
        logActivity(`Mengunggah ${file.name}...`, 'info');
        const token = localStorage.getItem('adminToken');

        try {
            const response = await fetch(`/api/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-vercel-filename': file.name,
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Gagal mengunggah gambar.');
            }

            const result = await response.json();
            logActivity(`${file.name} berhasil diunggah.`, 'success');
            return result.url;
        } catch (error) {
            logActivity(`Error unggah: ${error.message}`, 'error');
            return null;
        }
    }

    async function fetchData() {
        logActivity("Memuat data dari server...", 'info');
        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error('Gagal mengambil data dari server.');
            const data = await response.json();
            websiteData = data || {};
            logActivity("Data berhasil dimuat.", 'success');
        } catch (error) {
            logActivity(`Error memuat data: ${error.message}`, 'error');
            websiteData = {};
        }
    }

    async function saveData() {
        logActivity("Menyimpan perubahan ke server...", 'info');
        const token = localStorage.getItem('adminToken');
        if (!token) return logActivity("Sesi tidak valid. Silakan login ulang.", 'error');

        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newData: websiteData })
            });
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Gagal menyimpan data ke server.');
            }
            logActivity("Semua perubahan berhasil disimpan!", 'success');
        } catch (error) {
            logActivity(`Error menyimpan data: ${error.message}`, 'error');
        }
    }

    // --- FUNGSI RENDER & UPDATE ---
    
    function loadCurrentHeroData() {
        const d = websiteData.heroData || {};
        document.getElementById('hero-welcome').value = d.welcomeText || '';
        document.getElementById('hero-headline').value = d.headline || '';
        document.getElementById('hero-tagline').value = d.tagline || '';
    }
    
    // ==================================================================
    // ### PERBAIKAN FUNGSI UPDATE HERO ###
    // ==================================================================
    async function updateHero() {
        let hasChanges = false;

        if (!websiteData.heroData) websiteData.heroData = {};
        
        // Simpan data teks terlebih dahulu
        const welcomeText = document.getElementById('hero-welcome').value;
        const headline = document.getElementById('hero-headline').value;
        const tagline = document.getElementById('hero-tagline').value;

        if (websiteData.heroData.welcomeText !== welcomeText || websiteData.heroData.headline !== headline || websiteData.heroData.tagline !== tagline) {
            websiteData.heroData.welcomeText = welcomeText;
            websiteData.heroData.headline = headline;
            websiteData.heroData.tagline = tagline;
            hasChanges = true;
        }

        // Proses unggah gambar latar
        const bgFile = document.getElementById('hero-image-file').files[0];
        if (bgFile) {
            const newUrl = await uploadImageAndGetUrl(bgFile);
            if(newUrl) {
                websiteData.heroData.imageUrl = newUrl;
                hasChanges = true;
            }
        }

        // Proses unggah gambar samping
        const sideFile = document.getElementById('hero-side-image-file').files[0];
        if (sideFile) {
            const newUrl = await uploadImageAndGetUrl(sideFile);
            if (newUrl) {
                websiteData.heroData.sideImageUrl = newUrl;
                hasChanges = true;
            }
        }
        
        // Hanya simpan jika ada perubahan (baik teks maupun gambar)
        if (hasChanges) {
            await saveData();
        } else {
            logActivity("Tidak ada perubahan untuk disimpan.", "info");
        }
    }
    // ==================================================================
    // ### AKHIR PERBAIKAN ###
    // ==================================================================


    function removeHeroSideImage() {
        if (!confirm("Yakin hapus gambar samping?")) return;
        if (websiteData.heroData) {
            websiteData.heroData.sideImageUrl = null;
            saveData();
        }
    }

    async function updateCategoryImages() {
        if (!websiteData.productCategories) websiteData.productCategories = defaultCategories;
        let hasChanges = false;
        for (const category of websiteData.productCategories) {
            const fileInput = document.getElementById(`category-image-${category.id}`);
            if (fileInput && fileInput.files.length > 0) {
                const newUrl = await uploadImageAndGetUrl(fileInput.files[0]);
                if(newUrl) {
                    category.imageUrl = newUrl;
                    hasChanges = true;
                }
            }
        }
        if (hasChanges) await saveData();
    }

    function loadAllProductPreviews() {
        const container = document.getElementById('product-preview-container');
        if (!container) return;
        container.innerHTML = '';
        (websiteData.popularProducts || []).forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'preview-card';
            card.id = `popular-product-card-${index}`;
            card.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}"><p>${product.name}</p><button class="btn-edit" data-index="${index}">Edit</button><button class="btn-delete" data-index="${index}">Hapus</button>`;
            container.appendChild(card);
        });
    }

    function editProduct(index) {
        const product = websiteData.popularProducts[index];
        const card = document.getElementById(`popular-product-card-${index}`);
        card.innerHTML = `<div class="edit-form"><input type="text" id="edit-name-popular-${index}" value="${product.name}" placeholder="Nama Produk"><input type="file" id="edit-image-popular-${index}" accept="image/*"><p style="font-size:0.8em; margin-top:-0.5em; margin-bottom:1em;">Pilih file baru</p><button class="save-edit-btn" data-index="${index}">Simpan</button><button class="cancel-edit-btn">Batal</button></div>`;
    }
    
    async function saveProductEdit(index) {
        const newName = document.getElementById(`edit-name-popular-${index}`).value;
        const newImageFile = document.getElementById(`edit-image-popular-${index}`).files[0];
        if (!newName) return logActivity("Nama tidak boleh kosong!", 'error');
        
        let product = websiteData.popularProducts[index];
        product.name = newName;

        if (newImageFile) {
            const newUrl = await uploadImageAndGetUrl(newImageFile);
            if (newUrl) product.imageUrl = newUrl;
            else return;
        }
        
        await saveData();
        loadAllProductPreviews();
    }
    
    async function addProduct() {
        const name = document.getElementById('product-name').value;
        const imageFile = document.getElementById('product-image-file').files[0];
        if (!name || !imageFile) return logActivity("Nama dan Gambar harus diisi!", 'error');

        const imageUrl = await uploadImageAndGetUrl(imageFile);
        if (!imageUrl) return;

        if (!websiteData.popularProducts) websiteData.popularProducts = [];
        websiteData.popularProducts.push({ name, imageUrl });
        await saveData();

        document.getElementById('product-name').value = '';
        document.getElementById('product-image-file').value = null;
        loadAllProductPreviews();
    }

    function deleteProduct(index) {
        if (!confirm('Yakin hapus produk populer?')) return;
        websiteData.popularProducts.splice(index, 1);
        saveData().then(loadAllProductPreviews);
    }

    function loadMainProductPreviews() {
        const container = document.getElementById('main-product-preview-container');
        if (!container) return;
        container.innerHTML = '';
        (websiteData.mainProducts || []).forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'preview-card';
            card.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}"><p>${product.name}</p><span class="category-label">${product.category}</span><button class="btn-delete-main" data-index="${index}">Hapus</button>`;
            container.appendChild(card);
        });
    }

    async function addMainProduct() {
        const name = document.getElementById('main-product-name').value;
        const imageFile = document.getElementById('main-product-image-file').files[0];
        const category = document.getElementById('main-product-category').value;
        if (!name || !imageFile || !category) return logActivity("Nama, Gambar, dan Kategori harus diisi!", 'error');
        
        const imageUrl = await uploadImageAndGetUrl(imageFile);
        if(!imageUrl) return;

        if (!websiteData.mainProducts) websiteData.mainProducts = [];
        websiteData.mainProducts.push({ name, imageUrl, category });
        await saveData();

        document.getElementById('main-product-name').value = '';
        document.getElementById('main-product-image-file').value = null;
        loadMainProductPreviews();
    }

    function deleteMainProduct(index) {
        if (!confirm('Yakin hapus produk ini?')) return;
        websiteData.mainProducts.splice(index, 1);
        saveData().then(loadMainProductPreviews);
    }
    
    function loadGalleryPreview() {
        const container = document.getElementById('gallery-preview-container');
        if (!container) return;
        container.innerHTML = '';
        (websiteData.galleryImages || []).forEach((image, index) => {
            const card = document.createElement('div');
            card.className = 'preview-card';
            card.innerHTML = `<img src="${image.imageUrl}" alt="Galeri ${index + 1}"><button class="btn-delete-gallery" data-index="${index}">Hapus</button>`;
            container.appendChild(card);
        });
    }

    async function addGalleryImage() {
        const imageFile = document.getElementById('gallery-image-file').files[0];
        if (!imageFile) return logActivity("Pilih file gambar!", 'error');
        
        const imageUrl = await uploadImageAndGetUrl(imageFile);
        if (!imageUrl) return;

        if (!websiteData.galleryImages) websiteData.galleryImages = [];
        websiteData.galleryImages.push({ imageUrl });
        await saveData();

        document.getElementById('gallery-image-file').value = null;
        loadGalleryPreview();
    }

    function deleteGalleryImage(index) {
        if (!confirm('Yakin hapus foto ini?')) return;
        websiteData.galleryImages.splice(index, 1);
        saveData().then(loadGalleryPreview);
    }

    function loadCurrentContactData() {
        const d = websiteData.contactPageData || {};
        document.getElementById('admin-contact-address').value = d.address || '';
        document.getElementById('admin-contact-email').value = d.email || '';
        document.getElementById('admin-contact-phone').value = d.phone || '';
        document.getElementById('admin-contact-map').value = d.mapUrl || '';
    }

    async function updateContactInfo() {
        if (!websiteData.contactPageData) websiteData.contactPageData = {};
        websiteData.contactPageData.address = document.getElementById('admin-contact-address').value;
        websiteData.contactPageData.email = document.getElementById('admin-contact-email').value;
        websiteData.contactPageData.phone = document.getElementById('admin-contact-phone').value;
        websiteData.contactPageData.mapUrl = document.getElementById('admin-contact-map').value;
        await saveData();
    }

    async function initializeAdminPage() {
        const navItems = document.querySelectorAll('.admin-nav .nav-item');
        const contentPanels = document.querySelectorAll('.content-panel');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.dataset.target;
                navItems.forEach(nav => nav.classList.remove('active'));
                contentPanels.forEach(panel => panel.classList.remove('active'));
                item.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
            });
        });

        document.body.addEventListener('click', (e) => {
            if (e.target.matches('.btn-delete')) deleteProduct(e.target.dataset.index);
            if (e.target.matches('.btn-edit')) editProduct(e.target.dataset.index);
            if (e.target.matches('.save-edit-btn')) saveProductEdit(e.target.dataset.index);
            if (e.target.matches('.cancel-edit-btn')) loadAllProductPreviews();
            if (e.target.matches('.btn-delete-main')) deleteMainProduct(e.target.dataset.index);
            if (e.target.matches('.btn-delete-gallery')) deleteGalleryImage(e.target.dataset.index);
        });

        document.getElementById('save-hero-btn')?.addEventListener('click', updateHero);
        document.getElementById('remove-hero-side-image-btn')?.addEventListener('click', removeHeroSideImage);
        document.getElementById('save-category-images-btn')?.addEventListener('click', updateCategoryImages);
        document.getElementById('add-popular-product-btn')?.addEventListener('click', addProduct);
        document.getElementById('add-main-product-btn')?.addEventListener('click', addMainProduct);
        document.getElementById('add-gallery-image-btn')?.addEventListener('click', addGalleryImage);
        document.getElementById('save-contact-info-btn')?.addEventListener('click', updateContactInfo);

        await fetchData();
        loadCurrentHeroData();
        loadAllProductPreviews();
        loadMainProductPreviews();
        loadGalleryPreview();
        loadCurrentContactData();
    }

    function showAdminPage() {
        if(loginContainer) loginContainer.style.display = 'none';
        if(mainAdminContainer) mainAdminContainer.style.display = 'block';
        initializeAdminPage();
    }
    function showLoginPage() {
        if(loginContainer) loginContainer.style.display = 'flex';
        if(mainAdminContainer) mainAdminContainer.style.display = 'none';
    }

    if (localStorage.getItem('adminToken')) {
        showAdminPage();
    } else {
        showLoginPage();
    }

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginErrorMessage = document.getElementById('login-error-message');
            if (loginErrorMessage) loginErrorMessage.textContent = '';
            
            const username = e.target.username.value;
            const password = e.target.password.value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Username atau password salah.');
                }
                const { token } = await response.json();
                localStorage.setItem('adminToken', token);
                location.reload();
            } catch(error) {
                if (loginErrorMessage) loginErrorMessage.textContent = error.message;
                logActivity(error.message, 'error');
            }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm('Anda yakin ingin logout?')){
                localStorage.removeItem('adminToken');
                location.reload();
            }
        });
    }
});