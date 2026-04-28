const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-link');
const revealElements = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('.hero-stat-number');

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

window.addEventListener('scroll', () => {
    if (window.scrollY > 24) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    updateActiveNav();
});

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('open');
    });
});

function updateActiveNav() {
    const scrollPos = window.scrollY + header.offsetHeight + 80;

    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < bottom) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.section === id);
            });
        }
    });
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(element => revealObserver.observe(element));

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.count || 0);
        const duration = 1600;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(target * eased).toLocaleString('vi-VN');

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counter.textContent = target.toLocaleString('vi-VN');
            }
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(counter);
    });
}, { threshold: 0.45 });

counters.forEach(counter => counterObserver.observe(counter));

document.querySelectorAll('.lite-youtube').forEach(container => {
    container.addEventListener('click', function () {
        const videoId = this.dataset.videoId;
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.style.position = 'absolute';
        iframe.style.inset = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';

        this.innerHTML = '';
        this.appendChild(iframe);
        this.style.aspectRatio = '16 / 9';
    }, { once: true });
});

document.querySelectorAll('.variant-options').forEach(group => {
    const buttons = group.querySelectorAll('.variant-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');
        });
    });
});

function initFAQAccordion() {
    const accordion = document.getElementById('faq-accordion');
    if (!accordion) return;

    const items = Array.from(accordion.querySelectorAll('.faq-item'));
    items.forEach((item, index) => {
        const button = item.querySelector('.faq-question');
        if (!button) return;

        const isOpen = index === 0;
        item.classList.toggle('is-open', isOpen);
        button.setAttribute('aria-expanded', String(isOpen));

        button.addEventListener('click', () => {
            const shouldOpen = !item.classList.contains('is-open');
            items.forEach(otherItem => {
                const otherButton = otherItem.querySelector('.faq-question');
                otherItem.classList.remove('is-open');
                otherButton?.setAttribute('aria-expanded', 'false');
            });

            if (shouldOpen) {
                item.classList.add('is-open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

function initMerchCarousel() {
    const track = document.getElementById('merch-grid');
    const carousel = track?.closest('.merch-carousel');
    if (!track || !carousel) return;

    const prevButton = carousel.querySelector('.merch-arrow-prev');
    const nextButton = carousel.querySelector('.merch-arrow-next');
    let slides = Array.from(track.querySelectorAll('.merch-card:not([data-clone])'));
    if (!slides.length) return;

    track.querySelectorAll('[data-clone="true"]').forEach(clone => clone.remove());
    slides = Array.from(track.querySelectorAll('.merch-card:not([data-clone])'));

    if (slides.length === 1) {
        track.style.transform = 'translateX(0)';
        prevButton?.setAttribute('hidden', '');
        nextButton?.setAttribute('hidden', '');
        return;
    }

    prevButton?.removeAttribute('hidden');
    nextButton?.removeAttribute('hidden');

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.dataset.clone = 'true';
    lastClone.dataset.clone = 'true';
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    let index = 1;
    let isAnimating = false;

    const setPosition = (withTransition = true) => {
        track.classList.toggle('no-transition', !withTransition);
        track.style.transform = `translateX(-${index * 100}%)`;

        if (!withTransition) {
            track.offsetHeight;
            track.classList.remove('no-transition');
        }
    };

    const move = (direction) => {
        if (isAnimating) return;
        isAnimating = true;
        index += direction;
        setPosition(true);
    };

    track.ontransitionend = () => {
        const realCount = slides.length;
        if (index === realCount + 1) {
            index = 1;
            setPosition(false);
        } else if (index === 0) {
            index = realCount;
            setPosition(false);
        }
        isAnimating = false;
    };

    if (prevButton) prevButton.onclick = () => move(-1);
    if (nextButton) nextButton.onclick = () => move(1);
    setPosition(false);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        const offset = target.offsetTop - header.offsetHeight - 16;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    });
});

// Initial merch buttons are handled by delegation after dynamic load


// Modal Elements
const paymentModal = document.getElementById('payment-modal');
const paymentModalTitle = document.getElementById('payment-modal-title');
const closePaymentModalBtn = document.getElementById('close-payment-modal');
const paymentQrImage = document.getElementById('payment-qr-image');
const paymentCourseTitle = document.getElementById('payment-course-title');
const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

function openPaymentModal(itemTitle, qrUrl, modalHeader = 'Thanh toán') {
    if (!qrUrl) {
        alert('Thông tin thanh toán sẽ sớm được cập nhật.');
        return;
    }

    if (paymentModalTitle) paymentModalTitle.textContent = modalHeader;
    paymentCourseTitle.textContent = itemTitle;
    paymentQrImage.src = qrUrl;
    paymentQrImage.classList.remove('loaded');

    paymentQrImage.onload = () => {
        paymentQrImage.classList.add('loaded');
    };

    paymentModal.classList.add('active');
    paymentModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    paymentModal.classList.remove('active');
    paymentModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    paymentQrImage.src = '';
}

closePaymentModalBtn?.addEventListener('click', closePaymentModal);
paymentModal?.querySelector('.qr-modal-overlay')?.addEventListener('click', closePaymentModal);
confirmPaymentBtn?.addEventListener('click', () => {
    alert('Cảm ơn bạn đã thanh toán! Vui lòng gửi ảnh chụp màn hình về cho chúng tôi.');
    closePaymentModal();
});

// Delegate course and merch link clicks
document.addEventListener('click', (e) => {
    const courseLink = e.target.closest('.course-link');
    const merchBtn = e.target.closest('.merch-btn');

    if (courseLink) {
        e.preventDefault();
        const title = courseLink.dataset.title;
        const qrUrl = courseLink.dataset.qr;
        if (!title && !qrUrl) {
            const href = courseLink.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                const target = document.querySelector(href);
                if (!target) return;
                const offset = target.offsetTop - header.offsetHeight - 16;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            } else if (href && href !== '#') {
                window.location.href = href;
            }
            return;
        }
        openPaymentModal(title, qrUrl, 'Đăng ký khóa học');
    } else if (merchBtn) {
        const title = merchBtn.dataset.name;
        const qrUrl = merchBtn.dataset.qr;
        openPaymentModal(title, qrUrl, 'Mua sản phẩm');
    }
});


updateActiveNav();

// --- Dynamic Content from Supabase ---

async function fetchDynamicContent() {
    try {
        // Fetch Videos
        const { data: videos } = await supabaseClient.from('videos').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        renderVideos(videos || []);

        // Fetch Courses
        const { data: courses } = await supabaseClient.from('courses').select('*').order('created_at', { ascending: false });
        renderCourses(courses || []);

        // Fetch Merch
        const { data: merch } = await supabaseClient.from('merch').select('*').order('created_at', { ascending: false });
        renderMerch(merch || []);

    } catch (err) {
        console.error('Error fetching dynamic content:', err);
    }
}

function renderVideos(videos) {
    const container = document.getElementById('video-grid');
    if (!container) return;

    if (!videos || videos.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; padding: 48px; text-align: center; color: var(--dark-text-muted); font-family: var(--font-mono); font-size: 14px; border: 1px dashed var(--dark-border); border-radius: var(--radius-lg);">
                <p>RESOURCES_COMING_SOON...</p>
            </div>
        `;
        return;
    }

    container.innerHTML = videos.map((video, index) => `
        <article class="video-card ${video.is_featured ? 'featured' : ''} reveal visible">
            <div class="video-embed lite-youtube" data-video-id="${video.video_id}">
                <div class="video-thumb" style="background-image: url('${video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}')">
                    <div class="video-overlay"></div>
                    <div class="video-play ${video.is_featured ? '' : 'small-play'}">
                        <svg width="${video.is_featured ? '24' : '20'}" height="${video.is_featured ? '24' : '20'}" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <span class="video-duration">${video.duration || '00:00'}</span>
                </div>
            </div>
            <div class="video-info">
                ${video.is_featured ? '<div class="eyebrow eyebrow-dark">VIDEO NỔI BẬT</div>' : ''}
                <h3 class="video-title">${escapeHTML(video.title)}</h3>
                ${video.is_featured ? `<p class="video-desc">${escapeHTML(video.description || '')}</p>` : ''}

            </div>
        </article>
    `).join('');

    // Re-initialize YouTube embeds for dynamic content
    initYoutubeEmbeds();

    // Inject Video Schema
    const videoSchema = {
        "@context": "https://schema.org",
        "@graph": videos.map(video => ({
            "@type": "VideoObject",
            "name": video.title,
            "description": video.description || video.title,
            "thumbnailUrl": video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`,
            "contentUrl": `https://www.youtube.com/watch?v=${video.video_id}`,
            "embedUrl": `https://www.youtube.com/embed/${video.video_id}`,
            "uploadDate": video.created_at || new Date().toISOString()
        }))
    };
    injectSchema('video-schema', videoSchema);
}

