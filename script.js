/* ========================================
   PORTFOLIO JS - Optimized Animations & Interactivity
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const disableHeavyEffects = isTouchDevice || prefersReducedMotion || lowPowerDevice;

    // ==========================================
    // 1. PARTICLE BACKGROUND
    // ==========================================
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let particleMouse = { x: null, y: null };
    let particleRAF = null;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.baseSize = Math.random() * 2 + 0.5;
            this.size = this.baseSize;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.15;
            this.hue = Math.random() > 0.6 ? 260 : Math.random() > 0.3 ? 175 : 340;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            if (!disableHeavyEffects && particleMouse.x !== null) {
                const dx = this.x - particleMouse.x;
                const dy = this.y - particleMouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < 60) {
                    this.x += (dx / dist) * 1.6;
                    this.y += (dy / dist) * 1.6;
                }
            }

            this.pulsePhase += this.pulseSpeed;
            this.size = this.baseSize + Math.sin(this.pulsePhase) * 0.4;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 70%, 65%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    function initParticles() {
        if (!canvas) return;
        particles = [];
        const isMobile = window.innerWidth <= 768;
        if (isMobile) return; // Completely disable particles on mobile

        const maxParticles = disableHeavyEffects ? 16 : 64;
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 9000), maxParticles);
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function connectParticles() {
        if (disableHeavyEffects) return;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.hypot(dx, dy);
                if (dist < 90) {
                    const opacity = 0.07 * (1 - dist / 90);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(108, 92, 231, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        if (!ctx || !canvas) return;
        if (document.hidden || window.innerWidth <= 768) {
            particleRAF = requestAnimationFrame(animateParticles);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        particleRAF = requestAnimationFrame(animateParticles);
    }

    if (canvas && ctx) {
        resizeCanvas();
        animateParticles();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        window.addEventListener('mousemove', e => {
            if (disableHeavyEffects || window.innerWidth <= 768) return;
            particleMouse.x = e.clientX;
            particleMouse.y = e.clientY;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            particleMouse.x = null;
            particleMouse.y = null;
        }, { passive: true });
    }

    // ==========================================
    // 2. CUSTOM CURSOR
    // ==========================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const cursorEnabled = !!(cursorDot && cursorOutline) && !disableHeavyEffects;

    if (cursorEnabled) {
        let cursorX = 0;
        let cursorY = 0;
        let outlineX = 0;
        let outlineY = 0;

        document.addEventListener('mousemove', e => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.left = cursorX + 'px';
            cursorDot.style.top = cursorY + 'px';
        }, { passive: true });

        const animateCursor = () => {
            outlineX += (cursorX - outlineX) * 0.15;
            outlineY += (cursorY - outlineY) * 0.15;
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        const hoverTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .education-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // ==========================================
    // 3. NAVBAR + SCROLL EFFECTS (single rAF)
    // ==========================================
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollProgressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const parallaxElements = document.querySelectorAll('.floating-badge, .image-ring');
    let scrollTicking = false;

    function updateOnScroll() {
        const scrollTop = window.scrollY;

        if (navbar) navbar.classList.toggle('scrolled', scrollTop > 50);

        let current = '';
        sections.forEach(section => {
            if (scrollTop >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgressBar) scrollProgressBar.style.width = scrollPercent + '%';
        if (backToTopBtn) backToTopBtn.classList.toggle('visible', scrollTop > 500);

        if (!disableHeavyEffects) {
            parallaxElements.forEach((el, i) => {
                const speed = (i + 1) * 0.03;
                el.style.transform = `translateY(${scrollTop * speed}px)`;
            });
        }

        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(updateOnScroll);
    }, { passive: true });
    updateOnScroll();

    // ==========================================
    // 4. HAMBURGER MENU
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (!hamburger || !mobileMenu) return;
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // ==========================================
    // 5. TYPEWRITER EFFECT
    // ==========================================
    const typewriterEl = document.getElementById('typewriter');
    if (typewriterEl) {
        const phrases = [
            'Full Stack Developer',
            'ML Engineer Enthusiast',
            'MERN Stack Developer',
            'AI Solution Builder',
            'Problem Solver'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeEffect = () => {
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? 40 : 80;
            if (!isDeleting && charIndex === currentPhrase.length) {
                speed = 1800;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                speed = 350;
            }
            setTimeout(typeEffect, speed);
        };
        typeEffect();
    }

    // ==========================================
    // 6. OBSERVERS: REVEAL / COUNTERS / BARS / SCORES
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('revealed'), index * 90);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    const animateCounter = (el, target) => {
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 40);
    };

    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = parseInt(entry.target.getAttribute('data-target'), 10);
            if (!Number.isNaN(target)) animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        });
    }, { threshold: 0.5 });
    statNumbers.forEach(num => counterObserver.observe(num));

    const skillFills = document.querySelectorAll('.skill-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const width = entry.target.getAttribute('data-width');
            entry.target.style.width = width + '%';
            skillObserver.unobserve(entry.target);
        });
    }, { threshold: 0.3 });
    skillFills.forEach(bar => skillObserver.observe(bar));

    const scoreCircles = document.querySelectorAll('.score-fill');
    const svgNS = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(svgNS, 'defs');
    const linearGrad = document.createElementNS(svgNS, 'linearGradient');
    linearGrad.setAttribute('id', 'scoreGradient');
    linearGrad.setAttribute('x1', '0%');
    linearGrad.setAttribute('y1', '0%');
    linearGrad.setAttribute('x2', '100%');
    linearGrad.setAttribute('y2', '0%');

    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#6c5ce7');
    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#00cec9');

    linearGrad.appendChild(stop1);
    linearGrad.appendChild(stop2);
    defs.appendChild(linearGrad);

    const firstSvg = document.querySelector('.score-circle svg');
    if (firstSvg) firstSvg.prepend(defs);

    const scoreObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const percent = parseInt(entry.target.getAttribute('data-percent'), 10);
            if (!Number.isNaN(percent)) {
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (percent / 100) * circumference;
                entry.target.style.strokeDashoffset = offset;
            }
            scoreObserver.unobserve(entry.target);
        });
    }, { threshold: 0.5 });
    scoreCircles.forEach(circle => scoreObserver.observe(circle));

    // ==========================================
    // 7. TILT + MAGNETIC (desktop only)
    // ==========================================
    if (!disableHeavyEffects) {
        const tiltCards = document.querySelectorAll('[data-tilt]');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 14;
                const rotateY = (centerX - x) / 14;
                const glowX = (x / rect.width) * 100;
                const glowY = (y / rect.height) * 100;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
                card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(108, 92, 231, 0.12), rgba(255, 255, 255, 0.04))`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
                card.style.background = '';
            });
        });

        const magneticLinks = document.querySelectorAll('.social-link, .floating-badge');
        magneticLinks.forEach(link => {
            link.addEventListener('mousemove', e => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                link.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
        });
    }

    // ==========================================
    // 8. CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn-submit');
            if (!btn) return;

            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
            btn.style.pointerEvents = 'none';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.success) {
                    btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
                    btn.style.background = 'linear-gradient(135deg, #00cec9, #6c5ce7)';
                    contactForm.reset();
                } else {
                    btn.innerHTML = '<span>Error Sending</span><i class="fas fa-times"></i>';
                    btn.style.background = 'linear-gradient(135deg, #ff7675, #d63031)';
                }
            } catch (error) {
                btn.innerHTML = '<span>Network Error</span><i class="fas fa-exclamation-triangle"></i>';
                btn.style.background = 'linear-gradient(135deg, #ff7675, #d63031)';
                console.error('Network Error:', error);
            }

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.pointerEvents = 'auto';
            }, 2500);
        });
    }

    // ==========================================
    // 9. ANCHOR NAVIGATION TRANSITION
    // ==========================================
    const pageTransition = document.querySelector('.page-transition');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            if (pageTransition && !prefersReducedMotion && !disableHeavyEffects) {
                pageTransition.classList.add('active');
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'auto', block: 'start' });
                    pageTransition.classList.remove('active');
                    pageTransition.classList.add('active-out');
                    setTimeout(() => pageTransition.classList.remove('active-out'), 450);
                }, 550);
            } else {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==========================================
    // 10. HERO STAGGER
    // ==========================================
    const heroReveals = document.querySelectorAll('.hero-section .reveal-up');
    heroReveals.forEach((el, i) => {
        setTimeout(() => el.classList.add('revealed'), 250 + i * 160);
    });

    // ==========================================
    // 11. LOADING SCREEN
    // ==========================================
    const loader = document.getElementById('loader');
    const loaderFill = document.getElementById('loaderFill');
    let loadProgress = 0;

    function animateLoader() {
        loadProgress += Math.random() * 15 + 5;
        if (loadProgress > 100) loadProgress = 100;
        if (loaderFill) loaderFill.style.width = loadProgress + '%';

        if (loadProgress < 100) {
            setTimeout(animateLoader, 150 + Math.random() * 220);
        } else {
            setTimeout(() => {
                if (loader) loader.classList.add('loaded');
                document.body.style.overflow = '';
            }, 250);
        }
    }

    if (loader) {
        document.body.style.overflow = 'hidden';
        animateLoader();
    }

    // ==========================================
    // 6. 3D TILT EFFECT (DESKTOP ONLY)
    // ==========================================
    if (window.matchMedia("(hover: hover)").matches) {
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
            max: 8,
            speed: 400,
            glare: true,
            "max-glare": 0.15,
            scale: 1.02,
        });
    }

    // ==========================================
    // 12. TIMELINE DRAW
    // ==========================================
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                timeline.classList.add('draw-line');
                timelineObserver.unobserve(entry.target);
            });
        }, { threshold: 0.2 });
        timelineObserver.observe(timeline);
    }

    // ==========================================
    // 13. CLONE GRADIENT DEFS FOR SVGs
    // ==========================================
    const allSvgs = document.querySelectorAll('.score-circle svg');
    allSvgs.forEach((svg, i) => {
        if (i > 0) svg.prepend(defs.cloneNode(true));
    });

    // ==========================================
    // 14. RIPPLE EFFECT
    // ==========================================
    if (!prefersReducedMotion) {
        document.querySelectorAll('.glass-card, .btn').forEach(el => {
            el.addEventListener('click', function (e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(108,92,231,0.35), transparent 70%);
                    width: 170px;
                    height: 170px;
                    left: ${e.clientX - rect.left - 85}px;
                    top: ${e.clientY - rect.top - 85}px;
                    transform: scale(0);
                    opacity: 1;
                    pointer-events: none;
                    transition: transform 0.5s ease, opacity 0.5s ease;
                `;
                this.style.position = this.style.position || 'relative';
                this.appendChild(ripple);
                requestAnimationFrame(() => {
                    ripple.style.transform = 'scale(2.5)';
                    ripple.style.opacity = '0';
                });
                setTimeout(() => ripple.remove(), 550);
            });
        });
    }

    // ==========================================
    // 15. CARD HOVER GLOW + SPOTLIGHT + TAG STAGGER
    // ==========================================
    if (!disableHeavyEffects) {
        document.querySelectorAll('.project-card, .education-card, .stat-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(108, 92, 231, 0.1), rgba(255, 255, 255, 0.04) 50%)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = '';
            });
        });

        const spotlight = document.getElementById('mouseSpotlight');
        if (spotlight) {
            let spotX = 0;
            let spotY = 0;
            let targetX = 0;
            let targetY = 0;

            document.addEventListener('mousemove', e => {
                targetX = e.clientX;
                targetY = e.clientY;
                spotlight.classList.add('active');
            }, { passive: true });

            document.addEventListener('mouseleave', () => {
                spotlight.classList.remove('active');
            }, { passive: true });

            const updateSpotlight = () => {
                spotX += (targetX - spotX) * 0.08;
                spotY += (targetY - spotY) * 0.08;
                spotlight.style.left = spotX + 'px';
                spotlight.style.top = spotY + 'px';
                requestAnimationFrame(updateSpotlight);
            };
            updateSpotlight();
        }
    }

    const tagGroups = document.querySelectorAll('.skill-tags, .timeline-tags, .project-tech');
    const tagObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const tags = entry.target.querySelectorAll('.tag, span');
            tags.forEach((tag, i) => {
                tag.style.opacity = '0';
                tag.style.transform = 'translateY(10px) scale(0.9)';
                tag.style.transition = `all 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s`;
                setTimeout(() => {
                    tag.style.opacity = '1';
                    tag.style.transform = 'translateY(0) scale(1)';
                }, 40);
            });
            tagObserver.unobserve(entry.target);
        });
    }, { threshold: 0.3 });
    tagGroups.forEach(group => tagObserver.observe(group));

    // Cleanup for long sessions
    window.addEventListener('beforeunload', () => {
        if (particleRAF) cancelAnimationFrame(particleRAF);
    });
});
