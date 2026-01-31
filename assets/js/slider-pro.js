/**
 * TPF Slider Pro - Frontend JavaScript
 * 3D Effects and Pro Features
 */

(function($) {
    'use strict';

    // Extend TPF Slider with Pro features
    $(document).ready(function() {
        // Apply coverflow effect to carousel sliders
        $('.tpf-slider[data-transition="coverflow"]').each(function() {
            initCoverflow($(this));
        });
    });

    /**
     * Initialize coverflow effect
     */
    function initCoverflow($slider) {
        var $slides = $slider.find('.tpf-slide:not(.tpf-clone)');
        var slideCount = $slides.length;

        // Update coverflow classes on slide change
        updateCoverflowClasses($slider);

        // Watch for changes (using MutationObserver)
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    updateCoverflowClasses($slider);
                }
            });
        });

        var wrapper = $slider.find('.tpf-slider-wrapper')[0];
        if (wrapper) {
            observer.observe(wrapper, { attributes: true });
        }

        // Also update on arrow clicks
        $slider.find('.tpf-arrow').on('click', function() {
            setTimeout(function() {
                updateCoverflowClasses($slider);
            }, 50);
        });

        // Update on dot clicks
        $slider.find('.tpf-dot').on('click', function() {
            setTimeout(function() {
                updateCoverflowClasses($slider);
            }, 50);
        });
    }

    /**
     * Update coverflow classes based on current position
     */
    function updateCoverflowClasses($slider) {
        var $wrapper = $slider.find('.tpf-slider-wrapper');
        var $slides = $slider.find('.tpf-slide');
        var slidesToShow = parseInt($slider.data('slides-to-show'), 10) || 3;

        // Get current transform to determine position
        var transform = $wrapper.css('transform');
        var matrix = transform.match(/matrix.*\((.+)\)/);
        var translateX = 0;

        if (matrix) {
            var values = matrix[1].split(', ');
            translateX = Math.abs(parseFloat(values[4]) || 0);
        }

        // Calculate slide width
        var sliderWidth = $slider.width();
        var gap = parseInt($slider.data('slide-gap'), 10) || 20;
        var totalGaps = (slidesToShow - 1) * gap;
        var slideWidth = (sliderWidth - totalGaps) / slidesToShow;

        // Calculate current index
        var currentIndex = Math.round(translateX / (slideWidth + gap));
        var centerIndex = currentIndex + Math.floor(slidesToShow / 2);

        // Remove all coverflow classes
        $slides.removeClass('tpf-coverflow-active tpf-coverflow-left tpf-coverflow-right');

        // Apply classes based on position relative to center
        $slides.each(function(index) {
            var $slide = $(this);
            var relativePos = index - centerIndex;

            if (relativePos === 0) {
                $slide.addClass('tpf-coverflow-active');
            } else if (relativePos < 0) {
                $slide.addClass('tpf-coverflow-left');
            } else {
                $slide.addClass('tpf-coverflow-right');
            }
        });
    }

    // Re-initialize when new sliders are loaded
    $(document).on('tpf-slider-init', function() {
        $('.tpf-slider[data-transition="coverflow"]').each(function() {
            if (!$(this).data('tpf-pro-initialized')) {
                initCoverflow($(this));
                $(this).data('tpf-pro-initialized', true);
            }
        });
    });

})(jQuery);
