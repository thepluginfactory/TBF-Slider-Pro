/**
 * TPF Slider Pro - Frontend JavaScript
 * 3D Coverflow Effect - Proper Implementation
 */

(function($) {
    'use strict';

    var TPFSliderPro = {

        init: function() {
            var self = this;

            // Initialize coverflow sliders (desktop only - mobile handled separately)
            $('.tpf-slider[data-transition="coverflow"]').each(function() {
                self.initCoverflow($(this));
            });
        },

        /**
         * Initialize coverflow effect for a slider (desktop only)
         */
        initCoverflow: function($slider) {
            var self = this;
            var $slides = $slider.find('.tpf-slide:not(.tpf-clone)');
            var slideCount = $slides.length;

            if (slideCount === 0) return;

            // Store slider data
            $slider.data('coverflow-index', 0);
            $slider.data('coverflow-count', slideCount);
            $slider.data('coverflow-animating', false);

            // Remove any clones (not needed for coverflow)
            $slider.find('.tpf-slide.tpf-clone').remove();

            // Remove carousel class if present
            $slider.removeClass('tpf-carousel');

            // Clear any inline transform on wrapper
            $slider.find('.tpf-slider-wrapper').css('transform', 'none');

            // Initial positioning
            self.updateCoverflowPositions($slider);

            // Override arrow click handlers
            $slider.find('.tpf-arrow').off('click').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if ($slider.data('coverflow-animating')) return;

                var currentIndex = $slider.data('coverflow-index');
                var count = $slider.data('coverflow-count');
                var direction;

                if ($(this).hasClass('tpf-arrow-next')) {
                    currentIndex = (currentIndex + 1) % count;
                    direction = 'next';
                } else {
                    currentIndex = (currentIndex - 1 + count) % count;
                    direction = 'prev';
                }

                self.goToSlide($slider, currentIndex, direction);
            });

            // Override dot click handlers
            $slider.find('.tpf-dot').off('click').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if ($slider.data('coverflow-animating')) return;

                var index = $(this).data('index');
                self.goToSlide($slider, index);
            });

            // Click on side slides to navigate (but not on buttons)
            $slides.on('click', function(e) {
                // Ignore clicks on buttons (enlarge, info, link, etc.)
                if ($(e.target).closest('button, a, .tpf-enlarge-btn, .tpf-info-btn, .tpf-link-btn').length) {
                    return;
                }

                var $slide = $(this);
                var clickedIndex = $slide.data('index');
                var currentIndex = $slider.data('coverflow-index');

                // Only navigate if clicking a non-center slide
                if (clickedIndex !== currentIndex && !$slider.data('coverflow-animating')) {
                    e.preventDefault();
                    self.goToSlide($slider, clickedIndex);
                }
            });

            // Handle autoplay
            if ($slider.data('autoplay') === true || $slider.data('autoplay') === 'true') {
                self.startAutoplay($slider);

                // Pause on hover
                if ($slider.data('pause-on-hover') === true || $slider.data('pause-on-hover') === 'true') {
                    $slider.on('mouseenter', function() {
                        self.stopAutoplay($slider);
                    }).on('mouseleave', function() {
                        self.startAutoplay($slider);
                    });
                }
            }

            // Initialize lightbox and info buttons (not handled by base slider for coverflow)
            self.initLightbox($slider);
            self.initInfoButton($slider);

            // Mark as initialized
            $slider.data('tpf-pro-initialized', true);
        },

        /**
         * Navigate to a specific slide
         */
        goToSlide: function($slider, index, direction) {
            var self = this;
            var oldIndex = $slider.data('coverflow-index') || 0;

            // Determine direction if not provided
            if (!direction) {
                direction = index > oldIndex ? 'next' : 'prev';
            }

            $slider.data('coverflow-animating', true);
            $slider.data('coverflow-index', index);

            self.updateCoverflowPositions($slider, direction);
            self.updateDots($slider, index);

            // Reset animating flag after transition
            setTimeout(function() {
                $slider.data('coverflow-animating', false);
            }, 650);
        },

        /**
         * Update all slide positions based on current index
         * Only shows immediate left/right neighbors, seamless loop
         */
        updateCoverflowPositions: function($slider, direction) {
            var $slides = $slider.find('.tpf-slide:not(.tpf-clone)');
            var currentIndex = $slider.data('coverflow-index') || 0;
            var count = $slides.length;

            $slides.each(function(index) {
                var $slide = $(this);
                var position = index - currentIndex;

                // Handle wrapping for seamless loop
                // If position is more than half the slides away, wrap around
                if (position > count / 2) {
                    position -= count;
                } else if (position < -count / 2) {
                    position += count;
                }

                // Determine what this slide's new role will be
                var isCenter = (position === 0);
                var isLeft = (position === -1);
                var isRight = (position === 1);
                var wasVisible = $slide.hasClass('coverflow-center') ||
                                 $slide.hasClass('coverflow-left-1') ||
                                 $slide.hasClass('coverflow-right-1');

                // Remove current position classes
                $slide.removeClass('coverflow-center coverflow-left-1 coverflow-right-1 active coverflow-queue-left coverflow-queue-right');

                if (isCenter) {
                    $slide.addClass('coverflow-center active');
                } else if (isLeft) {
                    // If entering from hidden, pre-position on left
                    if (!wasVisible && direction) {
                        $slide.addClass('coverflow-queue-left');
                        $slide[0].offsetHeight; // Force reflow
                        $slide.removeClass('coverflow-queue-left');
                    }
                    $slide.addClass('coverflow-left-1');
                } else if (isRight) {
                    // If entering from hidden, pre-position on right
                    if (!wasVisible && direction) {
                        $slide.addClass('coverflow-queue-right');
                        $slide[0].offsetHeight; // Force reflow
                        $slide.removeClass('coverflow-queue-right');
                    }
                    $slide.addClass('coverflow-right-1');
                }
                // Queue positions for slides not currently visible
                else if (position < 0) {
                    $slide.addClass('coverflow-queue-left');
                } else {
                    $slide.addClass('coverflow-queue-right');
                }
            });
        },

        /**
         * Update dots to reflect current slide
         */
        updateDots: function($slider, index) {
            var $dots = $slider.find('.tpf-dot');
            $dots.removeClass('active');
            $dots.eq(index).addClass('active');
        },

        /**
         * Start autoplay
         */
        startAutoplay: function($slider) {
            var self = this;
            var speed = parseInt($slider.data('autoplay-speed'), 10) || 5000;

            // Clear any existing interval
            self.stopAutoplay($slider);

            var interval = setInterval(function() {
                if (!$slider.data('coverflow-animating')) {
                    var currentIndex = $slider.data('coverflow-index');
                    var count = $slider.data('coverflow-count');
                    var nextIndex = (currentIndex + 1) % count;
                    self.goToSlide($slider, nextIndex);
                }
            }, speed);

            $slider.data('coverflow-autoplay', interval);
        },

        /**
         * Stop autoplay
         */
        stopAutoplay: function($slider) {
            var interval = $slider.data('coverflow-autoplay');
            if (interval) {
                clearInterval(interval);
                $slider.data('coverflow-autoplay', null);
            }
        },

        /**
         * Initialize lightbox for coverflow
         */
        initLightbox: function($slider) {
            var self = this;
            var $lightbox = $slider.find('.tpf-lightbox');
            var $lightboxImage = $lightbox.find('.tpf-lightbox-image');
            var $closeBtn = $lightbox.find('.tpf-lightbox-close');

            // Move lightbox to body to escape any stacking contexts
            $lightbox.appendTo('body');

            // Open lightbox when enlarge button clicked
            $slider.find('.tpf-enlarge-btn').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var imageUrl = $(this).data('image');
                $lightboxImage.attr('src', imageUrl);
                $lightbox.addClass('active');
                self.stopAutoplay($slider);
            });

            // Close lightbox
            $closeBtn.on('click', function(e) {
                e.preventDefault();
                $lightbox.removeClass('active');
                if ($slider.data('autoplay') === true || $slider.data('autoplay') === 'true') {
                    self.startAutoplay($slider);
                }
            });

            // Close on background click
            $lightbox.on('click', function(e) {
                if (e.target === this) {
                    $lightbox.removeClass('active');
                    if ($slider.data('autoplay') === true || $slider.data('autoplay') === 'true') {
                        self.startAutoplay($slider);
                    }
                }
            });

            // Close on escape key
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' && $lightbox.hasClass('active')) {
                    $lightbox.removeClass('active');
                    if ($slider.data('autoplay') === true || $slider.data('autoplay') === 'true') {
                        self.startAutoplay($slider);
                    }
                }
            });
        },

        /**
         * Initialize info button for coverflow
         */
        initInfoButton: function($slider) {
            var self = this;

            // Toggle info overlay on info button click
            $slider.on('click', '.tpf-info-btn', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var $slide = $(this).closest('.tpf-slide');
                var isActive = $slide.hasClass('tpf-info-active');

                $slide.toggleClass('tpf-info-active');
                $(this).toggleClass('active');

                // Pause autoplay when info is shown, resume when hidden
                if (!isActive) {
                    self.stopAutoplay($slider);
                } else if ($slider.data('autoplay') === true || $slider.data('autoplay') === 'true') {
                    self.startAutoplay($slider);
                }
            });
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        // Small delay to ensure DOM is fully ready
        setTimeout(function() {
            if (window.innerWidth <= 768) {
                // On mobile: change 3D transitions to slide and trigger base slider
                $('.tpf-slider[data-transition="coverflow"], .tpf-slider[data-transition="flip"], .tpf-slider[data-transition="cube"]').each(function() {
                    $(this).attr('data-transition', 'slide');
                    // Trigger base slider to initialize this slider
                    $(document).trigger('tpf-slider-init');
                });
            } else {
                // On desktop: use full 3D coverflow
                TPFSliderPro.init();
            }
        }, 100);
    });

    // Re-initialize when new sliders are dynamically loaded
    $(document).on('tpf-slider-init', function() {
        $('.tpf-slider[data-transition="coverflow"]').each(function() {
            if (!$(this).data('tpf-pro-initialized')) {
                TPFSliderPro.initCoverflow($(this));
            }
        });
    });

})(jQuery);
