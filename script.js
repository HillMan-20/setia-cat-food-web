// --- FUNGSI UTAMA & INISIALISASI ---

// Fungsi ini akan berjalan setelah semua elemen HTML selesai dimuat.
document.addEventListener('DOMContentLoaded', () => {
    // Menjalankan fungsi spesifik berdasarkan halaman yang sedang dibuka
    if (document.querySelector('.hero')) { // Jika ada elemen .hero, berarti ini halaman utama
        loadHomePage();
    }
    if (document.querySelector('.gallery-page')) { // Jika ada elemen .gallery-page, ini halaman galeri
        loadGalleryPage();
    }
    if (document.querySelector('.product-page')) { // Jika ada elemen .product-page, ini halaman produk
        loadProductPage();
    }
    if (document.querySelector('.contact-page')) { // Jika ada elemen .contact-page, ini halaman kontak
        loadContactPage();
    }
    
    // Inisialisasi fungsi universal yang ada di setiap halaman
    initMenuToggle();
    initLightbox();
    initContactForm();
    initSearch(); // Panggil fungsi pencarian baru
    
    // Panggil fungsi untuk tahun otomatis di footer
    initAutoYear();
});


// --- FUNGSI UNIVERSAL (Berjalan di semua halaman) ---

// Fungsi untuk mengaktifkan menu hamburger di mode mobile
function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
}

// Fungsi untuk mengaktifkan pencarian dari navbar
function initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            // Arahkan ke halaman produk dengan parameter pencarian
            window.location.href = `produk.html?q=${encodeURIComponent(query)}`;
        }
    });
}

// Fungsi untuk Lightbox Universal
function initLightbox() {
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    if (!lightboxOverlay) return;
    
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    document.body.addEventListener('click', (e) => {
        const clickedImage = e.target.closest('.product-card img, .gallery-item img');
        if (clickedImage) {
            lightboxImg.src = clickedImage.src;
            lightboxOverlay.classList.add('active');
        }
    });

    const closeLightbox = () => lightboxOverlay.classList.remove('active');
    if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
    });
}

// Fungsi untuk tahun otomatis di footer
function initAutoYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}


// --- FUNGSI-FUNGSI SPESIFIK HALAMAN ---

// Kumpulan fungsi yang dijalankan khusus untuk halaman utama
// GANTI FUNGSI INI DI script.js
function loadHomePage() {
    loadHeroContent();
    loadCategoriesForHomepage();
    loadPopularProducts(); // Ini untuk section Produk Populer

    // PANGGILAN BARU: Membuat carousel untuk setiap kategori
    createCategoryCarousel('Makanan Kering', '#makanan-kering-track');
    createCategoryCarousel('Makanan Basah', '#makanan-basah-track');
    createCategoryCarousel('Aksesoris', '#aksesoris-track');
    createCategoryCarousel('Obat-obatan', '#obat-obatan-track');

    // Inisialisasi SEMUA carousel yang ada di halaman
    document.querySelectorAll('.carousel-container').forEach(initCarousel);
}

// Memuat konten dinamis untuk hero section
function loadHeroContent() {
    const heroData = JSON.parse(localStorage.getItem('heroData') || '{}');
    const heroSection = document.getElementById('hero-section');
    const heroSideImageContainer = document.querySelector('.hero-image');

    if (!heroSection) return;

    document.getElementById('hero-welcome-text').innerText = heroData.welcomeText || 'Selamat datang di';
    document.getElementById('hero-main-headline').innerText = heroData.headline || 'Setia Cat Food';
    document.getElementById('hero-main-tagline').innerText = heroData.tagline || 'Menyediakan makanan, aksesoris, dan kebutuhan lainnya untuk kucing anda';
    
    if (heroData.imageUrl) heroSection.style.backgroundImage = `url('${heroData.imageUrl}')`;
    if (heroData.sideImageUrl) {
        heroSideImageContainer.style.display = 'block';
        heroSideImageContainer.querySelector('img').src = heroData.sideImageUrl;
    } else {
        heroSideImageContainer.style.display = 'none';
    }
}

