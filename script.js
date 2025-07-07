// script.js (Versi Final dengan Caching sessionStorage)

// --- FUNGSI UTAMA & INISIALISASI ---

document.addEventListener('DOMContentLoaded', () => {
    // Fungsi loadAndRenderPage sekarang akan menangani caching.
    loadAndRenderPage(); 
    
    // Fungsi lainnya tetap sama.
    initMenuToggle();
    initLightbox();
    initSearch();
    initAutoYear();
});


// --- FUNGSI-FUNGSI API ---

// ==================================================================
// ### PERBAIKAN FUNGSI INTI DENGAN LOGIKA CACHING ###
// ==================================================================
async function loadAndRenderPage() {
    const cacheKey = 'websiteDataCache';
    let websiteData;

    // 1. Cek apakah ada data di cache sessionStorage
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        // 2. Jika ada, langsung gunakan data dari cache (tanpa loading)
        console.log("Memuat data dari cache...");
        websiteData = JSON.parse(cachedData);
    } else {
        // 3. Jika tidak ada, fetch data baru dari server
        console.log("Cache kosong, memuat data baru dari server...");
        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error('Data tidak dapat dimuat dari server.');
            websiteData = await response.json();

            // 4. Simpan data baru ke dalam cache untuk digunakan nanti
            sessionStorage.setItem(cacheKey, JSON.stringify(websiteData));

        } catch (error) {
            console.error(error);
            websiteData = {}; 
        }
    }

    // Bagian render tetap sama, menggunakan data yang sudah didapat (baik dari cache atau fetch)
    if (document.querySelector('.hero')) {
        loadHomePage(websiteData);
        document.querySelectorAll('.carousel-container').forEach(initCarousel);
    }
    if (document.querySelector('.gallery-page')) {
        loadGalleryPage(websiteData.galleryImages || []);
    }
    if (document.querySelector('.product-page')) {
        // Sembunyikan skeleton sebelum render
        const skeletonContainer = document.querySelector('.product-grid-container');
        if (skeletonContainer) skeletonContainer.innerHTML = '';
        loadProductPage(websiteData.mainProducts || []);
    }
    if (document.querySelector('.contact-page')) {
        loadContactPage(websiteData.contactPageData || {});
        initApiContactForm();
    }
}
// ==================================================================
// ### AKHIR PERBAIKAN ###
// ==================================================================


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


// --- FUNGSI UNIVERSAL ---

