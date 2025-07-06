// --- FUNGSI NAVIGASI PANEL ADMIN ---
function setupAdminNavigation() {
    const navItems = document.querySelectorAll('.admin-nav .nav-item');
    const contentPanels = document.querySelectorAll('.content-panel');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.dataset.target;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            contentPanels.forEach(panel => panel.classList.remove('active'));

            item.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// --- FUNGSI LOG AKTIVITAS ---
function logActivity(message, type = 'info') {
    const logList = document.getElementById('log-list');
    if (!logList) return;
    const newLog = document.createElement('li');
    newLog.className = type;
    newLog.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logList.prepend(newLog);
}

// --- FUNGSI HELPER UNTUK BACA FILE ---
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

// --- FUNGSI KELOLA HERO SECTION ---
async function updateHero() {
    logActivity("Menyimpan data hero...", 'info');
    let heroData = JSON.parse(localStorage.getItem('heroData') || '{}');
    heroData.welcomeText = document.getElementById('hero-welcome').value;
    heroData.headline = document.getElementById('hero-headline').value;
    heroData.tagline = document.getElementById('hero-tagline').value;

    const bgFile = document.getElementById('hero-image-file').files[0];
    const sideFile = document.getElementById('hero-side-image-file').files[0];

    try {
        const bgResult = await readFileAsBase64(bgFile);
        const sideResult = await readFileAsBase64(sideFile);
        if (bgResult) heroData.imageUrl = bgResult;
        if (sideResult) heroData.sideImageUrl = sideResult;
        localStorage.setItem('heroData', JSON.stringify(heroData));
        logActivity("Data Hero berhasil diperbarui!", 'success');
    } catch (error) {
        logActivity("Gagal membaca file gambar hero!", 'error');
    }
}

function removeHeroSideImage() {
    if (!confirm("Yakin ingin menghapus gambar samping hero?")) return;
    let heroData = JSON.parse(localStorage.getItem('heroData') || '{}');
    heroData.sideImageUrl = null;
    localStorage.setItem('heroData', JSON.stringify(heroData));
    logActivity("Gambar samping hero telah dihapus.", 'success');
}

function loadCurrentHeroData() {
    const heroData = JSON.parse(localStorage.getItem('heroData') || '{}');
    if (heroData) {
        document.getElementById('hero-welcome').value = heroData.welcomeText || '';
        document.getElementById('hero-headline').value = heroData.headline || '';
        document.getElementById('hero-tagline').value = heroData.tagline || '';
    }
}

// --- FUNGSI KELOLA KATEGORI PRODUK ---
const defaultCategories = [
    { name: 'Makanan Kering', id: 'makanan-kering', imageUrl: '' },
    { name: 'Makanan Basah', id: 'makanan-basah', imageUrl: '' },
    { name: 'Aksesoris', id: 'aksesoris', imageUrl: '' },
    { name: 'Obat-obatan', id: 'obat-obatan', imageUrl: '' }
];
function getStoredCategories() {
    return JSON.parse(localStorage.getItem('productCategories')) || defaultCategories;
}
function saveCategories(cats) {
    localStorage.setItem('productCategories', JSON.stringify(cats));
}
async function updateCategoryImages() {
    logActivity("Menyimpan gambar kategori...", 'info');
    let currentCategories = getStoredCategories();
    for (let i = 0; i < currentCategories.length; i++) {
        const category = currentCategories[i];
        const fileInput = document.getElementById(`category-image-${category.id}`);
        if (fileInput && fileInput.files.length > 0) {
            try {
                const newImageUrl = await readFileAsBase64(fileInput.files[0]);
                category.imageUrl = newImageUrl;
            } catch (error) {
                logActivity(`Gagal membaca gambar untuk ${category.name}`, 'error');
            }
        }
    }
    saveCategories(currentCategories);
    logActivity("Gambar kategori berhasil diperbarui!", 'success');
}

// --- FUNGSI KELOLA PRODUK POPULER (DENGAN FUNGSI EDIT) ---
function getStoredProducts() {
    return JSON.parse(localStorage.getItem('popularProducts') || '[]');
}

function saveProducts(products) {
    localStorage.setItem('popularProducts', JSON.stringify(products));
}

function addProduct() {
    const name = document.getElementById('product-name').value;
    const imageFile = document.getElementById('product-image-file').files[0];
    if (!name || !imageFile) {
        logActivity("Gagal: Nama dan Gambar Produk Populer harus diisi!", 'error');
        return;
    }
    logActivity(`Menyimpan produk populer "${name}"...`, 'info');
    const reader = new FileReader();
    reader.onloadend = function() {
        const imageUrl = reader.result;
        const products = getStoredProducts();
        products.push({ name, imageUrl });
        saveProducts(products);
        document.getElementById('product-name').value = '';
        document.getElementById('product-image-file').value = null;
        loadAllProductPreviews();
        logActivity(`Produk Populer "${name}" berhasil ditambahkan!`, 'success');
    };
    reader.onerror = () => logActivity(`Error: Gagal membaca file gambar "${name}"!`, 'error');
    reader.readAsDataURL(imageFile);
}

function deleteProduct(index) {
    if (!confirm('Yakin ingin menghapus produk populer ini?')) return;
    const products = getStoredProducts();
    const productName = products[index].name;
    products.splice(index, 1);
    saveProducts(products);
    loadAllProductPreviews();
    logActivity(`Produk Populer "${productName}" telah dihapus.`, 'success');
}

// FUNGSI DIPERBARUI: Menambahkan tombol Edit
// GANTI FUNGSI INI DI admin.js
function loadAllProductPreviews() {
    const container = document.getElementById('product-preview-container');
    if (!container) return;
    container.innerHTML = '';
    getStoredProducts().forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card';
        card.id = `popular-product-card-${index}`;
        // PERBARUI BARIS INI: Tambahkan class btn-edit dan btn-delete
        card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <p>${product.name}</p>
            <button onclick="editProduct(${index})" class="btn-edit">Edit</button>
            <button onclick="deleteProduct(${index})" class="btn-delete">Hapus</button>
        `;
        container.appendChild(card);
    });
}

// --- FUNGSI BARU UNTUK EDIT PRODUK POPULER ---
function editProduct(index) {
    const product = getStoredProducts()[index];
    const card = document.getElementById(`popular-product-card-${index}`);

    card.innerHTML = `
        <div class="edit-form">
            <input type="text" id="edit-name-popular-${index}" value="${product.name}" placeholder="Nama Produk">
            <input type="file" id="edit-image-popular-${index}" accept="image/*">
            <p style="font-size:0.8em; margin-top:-0.5em; margin-bottom:1em;">Pilih file baru untuk ganti gambar.</p>
            <button onclick="saveProductEdit(${index})">Simpan</button>
            <button onclick="cancelProductEdit()" class="delete-btn">Batal</button>
        </div>
    `;
}

async function saveProductEdit(index) {
    const newName = document.getElementById(`edit-name-popular-${index}`).value;
    const newImageFile = document.getElementById(`edit-image-popular-${index}`).files[0];

    if (!newName) {
        logActivity("Gagal: Nama produk tidak boleh kosong!", 'error');
        return;
    }
    
    logActivity(`Menyimpan perubahan untuk produk populer...`, 'info');
    
    const products = getStoredProducts();
    let product = products[index];
    product.name = newName;

    try {
        if (newImageFile) {
            const newImageUrl = await readFileAsBase64(newImageFile);
            product.imageUrl = newImageUrl;
        }
        saveProducts(products);
        loadAllProductPreviews();
        logActivity(`Produk populer "${newName}" berhasil diperbarui!`, 'success');
    } catch (error) {
        logActivity(`Error: Gagal membaca file gambar saat mengedit!`, 'error');
    }
}

function cancelProductEdit() {
    loadAllProductPreviews();
}

// --- FUNGSI KELOLA SEMUA PRODUK (PRODUK.HTML) ---
function getStoredMainProducts() {
    return JSON.parse(localStorage.getItem('mainProducts') || '[]');
}
function saveMainProducts(products) {
    localStorage.setItem('mainProducts', JSON.stringify(products));
}
function addMainProduct() {
    const name = document.getElementById('main-product-name').value;
    const imageFile = document.getElementById('main-product-image-file').files[0];
    const category = document.getElementById('main-product-category').value;
    if (!name || !imageFile || !category) {
        logActivity("Gagal: Nama, Gambar, dan Kategori Produk harus diisi!", 'error');
        return;
    }
    logActivity(`Menyimpan produk utama "${name}"...`, 'info');
    const reader = new FileReader();
    reader.onloadend = function() {
        const imageUrl = reader.result;
        const products = getStoredMainProducts();
        products.push({ name, imageUrl, category });
        saveMainProducts(products);
        document.getElementById('main-product-name').value = '';
        document.getElementById('main-product-image-file').value = null;
        loadMainProductPreviews();
        logActivity(`Produk "${name}" ditambahkan ke halaman utama!`, 'success');
    };
    reader.onerror = () => logActivity(`Error saat membaca file untuk produk utama!`, 'error');
    reader.readAsDataURL(imageFile);
}
function deleteMainProduct(index) {
    if (!confirm('Yakin ingin menghapus produk ini dari halaman produk?')) return;
    const products = getStoredMainProducts();
    const productName = products[index].name;
    products.splice(index, 1);
    saveMainProducts(products);
    loadMainProductPreviews();
    logActivity(`Produk "${productName}" telah dihapus dari halaman produk.`, 'success');
}
// GANTI FUNGSI INI DI admin.js
function loadMainProductPreviews() {
    const container = document.getElementById('main-product-preview-container');
    if (!container) return;
    container.innerHTML = '';
    getStoredMainProducts().forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card';
        // PERBARUI BARIS INI: Tambahkan class btn-delete
        card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <p>${product.name}</p>
            <span style="display:block; font-size:0.8em; color:#888;">Kategori: ${product.category}</span>
            <button onclick="deleteMainProduct(${index})" class="btn-delete">Hapus</button>
        `;
        container.appendChild(card);
    });
}