// Memuat kategori produk sebagai link di halaman utama
function loadCategoriesForHomepage() {
    const defaultCategories = [
        { name: 'Makanan Kering', id: 'makanan-kering', imageUrl: '' },
        { name: 'Makanan Basah', id: 'makanan-basah', imageUrl: '' },
        { name: 'Aksesoris', id: 'aksesoris', imageUrl: '' },
        { name: 'Obat-obatan', id: 'obat-obatan', imageUrl: '' }
    ];
    const categories = JSON.parse(localStorage.getItem('productCategories')) || defaultCategories;
    const container = document.getElementById('category-links');
    if (!container) return;

    container.innerHTML = '';
    categories.forEach(cat => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = `produk.html?kategori=${encodeURIComponent(cat.name)}`;
        if (cat.imageUrl) {
            card.style.backgroundImage = `url('${cat.imageUrl}')`;
        }
        card.innerHTML = `<span>${cat.name}</span>`;
        container.appendChild(card);
    });
}

// Memuat produk populer untuk carousel
function loadPopularProducts() {
    const products = JSON.parse(localStorage.getItem('popularProducts') || '[]');
    const track = document.querySelector('.popular-products .carousel-track');
    if (!track) return;

    track.innerHTML = '';
    if (products.length > 0) {
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}"><p>${product.name}</p>`;
            track.appendChild(card);
        });
    } else {
        track.innerHTML = '<p style="color:#555; width:100%; text-align:center;">Belum ada produk populer.</p>';
    }
}

// Fungsi BARU untuk membuat carousel berdasarkan kategori
function createCategoryCarousel(categoryName, containerSelector) {
    const allProducts = JSON.parse(localStorage.getItem('mainProducts') || '[]');
    const track = document.querySelector(containerSelector);
    if (!track) return;

    const categoryProducts = allProducts.filter(p => p.category === categoryName);
    const shuffledProducts = categoryProducts.sort(() => 0.5 - Math.random()).slice(0, 6);

    track.innerHTML = '';
    if (shuffledProducts.length > 0) {
        shuffledProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}"><p>${product.name}</p>`;
            track.appendChild(card);
        });
    } else {
        track.innerHTML = `<p style="color:#555; width:100%; text-align:center;">Tidak ada produk di kategori ini.</p>`;
    }
}

// Fungsi untuk halaman produk (dengan filter dan pencarian)
function loadProductPage() {
    let allProducts = JSON.parse(localStorage.getItem('mainProducts') || '[]');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productGrid = document.querySelector('.product-grid-container');
    const pageTitle = document.querySelector('.product-page .section-title');

    if (!productGrid || filterButtons.length === 0) return;

    const categoryOrder = ['Makanan Kering', 'Makanan Basah', 'Aksesoris', 'Obat-obatan'];
    allProducts.sort((a, b) => {
        const categoryIndexA = categoryOrder.indexOf(a.category);
        const categoryIndexB = categoryOrder.indexOf(b.category);
        if (categoryIndexA !== categoryIndexB) return categoryIndexA - categoryIndexB;
        return a.name.localeCompare(b.name);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    const categoryFromURL = urlParams.get('kategori');
    let productsToDisplay = allProducts;

    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        productsToDisplay = allProducts.filter(p => p.name.toLowerCase().includes(lowerCaseQuery));
        if (pageTitle) pageTitle.innerText = `Hasil Pencarian untuk: "${searchQuery}"`;
    }

    const displayProducts = (category) => {
        let filteredProducts = (category === 'all') 
            ? productsToDisplay 
            : productsToDisplay.filter(p => p.category === category);
        
        productGrid.innerHTML = '';
        if (filteredProducts.length > 0) {
            filteredProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <p>${product.name}</p>
                    <span class="category-label">Kategori: ${product.category}</span>
                `;
                productGrid.appendChild(card);
            });
        } else {
            productGrid.innerHTML = `<p style="color:#555; width:100%; text-align:center; grid-column: 1 / -1;">Produk tidak ditemukan.</p>`;
        }
    };

    let currentCategory = 'all';
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            if (button.classList.contains('active') && category !== 'all') {
                currentCategory = 'all';
            } else {
                currentCategory = category;
            }
            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.filter-btn[data-category="${currentCategory}"]`).classList.add('active');
            displayProducts(currentCategory);
        });
    });

    if (categoryFromURL && !searchQuery) {
        const targetButton = document.querySelector(`.filter-btn[data-category="${categoryFromURL}"]`);
        if (targetButton) targetButton.click();
    } else {
        displayProducts('all');
    }
}

