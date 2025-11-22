// Lightbox functionality
(function() {
    'use strict';

    let currentImageIndex = 0;
    let galleryImages = [];
    let galleryCaptions = [];

    // Initialize lightbox when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initLightbox();
    });

    function initLightbox() {
        // Event delegation for clickable images
        document.body.addEventListener('click', function(e) {
            const clickedImg = e.target.closest('.clickable-image');
            if (clickedImg) {
                e.preventDefault();
                const lightboxSrc = clickedImg.dataset.lightbox || clickedImg.src;
                openLightbox(lightboxSrc, clickedImg);
            }
        });

        // Lightbox close button
        const closeBtn = document.querySelector('.lightbox-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeLightbox();
            });
        }

        // Navigation arrows
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateLightbox(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateLightbox(1);
            });
        }

        // Click background to close
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.addEventListener('click', closeLightbox);
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(event) {
            if (lightbox && lightbox.classList.contains('active')) {
                if (event.key === 'Escape') {
                    closeLightbox();
                } else if (event.key === 'ArrowLeft') {
                    navigateLightbox(-1);
                } else if (event.key === 'ArrowRight') {
                    navigateLightbox(1);
                }
            }
        });

        // Touch/swipe navigation for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        let isSwiping = false;

        if (lightbox) {
            lightbox.addEventListener('touchstart', function(event) {
                touchStartX = event.changedTouches[0].screenX;
                touchStartY = event.changedTouches[0].screenY;
                isSwiping = false;
            }, { passive: true });

            lightbox.addEventListener('touchmove', function(event) {
                // Detect if user is swiping
                const currentX = event.changedTouches[0].screenX;
                const diffX = Math.abs(touchStartX - currentX);
                if (diffX > 10) {
                    isSwiping = true;
                }
            }, { passive: true });

            lightbox.addEventListener('touchend', function(event) {
                touchEndX = event.changedTouches[0].screenX;
                touchEndY = event.changedTouches[0].screenY;

                if (handleSwipe()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }, false);
        }

        function handleSwipe() {
            const swipeThreshold = 50; // minimum distance for swipe
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);

            // Only trigger if horizontal swipe is greater than vertical
            if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
                if (diffX > 0) {
                    // Swiped left - next image
                    navigateLightbox(1);
                } else {
                    // Swiped right - previous image
                    navigateLightbox(-1);
                }
                return true;
            }
            return false;
        }
    }

    function openLightbox(src, clickedImg) {
        // Find the parent gallery container
        const gallery = clickedImg.closest('.content-grid, .image-gallery');

        // Reset arrays
        galleryImages = [];
        galleryCaptions = [];

        // Get all clickable images in this gallery
        if (gallery) {
            const images = gallery.querySelectorAll('.clickable-image');

            // Build array of image sources and captions
            images.forEach(function(img) {
                const imageSrc = img.dataset.lightbox || img.src;
                galleryImages.push(imageSrc);

                // Get caption from alt attribute or nearby h4/h5
                let caption = '';

                // Don't add captions for character images (they have names in the images)
                if (imageSrc.indexOf('characters') === -1) {
                    const parentItem = img.closest('.content-item, .gallery-item');
                    if (parentItem) {
                        const title = parentItem.querySelector('h4, h5');
                        if (title) {
                            caption = title.textContent;
                        }
                    }
                    if (!caption) {
                        caption = img.getAttribute('alt') || '';
                    }
                }
                galleryCaptions.push(caption);
            });

            // Find current image index
            currentImageIndex = galleryImages.indexOf(src);
        } else {
            // Single image, not in a gallery
            galleryImages = [src];
            galleryCaptions = [clickedImg.getAttribute('alt') || ''];
            currentImageIndex = 0;
        }

        // Show lightbox
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');

        if (lightbox && lightboxImg && lightboxCaption) {
            lightbox.classList.add('active');
            lightboxImg.src = src;
            lightboxCaption.textContent = galleryCaptions[currentImageIndex];
            document.body.style.overflow = 'hidden';
            updateArrowVisibility();
        }
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    function navigateLightbox(direction) {
        currentImageIndex += direction;

        // Wrap around
        if (currentImageIndex < 0) {
            currentImageIndex = galleryImages.length - 1;
        } else if (currentImageIndex >= galleryImages.length) {
            currentImageIndex = 0;
        }

        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');

        if (lightboxImg && lightboxCaption) {
            lightboxImg.src = galleryImages[currentImageIndex];
            lightboxCaption.textContent = galleryCaptions[currentImageIndex];
            updateArrowVisibility();
        }
    }

    function updateArrowVisibility() {
        const prevArrow = document.querySelector('.lightbox-prev');
        const nextArrow = document.querySelector('.lightbox-next');

        if (prevArrow && nextArrow) {
            // Hide arrows if only one image
            if (galleryImages.length <= 1) {
                prevArrow.style.display = 'none';
                nextArrow.style.display = 'none';
            } else {
                prevArrow.style.display = 'block';
                nextArrow.style.display = 'block';
            }
        }
    }
})();

