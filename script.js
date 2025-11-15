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