function renderCourses(courses) {
    const container = document.getElementById('courses-grid');
    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; padding: 48px; text-align: center; color: var(--light-text-muted); font-family: var(--font-mono); font-size: 14px; border: 1px dashed var(--light-border); border-radius: var(--radius-lg);">
                <p>COURSES_INITIALIZING...</p>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <article class="course-card reveal visible">
            <div class="course-image ${escapeHTML(course.image_class || 'pastel-1')}">
                ${course.is_hot ? '<div class="course-badge badge-hot">Hot</div>' : '<div class="course-badge">Online</div>'}
            </div>
            <div class="course-content">
                <div class="course-meta">
                    <span>${escapeHTML(course.category || '')}</span>
                    <span>${escapeHTML(course.duration || '')}</span>
                </div>
                <h3 class="course-title">${escapeHTML(course.title)}</h3>
                <p class="course-desc">${escapeHTML(course.description || '')}</p>
                <div class="course-footer">
                    <span class="course-price">${escapeHTML(course.price || 'Theo đợt mở lớp')}</span>
                    <a href="${escapeHTML(course.registration_link || '#')}" 
                       class="course-link" 
                       data-title="${escapeHTML(course.title)}" 
                       data-qr="${escapeHTML(course.payment_qr_url || '')}">Đăng ký ngay</a>
                </div>
            </div>
        </article>
    `).join('');


    // Inject Course Schema
    const courseSchema = {
        "@context": "https://schema.org",
        "@graph": courses.map(course => ({
            "@type": "Course",
            "name": course.title,
            "description": course.description || course.title,
            "provider": {
                "@type": "Organization",
                "name": "UIT Knowledge",
                "sameAs": "https://www.uitknowledge.org/"
            }
        }))
    };
    injectSchema('course-schema', courseSchema);
}

function injectSchema(id, schemaObj) {
    let script = document.getElementById(id);
    if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaObj);
}

function renderMerch(merchList) {
    const container = document.getElementById('merch-grid');
    if (!container) return;

    if (!merchList || merchList.length === 0) {
        container.innerHTML = `
            <article class="merch-card" style="padding: 48px; text-align: center; color: var(--dark-text-muted); font-family: var(--font-mono); font-size: 14px; min-width: 100%;">
                <p>MERCH_COLLECTION_PENDING...</p>
            </article>
        `;
        return;
    }

    container.innerHTML = merchList.map(merch => `
        <article class="merch-card reveal visible">
            <div class="merch-image">
                ${merch.image_url ?
            `<img src="${escapeHTML(merch.image_url)}" alt="${escapeHTML(merch.name)}" style="width: 100%; height: 100%; object-fit: cover;">` :
            `<div class="merch-placeholder ${escapeHTML(merch.placeholder_class || 'merch-shirt')}"><span>${escapeHTML(merch.name)}</span></div>`
        }
            </div>
            <div class="merch-info">
                <h3 class="merch-name">${escapeHTML(merch.name)}</h3>
                <p class="merch-desc">${escapeHTML(merch.description || '')}</p>
                <div class="merch-footer">
                    <span class="merch-price">${escapeHTML(merch.price || '')}</span>
                    <button class="btn btn-primary btn-small merch-btn" 
                            data-name="${escapeHTML(merch.name)}" 
                            data-qr="${escapeHTML(merch.payment_qr_url || '')}">Mua ngay</button>
                </div>
            </div>
        </article>
    `).join('');

    initMerchCarousel();
}

function initYoutubeEmbeds() {
    document.querySelectorAll('.lite-youtube').forEach(container => {
        container.addEventListener('click', function () {
            const videoId = this.dataset.videoId;
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.style.position = 'absolute';
            iframe.style.inset = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';

            this.innerHTML = '';
            this.appendChild(iframe);
            this.style.aspectRatio = '16 / 9';
        }, { once: true });
    });
}

// Start fetching
fetchDynamicContent();
initFAQAccordion();
initMerchCarousel();

// Inject FAQ Schema
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "UIT Knowledge là gì?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "UIT Knowledge là cộng đồng học thuật chuyên tổng hợp video, khóa học và tài liệu dành riêng cho sinh viên UIT - VNU-HCM."
            }
        },
        {
            "@type": "Question",
            "name": "Nội dung ở đây có bám sát chương trình UIT không?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Có. Video và lộ trình khóa học được xây từ đề cương và nhu cầu ôn tập thực tế của sinh viên UIT."
            }
        },
        {
            "@type": "Question",
            "name": "Tôi nên bắt đầu từ đâu nếu bị mất gốc?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Hãy xem video ôn tập nền tảng trước để nắm lại ý chính, rồi chọn khóa học theo môn đang yếu nhất."
            }
        },
        {
            "@type": "Question",
            "name": "Khóa học tại UIT Knowledge diễn ra như thế nào?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Khóa học thường học online có hướng dẫn, qua video và bài tập thực hành, mở theo từng đợt để hỗ trợ tốt hơn."
            }
        }
    ]
};
injectSchema('faq-schema', faqSchema);

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