// Fungsi untuk halaman galeri
function loadGalleryPage() {
    const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    const container = document.querySelector('.gallery-container');
    if (!container) return;

    container.innerHTML = '';
    if (images.length > 0) {
        images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${image.imageUrl}" alt="Foto Galeri">`;
            container.appendChild(item);
        });
    } else {
        container.innerHTML = '<p style="color:#555; width:100%; text-align:center;">Belum ada foto di galeri.</p>';
    }
}

// Fungsi untuk halaman kontak
function loadContactPage() {
    const contactData = JSON.parse(localStorage.getItem('contactPageData') || '{}');
    if (Object.keys(contactData).length > 0) {
        const addressSpan = document.querySelector('#contact-address span');
        const emailSpan = document.querySelector('#contact-email span');
        const phoneSpan = document.querySelector('#contact-phone span');
        const mapFrame = document.getElementById('google-map-iframe');

        if(addressSpan) addressSpan.innerText = contactData.address || 'Alamat belum diatur.';
        if(emailSpan) emailSpan.innerText = contactData.email || 'Email belum diatur.';
        if(phoneSpan) phoneSpan.innerText = contactData.phone || 'Telepon belum diatur.';
        if (mapFrame && contactData.mapUrl) mapFrame.src = contactData.mapUrl;
    }
}

// Fungsi untuk form kontak
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Terima kasih atas pesan Anda! \n(Catatan: Fungsionalitas pengiriman email memerlukan back-end/server.)');
        contactForm.reset();
    });
}

// Fungsi untuk carousel (diperbarui agar bisa digunakan berulang)
function initCarousel(carouselContainer) {
    const track = carouselContainer.querySelector('.carousel-track');
    if (!track) return;

    let originalCards = Array.from(track.children);
    const nextButton = carouselContainer.querySelector('.carousel-button.next');
    const prevButton = carouselContainer.querySelector('.carousel-button.prev');
    
    if (originalCards.length < 3 || !originalCards[0].querySelector('img')) {
        if (nextButton) nextButton.style.display = 'none';
        if (prevButton) prevButton.style.display = 'none';
        return;
    }

    const cloneCount = Math.min(originalCards.length, 2);
    for (let i = 0; i < cloneCount; i++) {
        track.prepend(originalCards[originalCards.length - 1 - i].cloneNode(true));
    }
    for (let i = 0; i < cloneCount; i++) {
        track.appendChild(originalCards[i].cloneNode(true));
    }

    let allCards = Array.from(track.children);
    let currentIndex = cloneCount;
    let isTransitioning = false;

    const setPosition = (animate = true) => {
        if(allCards.length === 0) return;
        const cardWidth = allCards[0].offsetWidth;
        const containerWidth = carouselContainer.offsetWidth;
        const cardPosition = allCards[currentIndex].offsetLeft + (cardWidth / 2);
        const moveAmount = cardPosition - (containerWidth / 2);
        track.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
        track.style.transform = `translateX(-${moveAmount}px)`;
        allCards.forEach((card, index) => {
            const realIndex = (currentIndex - cloneCount + originalCards.length) % originalCards.length;
            const originalCardIndex = (index - cloneCount + originalCards.length) % originalCards.length;
            card.classList.toggle('active', realIndex === originalCardIndex);
        });
    };

    nextButton.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        setPosition();
    });
    prevButton.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        setPosition();
    });
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (currentIndex >= originalCards.length + cloneCount) {
            currentIndex = cloneCount;
            setPosition(false);
        }
        if (currentIndex < cloneCount) {
            currentIndex = originalCards.length + cloneCount - 1;
            setPosition(false);
        }
    });

    const firstImage = track.querySelector('img');
    if (firstImage) {
        firstImage.onload = () => setPosition(false);
    } else {
        setTimeout(() => setPosition(false), 100); 
    }
    window.addEventListener('resize', () => setPosition(false));
}