// --- FUNGSI KELOLA GALERI FOTO ---
function getStoredGalleryImages() {
    return JSON.parse(localStorage.getItem('galleryImages') || '[]');
}
function saveGalleryImages(images) {
    localStorage.setItem('galleryImages', JSON.stringify(images));
}
function addGalleryImage() {
    const imageFile = document.getElementById('gallery-image-file').files[0];
    if (!imageFile) {
        logActivity("Gagal: Pilih file gambar terlebih dahulu!", 'error');
        return;
    }
    logActivity(`Menyimpan foto galeri...`, 'info');
    const reader = new FileReader();
    reader.onloadend = function() {
        const imageUrl = reader.result;
        const images = getStoredGalleryImages();
        images.push({ imageUrl });
        saveGalleryImages(images);
        document.getElementById('gallery-image-file').value = null;
        loadGalleryPreview();
        logActivity(`Foto baru berhasil ditambahkan ke galeri!`, 'success');
    };
    reader.onerror = () => logActivity(`Error: Gagal membaca file gambar untuk galeri!`, 'error');
    reader.readAsDataURL(imageFile);
}
function deleteGalleryImage(index) {
    if (!confirm('Yakin ingin menghapus foto ini dari galeri?')) return;
    const images = getStoredGalleryImages();
    images.splice(index, 1);
    saveGalleryImages(images);
    loadGalleryPreview();
    logActivity(`Foto telah dihapus dari galeri.`, 'success');
}
// GANTI FUNGSI LAMA INI DI admin.js
// GANTI FUNGSI INI DI admin.js
function loadGalleryPreview() {
    const container = document.getElementById('gallery-preview-container');
    if (!container) return;
    container.innerHTML = '';
    getStoredGalleryImages().forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card';
        // PERBARUI BARIS INI: Ganti tombol overlay dengan tombol standar
        card.innerHTML = `
            <img src="${image.imageUrl}" alt="Galeri ${index + 1}">
            <button onclick="deleteGalleryImage(${index})" class="btn-delete">Hapus</button>
        `;
        container.appendChild(card);
    });
}
// Tambahkan DUA fungsi baru ini di mana saja di dalam admin.js
function updateContactInfo() {
    logActivity("Menyimpan info kontak...", 'info');
    const contactData = {
        address: document.getElementById('admin-contact-address').value,
        email: document.getElementById('admin-contact-email').value,
        phone: document.getElementById('admin-contact-phone').value,
        mapUrl: document.getElementById('admin-contact-map').value
    };
    localStorage.setItem('contactPageData', JSON.stringify(contactData));
    logActivity("Info Kontak berhasil diperbarui!", 'success');
}

function loadCurrentContactData() {
    const contactData = JSON.parse(localStorage.getItem('contactPageData') || '{}');
    if (contactData) {
        document.getElementById('admin-contact-address').value = contactData.address || '';
        document.getElementById('admin-contact-email').value = contactData.email || '';
        document.getElementById('admin-contact-phone').value = contactData.phone || '';
        document.getElementById('admin-contact-map').value = contactData.mapUrl || '';
    }
}

// Perbarui event listener DOMContentLoaded di bagian bawah admin.js
document.addEventListener('DOMContentLoaded', () => {
    setupAdminNavigation();
    logActivity("Halaman admin dimuat.", 'info');
    loadCurrentHeroData();
    loadAllProductPreviews();
    loadMainProductPreviews();
    loadGalleryPreview();
    loadCurrentContactData(); // <-- Tambahkan baris ini
});