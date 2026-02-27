/* ========================================
   PORTFOLIO JS – Animations & Interactivity
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    //  1. PARTICLE BACKGROUND
    // ==========================================
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.baseSize = Math.random() * 2.5 + 0.5;
            this.size = this.baseSize;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.6 + 0.15;
            this.hue = Math.random() > 0.6 ? 260 : Math.random() > 0.3 ? 175 : 340; // purple, teal, or pink
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            // Mouse interaction - attract nearby, repel very close
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 60) {
                    this.x += dx / dist * 2.5;
                    this.y += dy / dist * 2.5;
                } else if (dist < 200) {
                    this.x -= dx / dist * 0.3;
                    this.y -= dy / dist * 0.3;
                }
            }

            // Pulse size
            this.pulsePhase += this.pulseSpeed;
            this.size = this.baseSize + Math.sin(this.pulsePhase) * 0.5;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 70%, 65%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const isMobile = window.innerWidth <= 768;
        const maxParticles = isMobile ? 30 : 80;
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), maxParticles);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    const opacity = 0.08 * (1 - dist / 100);
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    window.addEventListener('mousemove', e => {
        if (window.innerWidth <= 768) return; // Disable on mobile
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    // ==========================================
    //  1B. MOUSE GLOW TRAIL
    // ==========================================
    const glowTrail = [];
    const maxTrailLength = 10;

    document.addEventListener('mousemove', e => {
        if (window.innerWidth <= 768) return; // Disable on mobile
        glowTrail.push({ x: e.clientX, y: e.clientY, alpha: 0.6 });
        if (glowTrail.length > maxTrailLength) glowTrail.shift();
    });

    // Draw glow trail on canvas
    const origAnimate = animateParticles;
    function animateWithGlow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw mouse glow (Only if on desktop)
        if (window.innerWidth > 768) {
            glowTrail.forEach((point, i) => {
                const ratio = i / glowTrail.length;
                const radius = ratio * 60;
                const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
                gradient.addColorStop(0, `rgba(108, 92, 231, ${ratio * 0.08})`);
                gradient.addColorStop(0.5, `rgba(0, 206, 201, ${ratio * 0.04})`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.beginPath();
                ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                point.alpha *= 0.95;
            });
        }

        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animateWithGlow);
    }
    // Cancel the original animation and start this one
    // (We need to override — simplest: just let both run, first loop won't collide)
    // Actually let's just have ONE loop. Replace via flag:
    // The original animateParticles is already running. We'll add glow drawing inside it.

    // ==========================================
    //  2. CUSTOM CURSOR
    // ==========================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', e => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
    });

    function animateCursor() {
        outlineX += (cursorX - outlineX) * 0.15;
        outlineY += (cursorY - outlineY) * 0.15;
        cursorOutline.style.left = outlineX + 'px';
        cursorOutline.style.top = outlineY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect
    const hoverTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .education-card');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // ==========================================
    //  3. NAVBAR
    // ==========================================
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');

    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                // Scrolled class
                navbar.classList.toggle('scrolled', window.scrollY > 50);

                // Active link
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 120;
                    if (window.scrollY >= sectionTop) {
                        current = section.getAttribute('id');
                    }
                });
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // ==========================================
    //  4. TYPEWRITER EFFECT
    // ==========================================
    const typewriterEl = document.getElementById('typewriter');
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

    function typeEffect() {
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
            speed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            speed = 400;
        }

        setTimeout(typeEffect, speed);
    }
    typeEffect();

    // ==========================================
    //  5. SCROLL REVEAL ANIMATIONS
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal-up');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    //  6. ANIMATED COUNTERS
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));

    function animateCounter(el, target) {
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
    }

    // ==========================================
    //  7. SKILL BARS ANIMATION
    // ==========================================
    const skillFills = document.querySelectorAll('.skill-fill');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(bar => skillObserver.observe(bar));

    // ==========================================
    //  8. EDUCATION SCORE CIRCLES
    // ==========================================
    const scoreCircles = document.querySelectorAll('.score-fill');

    // Inject SVG gradient definition
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

    // Append to first SVG
    const firstSvg = document.querySelector('.score-circle svg');
    if (firstSvg) firstSvg.prepend(defs);

    const scoreObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const percent = parseInt(entry.target.getAttribute('data-percent'));
                const circumference = 2 * Math.PI * 45; // r=45
                const offset = circumference - (percent / 100) * circumference;
                entry.target.style.strokeDashoffset = offset;
                scoreObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    scoreCircles.forEach(circle => scoreObserver.observe(circle));

    // ==========================================
    //  9. TILT EFFECT ON CARDS
    // ==========================================
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            if (window.innerWidth <= 768) return; // Disable on mobile
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 14;
            const rotateY = (centerX - x) / 14;

            // Inner glow follows cursor
            const glowX = (x / rect.width) * 100;
            const glowY = (y / rect.height) * 100;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
            card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(108, 92, 231, 0.12), rgba(255, 255, 255, 0.04))`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            card.style.background = '';
        });
    });

    // ==========================================
    //  10. CONTACT FORM HANDLING (Web3Forms)
    // ==========================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('.btn-submit');
            const originalText = btn.innerHTML;

            // Show loading state
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
                    console.error('Form Error:', data);
                }
            } catch (error) {
                btn.innerHTML = '<span>Network Error</span><i class="fas fa-exclamation-triangle"></i>';
                btn.style.background = 'linear-gradient(135deg, #ff7675, #d63031)';
                console.error('Network Error:', error);
            }

            // Reset button after 3 seconds
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.pointerEvents = 'auto';
            }, 3000);
        });
    }

    // ==========================================
    //  11. CINEMATIC PAGE TRANSITIONS
    // ==========================================
    const pageTransition = document.querySelector('.page-transition');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                // Trigger cinematic transition
                if (pageTransition) {
                    pageTransition.classList.add('active');

                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'auto', block: 'start' });
                        pageTransition.classList.remove('active');
                        pageTransition.classList.add('active-out');

                        setTimeout(() => {
                            pageTransition.classList.remove('active-out');
                        }, 500); // Wait for exit animation (opacity fade)
                    }, 800); // Wait for 800ms enter animation (clip-path circle fill)
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ==========================================
    //  12. HERO TEXT STAGGER
    // ==========================================
    const heroReveals = document.querySelectorAll('.hero-section .reveal-up');
    heroReveals.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('revealed');
        }, 300 + i * 200);
    });

    // ==========================================
    //  13. MAGNETIC EFFECT ON SOCIAL LINKS
    // ==========================================
    const magneticLinks = document.querySelectorAll('.social-link, .floating-badge');
    magneticLinks.forEach(link => {
        link.addEventListener('mousemove', e => {
            if (window.innerWidth <= 768) return; // Disable on mobile
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            link.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = '';
        });
    });

    // ==========================================
    //  14. LOADING SCREEN
    // ==========================================
    const loader = document.getElementById('loader');
    const loaderFill = document.getElementById('loaderFill');
    let loadProgress = 0;

    function animateLoader() {
        loadProgress += Math.random() * 15 + 5;
        if (loadProgress > 100) loadProgress = 100;
        if (loaderFill) loaderFill.style.width = loadProgress + '%';

        if (loadProgress < 100) {
            setTimeout(animateLoader, 200 + Math.random() * 300);
        } else {
            setTimeout(() => {
                if (loader) loader.classList.add('loaded');
                document.body.style.overflow = '';
            }, 400);
        }
    }

    document.body.style.overflow = 'hidden';
    animateLoader();

    // ==========================================
    //  14B. SCROLL PROGRESS BAR
    // ==========================================
    const scrollProgressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        // Scroll progress
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        if (scrollProgressBar) scrollProgressBar.style.width = scrollPercent + '%';

        // Back to top visibility
        if (backToTopBtn) {
            backToTopBtn.classList.toggle('visible', scrollTop > 500);
        }
    });

    // ==========================================
    //  14C. TIMELINE DRAW ON SCROLL
    // ==========================================
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timeline.classList.add('draw-line');
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        timelineObserver.observe(timeline);
    }

    // ==========================================
    //  15. CLONE GRADIENT DEFS FOR SECOND SVG
    // ==========================================
    const allSvgs = document.querySelectorAll('.score-circle svg');
    allSvgs.forEach((svg, i) => {
        if (i > 0) {
            const clonedDefs = defs.cloneNode(true);
            svg.prepend(clonedDefs);
        }
    });

    // ==========================================
    //  16. PARALLAX ON SCROLL
    // ==========================================
    const parallaxElements = document.querySelectorAll('.floating-badge, .image-ring');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        parallaxElements.forEach((el, i) => {
            const speed = (i + 1) * 0.03;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });

    // ==========================================
    //  17. CLICK RIPPLE EFFECT
    // ==========================================
    document.querySelectorAll('.glass-card, .btn').forEach(el => {
        el.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(108,92,231,0.4), transparent 70%);
                width: 200px;
                height: 200px;
                left: ${e.clientX - this.getBoundingClientRect().left - 100}px;
                top: ${e.clientY - this.getBoundingClientRect().top - 100}px;
                transform: scale(0);
                opacity: 1;
                pointer-events: none;
                transition: transform 0.6s ease, opacity 0.6s ease;
            `;
            this.style.position = this.style.position || 'relative';
            this.appendChild(ripple);
            requestAnimationFrame(() => {
                ripple.style.transform = 'scale(3)';
                ripple.style.opacity = '0';
            });
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // ==========================================
    //  18. CARD INNER GLOW ON HOVER
    // ==========================================
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

    // ==========================================
    //  19. MOUSE SPOTLIGHT
    // ==========================================
    const spotlight = document.getElementById('mouseSpotlight');
    if (spotlight) {
        let spotX = 0, spotY = 0;
        let spotTargetX = 0, spotTargetY = 0;

        document.addEventListener('mousemove', e => {
            spotTargetX = e.clientX;
            spotTargetY = e.clientY;
            spotlight.classList.add('active');
        });

        document.addEventListener('mouseleave', () => {
            spotlight.classList.remove('active');
        });

        function updateSpotlight() {
            spotX += (spotTargetX - spotX) * 0.08;
            spotY += (spotTargetY - spotY) * 0.08;
            spotlight.style.left = spotX + 'px';
            spotlight.style.top = spotY + 'px';
            requestAnimationFrame(updateSpotlight);
        }
        updateSpotlight();
    }

    // ==========================================
    //  20. CLICK SPARKLE BURST
    // ==========================================
    document.addEventListener('click', e => {
        const sparkleCount = 12;
        const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#a29bfe', '#81ecec'];

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            const angle = (i / sparkleCount) * Math.PI * 2;
            const velocity = 40 + Math.random() * 60;
            const size = 3 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];

            sparkle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                box-shadow: 0 0 6px ${color}, 0 0 12px ${color};
                transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            `;
            document.body.appendChild(sparkle);

            requestAnimationFrame(() => {
                sparkle.style.left = (e.clientX + Math.cos(angle) * velocity) + 'px';
                sparkle.style.top = (e.clientY + Math.sin(angle) * velocity) + 'px';
                sparkle.style.opacity = '0';
                sparkle.style.transform = `scale(0)`;
            });

            setTimeout(() => sparkle.remove(), 700);
        }
    });

    // ==========================================
    //  21. TAG STAGGER ANIMATION
    // ==========================================
    const tagGroups = document.querySelectorAll('.skill-tags, .timeline-tags, .project-tech');
    const tagObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const tags = entry.target.querySelectorAll('.tag, span');
                tags.forEach((tag, i) => {
                    tag.style.opacity = '0';
                    tag.style.transform = 'translateY(10px) scale(0.8)';
                    tag.style.transition = `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`;
                    setTimeout(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                });
                tagObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    tagGroups.forEach(group => tagObserver.observe(group));

});
