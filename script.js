// script.js (Versi Final dengan Koneksi API untuk Data & Formulir Kontak)

// --- FUNGSI UTAMA & INISIALISASI ---

// Fungsi ini akan berjalan setelah semua elemen HTML selesai dimuat.
document.addEventListener('DOMContentLoaded', () => {
    // Menjalankan fungsi spesifik untuk memuat dan merender konten halaman
    loadAndRenderPage();
    
    // Inisialisasi fungsi universal yang ada di setiap halaman
    initMenuToggle();
    initLightbox();
    initSearch();
    initAutoYear();
});


// --- FUNGSI-FUNGSI BARU UNTUK MENGAMBIL DATA & MENGIRIM PESAN ---

async function loadAndRenderPage() {
    let websiteData;
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Data tidak dapat dimuat dari server.');
        websiteData = await response.json();
    } catch (error) {
        console.error(error);
        websiteData = {}; // Fallback ke data kosong jika terjadi error
    }

    // Tentukan halaman mana yang sedang aktif dan panggil fungsi render yang sesuai
    if (document.querySelector('.hero')) {
        loadHomePage(websiteData);
        // Inisialisasi SEMUA carousel setelah render
        document.querySelectorAll('.carousel-container').forEach(initCarousel);
    }
    if (document.querySelector('.gallery-page')) {
        loadGalleryPage(websiteData.galleryImages || []);
    }
    if (document.querySelector('.product-page')) {
        loadProductPage(websiteData.mainProducts || []);
    }
    if (document.querySelector('.contact-page')) {
        loadContactPage(websiteData.contactPageData || {});
        // Inisialisasi formulir kontak baru dengan logika API
        initApiContactForm();
    }
}

function initApiContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal mengirim pesan.');
            
            alert('Pesan Anda berhasil terkirim!');
            contactForm.reset();
        } catch (error) {
            alert(`Terjadi kesalahan: ${error.message}`);
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}


// --- FUNGSI LAMA ANDA (UNIVERSAL & RENDER) ---

function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
}

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

function initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    if (!searchForm || !searchInput) return;
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `produk.html?q=${encodeURIComponent(query)}`;
        }
    });
}

function initAutoYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

function loadHomePage(data) {
    const heroData = data.heroData || {};
    const popularProducts = data.popularProducts || [];
    const categories = data.productCategories || [];
    const mainProducts = data.mainProducts || [];
    
    // Hero Section
    const heroSection = document.getElementById('hero-section');
    const heroSideImageContainer = document.querySelector('.hero-image');
    if (heroSection) {
        document.getElementById('hero-welcome-text').innerText = heroData.welcomeText || 'Selamat datang di';
        document.getElementById('hero-main-headline').innerText = heroData.headline || 'Setia Cat Food';
        document.getElementById('hero-main-tagline').innerText = heroData.tagline || 'Menyediakan semua kebutuhan kucing Anda';
        if (heroData.imageUrl) heroSection.style.backgroundImage = `url('${heroData.imageUrl}')`;
        if (heroSideImageContainer) {
             if (heroData.sideImageUrl) {
                heroSideImageContainer.style.display = 'block';
                heroSideImageContainer.querySelector('img').src = heroData.sideImageUrl;
            } else {
                heroSideImageContainer.style.display = 'none';
            }
        }
    }
    const contactInfo = data.contactPageData || {};
    const addressLink = document.querySelector('.hero-contact-info .address-link');
    const emailText = document.querySelector('.hero-contact-info .email-text');
    if(addressLink) addressLink.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${contactInfo.address || 'Alamat belum diatur'}`;
    if(emailText) emailText.innerHTML = `<i class="fas fa-envelope"></i> ${contactInfo.email || 'Email belum diatur'}`;

    // Categories
    const categoryContainer = document.getElementById('category-links');
    if (categoryContainer) {
        categoryContainer.innerHTML = '';
        categories.forEach(cat => {
            const card = document.createElement('a');
            card.className = 'category-card';
            card.href = `produk.html?kategori=${encodeURIComponent(cat.name)}`;
            if (cat.imageUrl) card.style.backgroundImage = `url('${cat.imageUrl}')`;
            card.innerHTML = `<span>${cat.name}</span>`;
            categoryContainer.appendChild(card);
        });
    }

    // Popular Products
    const popularTrack = document.querySelector('.popular-products .carousel-track');
    if (popularTrack) {
        popularTrack.innerHTML = '';
        if (popularProducts.length > 0) {
            popularProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}"><p>${product.name}</p>`;
                popularTrack.appendChild(card);
            });
        } else {
            popularTrack.innerHTML = '<p style="color:#555; width:100%; text-align:center;">Belum ada produk populer.</p>';
        }
    }

    // Category Showcases
    createCategoryCarousel('Makanan Kering', '#makanan-kering-track', mainProducts);
    createCategoryCarousel('Makanan Basah', '#makanan-basah-track', mainProducts);
    createCategoryCarousel('Aksesoris', '#aksesoris-track', mainProducts);
    createCategoryCarousel('Obat-obatan', '#obat-obatan-track', mainProducts);
}

