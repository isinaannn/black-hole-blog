document.addEventListener('DOMContentLoaded', () => {
    // 1. Image Tracking
    const canvas = document.getElementById('hero-canvas');
    const context = canvas.getContext('2d');
    const wrapper = document.querySelector('.hero-sticky-wrapper');
    const heroContent = document.querySelector('.hero-content');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroBtn = document.querySelector('.btn-primary');

    const frameCount = 147;
    const currentFrame = (index) => `images/ezgif-frame-${Math.min(frameCount, Math.max(1, index)).toString().padStart(3, '0')}.webp`;

    const images = [];
    let state = {
        currentFrame: 1,
        targetFrame: 1,
        progress: 0,
        currentProgress: 0
    };

    // Preload all images
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    images[0].onload = () => {
        resizeCanvas();
        render();
    };

    // 2. Simple & Flexible Scroll Logic
    function updateScrollProgress() {
        const rect = wrapper.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
        state.progress = progress;
        state.targetFrame = 1 + Math.floor(progress * (frameCount - 1));
    }

    // Smooth Lerp loop for the animation frames AND text
    function animate() {
        // Smooth frame transitions
        const delta = state.targetFrame - state.currentFrame;
        state.currentFrame += delta * 0.15;

        // Smooth progress tracking for text elements
        const progressDelta = state.progress - state.currentProgress;
        state.currentProgress += progressDelta * 0.1;

        // --- Text Animations ---
        // We fade the text quickly in the first 25% of the scroll
        const textFadeProgress = Math.min(1, state.currentProgress / 0.3); 
        const opacity = 1 - textFadeProgress;
        const translateY = -textFadeProgress * 150; // Move up 150px
        
        if (heroContent) {
            heroContent.style.opacity = opacity;
            heroContent.style.transform = `translateY(${translateY}px)`;
            // Add a subtle scale effect to the title
            if (heroTitle) heroTitle.style.transform = `scale(${1 + textFadeProgress * 0.1})`;
        }

        // If very close to target, render frame
        if (Math.abs(delta) > 0.01) {
            render();
        }
        requestAnimationFrame(animate);
    }

    function render() {
        const index = Math.round(state.currentFrame) - 1;
        const img = images[index];
        if (img && img.complete) {
            scaleImage(img, context);
        }
    }

    function scaleImage(img, ctx) {
        const { width, height } = ctx.canvas;
        const hRatio = width / img.width;
        const vRatio = height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const offsetX = (width - img.width * ratio) / 2;
        const offsetY = (height - img.height * ratio) / 2;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, img.width * ratio, img.height * ratio);
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render();
    }

    // Event Listeners
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', resizeCanvas);
    
    // Initial calls
    updateScrollProgress();
    animate();

    // 3. Section Reveal and Native Smooth Scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Simple smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