// Initialize Swiper for mobile carousels
(function() {
    'use strict';

    function initMobileCarousels() {
        // Only run on mobile devices
        if (window.innerWidth <= 768) {
            const carousels = document.querySelectorAll('.mobile-carousel.swiper');

            carousels.forEach(function(carousel) {
                // Skip if already initialized
                if (carousel.swiper) {
                    return;
                }

                new Swiper(carousel, {
                    slidesPerView: 1.3,
                    spaceBetween: 20,
                    centeredSlides: false,
                    grabCursor: true,
                    touchRatio: 1,
                    threshold: 5,
                    pagination: {
                        el: carousel.querySelector('.swiper-pagination'),
                        clickable: true,
                        dynamicBullets: true,
                    },
                    on: {
                        init: function() {
                            console.log('Swiper initialized');
                        }
                    }
                });
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileCarousels);
    } else {
        initMobileCarousels();
    }

    // Reinitialize on resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Destroy existing instances first
            document.querySelectorAll('.mobile-carousel.swiper').forEach(function(el) {
                if (el.swiper) {
                    el.swiper.destroy(true, true);
                }
            });
            initMobileCarousels();
        }, 250);
    });
})();

// Google Analytics Event Tracking
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Track video/content button clicks (Watch/Listen buttons)
        document.querySelectorAll('.content-item .btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const contentItem = btn.closest('.content-item');
                const title = contentItem.querySelector('h4');
                const videoTitle = title ? title.textContent.trim() : 'Unknown';
                const section = btn.closest('.content-section');
                const sectionHead = section ? section.querySelector('.section-head h2') : null;
                const sectionName = sectionHead ? sectionHead.textContent.trim() : 'Unknown';

                gtag('event', 'video_click', {
                    'event_category': sectionName,
                    'event_label': videoTitle,
                    'video_title': videoTitle,
                    'section': sectionName
                });
            });
        });

        // Track comic/image clicks
        document.querySelectorAll('.clickable-image').forEach(function(img) {
            img.addEventListener('click', function() {
                const contentItem = img.closest('.content-item, .gallery-item');
                const title = contentItem ? contentItem.querySelector('h4, h5') : null;
                const imageTitle = title ? title.textContent.trim() : (img.alt || 'Unknown');
                const section = img.closest('.content-section');
                const sectionHead = section ? section.querySelector('.section-head h2') : null;
                const sectionName = sectionHead ? sectionHead.textContent.trim() : 'Unknown';

                // Determine if it's a comic or film-related image
                const isComic = img.src.includes('Comics') || img.src.includes('Rocket');
                const isFilm = img.src.includes('Revenge Salad');
                const category = isFilm ? 'Film' : (isComic ? 'Comics' : sectionName);

                gtag('event', 'image_click', {
                    'event_category': category,
                    'event_label': imageTitle,
                    'image_title': imageTitle,
                    'section': sectionName
                });
            });
        });

        // Track resume and cover letter download clicks
        document.querySelectorAll('a[href*="Resume"]').forEach(function(link) {
            link.addEventListener('click', function() {
                const href = link.getAttribute('href');
                const isResume = href.includes('Resume.pdf');
                const isCoverLetter = href.includes('Cover Letter');

                gtag('event', isResume ? 'resume_download' : 'cover_letter_download', {
                    'event_category': 'Resume',
                    'event_label': isCoverLetter ? 'Cover Letter PDF Download' : 'Resume PDF Download'
                });
            });
        });

        // Track social media button clicks
        document.querySelectorAll('.social-links a, .tp-social a').forEach(function(link) {
            link.addEventListener('click', function() {
                const href = link.getAttribute('href');
                let platform = 'Unknown';

                if (href.includes('twitter')) platform = 'Twitter';
                else if (href.includes('instagram')) platform = 'Instagram';
                else if (href.includes('facebook')) platform = 'Facebook';
                else if (href.includes('youtube')) platform = 'YouTube';

                gtag('event', 'social_click', {
                    'event_category': 'Social Media',
                    'event_label': platform,
                    'platform': platform
                });
            });
        });
    });
})();