function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
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
        const clickedImage = e.target.closest('.product-card img, .gallery-item img, .hero-image img');
        
        if (clickedImage) {
            if (clickedImage.closest('.preview-card')) {
                return;
            }
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

// --- FUNGSI RENDER KONTEN HALAMAN ---

function loadHomePage(data) {
    const heroData = data.heroData || {};
    const popularProducts = data.popularProducts || [];
    const categories = data.productCategories || [];
    const mainProducts = data.mainProducts || [];
    
    // Sembunyikan skeleton sebelum render
    document.getElementById('category-links')?.querySelectorAll('.product-card-skeleton').forEach(el => el.remove());
    document.querySelectorAll('.carousel-track')?.forEach(track => {
        track.querySelectorAll('.product-card-skeleton').forEach(el => el.remove());
    });
    
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

    const categoryContainer = document.getElementById('category-links');
    if (categoryContainer) {
        categoryContainer.innerHTML = ''; // Pastikan bersih sebelum mengisi
        (categories || []).forEach(cat => {
            const card = document.createElement('a');
            card.className = 'category-card';
            card.href = `produk.html?kategori=${encodeURIComponent(cat.name)}`;
            if (cat.imageUrl) card.style.backgroundImage = `url('${cat.imageUrl}')`;
            card.innerHTML = `<span>${cat.name}</span>`;
            categoryContainer.appendChild(card);
        });
    }

    const popularTrack = document.querySelector('.popular-products .carousel-track');
    if (popularTrack) {
        popularTrack.innerHTML = ''; // Pastikan bersih sebelum mengisi
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

    createCategoryCarousel('Makanan Kering', '#makanan-kering-track', mainProducts);
    createCategoryCarousel('Makanan Basah', '#makanan-basah-track', mainProducts);
    createCategoryCarousel('Aksesoris', '#aksesoris-track', mainProducts);
    createCategoryCarousel('Obat-obatan', '#obat-obatan-track', mainProducts);
}

function createCategoryCarousel(categoryName, containerSelector, allProducts) {
    const track = document.querySelector(containerSelector);
    if (!track) return;
    track.innerHTML = ''; // Pastikan bersih sebelum mengisi
    const categoryProducts = (allProducts || []).filter(p => p.category === categoryName);
    const shuffledProducts = categoryProducts.sort(() => 0.5 - Math.random()).slice(0, 6);
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
    container.innerHTML = ''; // Pastikan bersih sebelum mengisi
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
    if (!productGrid) return;
    productGrid.innerHTML = ''; // Pastikan bersih sebelum mengisi

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
        let filtered = (category === 'all' || !category) ? productsToDisplay : productsToDisplay.filter(p => p.category === category);
        productGrid.innerHTML = ''; // Pastikan bersih sebelum mengisi
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
    
    if (filterButtons.length > 0) {
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
             const allButton = document.querySelector('.filter-btn[data-category="all"]');
             if(allButton) allButton.classList.add('active');
            displayProducts('all');
        }
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

        // Ganti skeleton dengan data asli
        if(addressSpan) addressSpan.innerHTML = contactData.address || 'Alamat belum diatur.';
        if(emailSpan) emailSpan.innerHTML = contactData.email || 'Email belum diatur.';
        if(phoneSpan) phoneSpan.innerHTML = contactData.phone || 'Telepon belum diatur.';
        if (mapFrame && contactData.mapUrl) mapFrame.src = contactData.mapUrl;
    }
}

function initCarousel(carouselContainer) {
    const track = carouselContainer.querySelector('.carousel-track');
    if (!track) return;
    track.innerHTML = ''; // Pastikan bersih

    let originalCardsData = [];
    const showcaseType = carouselContainer.querySelector('.carousel-track').id;
    
    // Ini harusnya mengambil data dari 'websiteData' yang sudah di-cache
    // Asumsi websiteData sudah menjadi variabel global atau bisa diakses
    if (showcaseType === 'popular-products-track') { // Anda perlu memberi ID pada track produk populer
         originalCardsData = window.websiteData.popularProducts || [];
    } else {
        const categoryName = showcaseType.replace('-track', '').replace(/-/g, ' ');
        originalCardsData = (window.websiteData.mainProducts || []).filter(p => p.category.toLowerCase() === categoryName);
    }
    
    if (originalCardsData.length < 1) return; // Keluar jika tidak ada data

     const originalCards = originalCardsData.map(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}"><p>${product.name}</p>`;
        return card;
    });

    const nextButton = carouselContainer.querySelector('.carousel-button.next');
    const prevButton = carouselContainer.querySelector('.carousel-button.prev');
    
    if (originalCards.length < 3) { // Tampilkan tombol hanya jika item lebih dari 2
        if (nextButton) nextButton.style.display = 'none';
        if (prevButton) prevButton.style.display = 'none';
    } else {
        if (nextButton) nextButton.style.display = 'flex';
        if (prevButton) prevButton.style.display = 'flex';
    }
    
    originalCards.forEach(card => track.appendChild(card));

    const cloneCount = Math.min(originalCards.length, 5);
    for (let i = 0; i < cloneCount; i++) {
        track.appendChild(originalCards[i].cloneNode(true));
    }
    for (let i = originalCards.length - 1; i >= Math.max(0, originalCards.length - cloneCount); i--) {
        track.prepend(originalCards[i].cloneNode(true));
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
            currentIndex = originalCards.length + cloneCount - 1;
            setPosition(false);
        }
    });

    setTimeout(() => setPosition(false), 150); 
    window.addEventListener('resize', () => setPosition(false));
}