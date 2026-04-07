/* ============================================================
   PORTFOLIO JS - Twin of dark-shine--sundar7777.replit.app
   ============================================================ */

// ========== ALWAYS START FROM TOP ON REFRESH ==========
// Prevents browser from restoring scroll position on reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ========== PAGE LOADER ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600); 
        }
        document.body.classList.remove('loading-overflow');
    }, 2500);
});

// ========== PARTICLE NETWORK BACKGROUND ==========
class ParticleNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.maxDistance = 150;
        this.mouse = { x: null, y: null, radius: 150 };

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.7 ? '#00cec9' : (Math.random() > 0.5 ? '#a29bfe' : '#fd79a8')
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Boundary wrapping
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.maxDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = '#00cec9';
                    this.ctx.globalAlpha = 0.08 * (1 - dist / this.maxDistance);
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

// ========== TYPING ANIMATION ==========
class TypeWriter {
    constructor(element, words, waitTime = 2000) {
        this.element = element;
        this.words = words;
        this.waitTime = waitTime;
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const currentWord = this.words[this.wordIndex];

        if (this.isDeleting) {
            this.charIndex--;
        } else {
            this.charIndex++;
        }

        this.element.textContent = currentWord.substring(0, this.charIndex);

        let typeSpeed = this.isDeleting ? 50 : 100;

        if (!this.isDeleting && this.charIndex === currentWord.length) {
            typeSpeed = this.waitTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            typeSpeed = 300;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ========== SCROLL ANIMATIONS (Custom AOS) ==========
class ScrollAnimator {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.observe();
    }

    observe() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-aos-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, parseInt(delay));
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        this.elements.forEach(el => observer.observe(el));
    }
}

// ========== COUNTER ANIMATION ==========
class CounterAnimator {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.observe();
    }

    observe() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(c => observer.observe(c));
    }

    animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * easeOut);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

// ========== PROGRESS BAR ANIMATION ==========
class ProgressAnimator {
    constructor() {
        this.bars = document.querySelectorAll('.progress-fill');
        this.observe();
    }

    observe() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const width = entry.target.getAttribute('data-width');
                    entry.target.style.width = width + '%';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.bars.forEach(b => observer.observe(b));
    }
}

// ========== NAVBAR ==========
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.toggle = document.getElementById('nav-toggle');
        this.links = document.getElementById('nav-links');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');

        this.bindEvents();
        this.onScroll();
    }

    bindEvents() {
        window.addEventListener('scroll', () => this.onScroll());

        this.toggle.addEventListener('click', () => {
            this.links.classList.toggle('active');
            this.toggle.classList.toggle('active');
        });

        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.links.classList.remove('active');
                this.toggle.classList.remove('active');
            });
        });
    }

    onScroll() {
        // Expand/shrink based on scroll position
        // Stays full/expanded in hero, shrinks when scrolling past it
        const scrollY = window.scrollY;
        if (scrollY > 80) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Active link tracking
        this.sections.forEach(section => {
            const top = section.offsetTop - 100;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (window.scrollY >= top && window.scrollY < top + height) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ========== SCROLL PROGRESS BAR ==========
class ScrollProgress {
    constructor() {
        this.progressBar = document.getElementById('scroll-progress-bar');
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;

            if (this.progressBar) {
                this.progressBar.style.width = scrolled + '%';
                
                // Invisible on 1st page (Hero section)
                if (winScroll > 50) {
                    this.progressBar.style.opacity = '1';
                } else {
                    this.progressBar.style.opacity = '0';
                }
            }
        });
    }
}

// ========== SCROLL TO TOP ==========
class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scroll-top');
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });

        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ========== RESUME MODAL ==========
function openResume() {
    const modal = document.getElementById('resume-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeResume() {
    const modal = document.getElementById('resume-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('resume-modal');
    if (e.target === modal) {
        closeResume();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeResume();
    }
});

// ========== CONTACT FORM ==========
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = this.form.querySelector('.btn-send');
        const originalText = btn.innerHTML;

        btn.innerHTML = 'Sending...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        try {
            const response = await fetch("https://formsubmit.co/ajax/kssundararaghavan411@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    _subject: `New Message from ${name} (Portfolio)`,
                    _template: "box",
                    _captcha: "false"
                })
            });

            if (response.ok) {
                btn.innerHTML = '✓ Message Sent!';
                btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                btn.style.opacity = '1';
                this.form.reset();
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            btn.innerHTML = '⚠ Failed! Check Console.';
            btn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            btn.style.opacity = '1';
            console.error('FormSubmit Error:', error);
        }

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 4000);
    }
}

// ========== CUSTOM CURSOR ==========
class CustomCursor {
    constructor() {
        this.dot = document.querySelector('.cursor-dot');
        this.outline = document.querySelector('.cursor-outline');
        this.links = document.querySelectorAll('a, button, .social-icon, .nav-toggle, #resume-btn');
        
        this.mouse = { x: 0, y: 0 };
        this.cursor = { x: 0, y: 0 };
        this.outlinePos = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Dot follows instantly
            if (this.dot) {
                this.dot.style.left = `${this.mouse.x}px`;
                this.dot.style.top = `${this.mouse.y}px`;
            }
        });

        // Smoothly animate the outline with lag
        const animateOutline = () => {
            const easing = 0.2; // Adjust for more/less lag
            
            this.outlinePos.x += (this.mouse.x - this.outlinePos.x) * easing;
            this.outlinePos.y += (this.mouse.y - this.outlinePos.y) * easing;
            
            if (this.outline) {
                this.outline.style.left = `${this.outlinePos.x}px`;
                this.outline.style.top = `${this.outlinePos.y}px`;
            }
            
            requestAnimationFrame(animateOutline);
        };
        animateOutline();

        // Hover effects
        this.links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.dot.classList.add('cursor-hover');
                this.outline.classList.add('cursor-hover');
            });
            link.addEventListener('mouseleave', () => {
                this.dot.classList.remove('cursor-hover');
                this.outline.classList.remove('cursor-hover');
            });
        });

        // Click effects
        window.addEventListener('mousedown', () => {
            this.dot.classList.add('cursor-active');
            this.outline.classList.add('cursor-active');
        });
        window.addEventListener('mouseup', () => {
            this.dot.classList.remove('cursor-active');
            this.outline.classList.remove('cursor-active');
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.dot.style.opacity = '0';
            this.outline.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            this.dot.style.opacity = '1';
            this.outline.style.opacity = '1';
        });
    }
}

// ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========== INITIALIZE EVERYTHING ==========
document.addEventListener('DOMContentLoaded', () => {
    // Particle background
    const canvas = document.getElementById('particles-canvas');
    if (canvas) new ParticleNetwork(canvas);

    // Typing animation
    const typingEl = document.getElementById('typing-text');
    if (typingEl) {
        new TypeWriter(typingEl, [
            'AI Solutions Architect',
            'Full Stack Developer',
            'ML Engineer',
            'MERN Stack Developer'
        ], 2000);
    }

    // Scroll animations
    new ScrollAnimator();

    // Counters
    new CounterAnimator();

    // Progress bars
    new ProgressAnimator();

    // Navigation
    new Navigation();

    // Scroll to top
    new ScrollToTop();

    // Scroll progress bar
    new ScrollProgress();

    // Contact form
    new ContactForm();

    // Custom Cursor
    if (window.innerWidth > 1024) {
        new CustomCursor();
    }

    // Profile image fallback
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
        profileImg.addEventListener('error', function() {
            this.src = 'https://dark-shine--sundar7777.replit.app/assets/profile-DC0mk_5_.jpg';
        });
    }
});
