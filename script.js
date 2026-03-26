// Example connecting the frontend to your PostgreSQL backend
// Automatically use localhost if opened directly, otherwise use the live Render URL
const BACKEND_URL = window.location.origin.startsWith('file') ? 'http://localhost:3000' : '';

// Note: Ensure the backend is running `node server.js`
async function fetchStatus() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/status`);
        const data = await response.json();
        console.log('Backend Status:', data);
    } catch (error) {
        console.error('Error connecting to backend:', error);
    }
}

// -------------------------------------------------------------
// UI INTERACTIVITY & ANIMATIONS
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Backend Check
    fetchStatus();

    // 2. Scroll Progress Bar
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + '%';
    });

    // 3. Sticky Navbar & Active States
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 4. Mobile Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 5. Scroll Reveal Animations & Skill Bars
    const faders = document.querySelectorAll('.fade-in, .about-content');
    const skillBars = document.querySelectorAll('.skill-bar');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');

                // If it's a skill card, trigger the bar animation
                if (entry.target.classList.contains('skill-card')) {
                    const bar = entry.target.querySelector('.skill-bar');
                    if (bar) {
                        bar.style.width = bar.getAttribute('data-width');
                    }
                }

                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // 6. Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 7. Contact Form Handling (Connected to API)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Sending...';
            btn.style.opacity = '0.8';

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            try {
                // Send data to backend
                const response = await fetch(`${BACKEND_URL}/api/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message }),
                });

                if (response.ok) {
                    btn.innerText = 'Message Sent!';
                    btn.style.background = '#10b981'; // Success green
                    contactForm.reset();
                } else {
                    btn.innerText = 'Failed to Send';
                    btn.style.background = '#ef4444'; // Error red
                }
            } catch (error) {
                console.error('Error:', error);
                btn.innerText = 'Server Error';
                btn.style.background = '#ef4444'; // Error red
            }

            // Reset button after 3 seconds
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = ''; // reset to default CSS
                btn.style.opacity = '1';
            }, 3000);
        });
    }
});