function createCategoryCarousel(categoryName, containerSelector, allProducts) {
    const track = document.querySelector(containerSelector);
    if (!track) return;
    const categoryProducts = (allProducts || []).filter(p => p.category === categoryName);
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

function loadGalleryPage(images) {
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

function loadProductPage(allProducts) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productGrid = document.querySelector('.product-grid-container');
    const pageTitle = document.querySelector('.product-page .section-title');
    if (!productGrid || filterButtons.length === 0) return;

    const categoryOrder = ['Makanan Kering', 'Makanan Basah', 'Aksesoris', 'Obat-obatan'];
    (allProducts || []).sort((a, b) => {
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.name.localeCompare(b.name);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    const categoryFromURL = urlParams.get('kategori');
    let productsToDisplay = allProducts || [];

    if (searchQuery) {
        productsToDisplay = productsToDisplay.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (pageTitle) pageTitle.innerText = `Hasil Pencarian untuk: "${searchQuery}"`;
    }

    const displayProducts = (category) => {
        let filtered = (category === 'all') ? productsToDisplay : productsToDisplay.filter(p => p.category === category);
        productGrid.innerHTML = '';
        if (filtered.length > 0) {
            filtered.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}"><p>${product.name}</p><span class="category-label">Kategori: ${product.category}</span>`;
                productGrid.appendChild(card);
            });
        } else {
            productGrid.innerHTML = `<p style="color:#555; width:100%; text-align:center; grid-column: 1 / -1;">Produk tidak ditemukan.</p>`;
        }
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayProducts(category);
        });
    });

    if (categoryFromURL && !searchQuery) {
        const targetButton = document.querySelector(`.filter-btn[data-category="${categoryFromURL}"]`);
        if (targetButton) targetButton.click();
    } else {
        displayProducts('all');
    }
}

function loadContactPage(contactData) {
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
    
    track.innerHTML = '';
    originalCards.forEach(card => track.appendChild(card));

    const cloneCount = Math.min(originalCards.length, 5);
    for (let i = 0; i < cloneCount; i++) {
        track.appendChild(originalCards[i].cloneNode(true));
    }
    for (let i = 0; i < cloneCount; i++) {
        track.prepend(originalCards[originalCards.length - 1 - i].cloneNode(true));
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
            card.classList.toggle('active', index === currentIndex);
        });
    };

    nextButton.onclick = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        setPosition();
    };
    prevButton.onclick = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        setPosition();
    };
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (currentIndex >= originalCards.length + cloneCount) {
            currentIndex = cloneCount;
            setPosition(false);
        }
        if (currentIndex < cloneCount) {
            currentIndex = originalCards.length;
            setPosition(false);
        }
    });

    setTimeout(() => setPosition(false), 100); 
    window.addEventListener('resize', () => setPosition(false));
}