<?php
/**
 * Plugin Name: TPF Slider Pro
 * Plugin URI: https://thepluginfactory.com/tpf-slider-pro/
 * Description: Pro add-on for TPF Starter Slider. Adds unlimited sliders, 3D coverflow effect, advanced transitions, and text color options.
 * Version: 1.3.7
 * Author: The Plugin Factory
 * Author URI: https://thepluginfactory.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: tpf-slider-pro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('TPF_SLIDER_PRO_VERSION', '1.3.7');
define('TPF_SLIDER_PRO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('TPF_SLIDER_PRO_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Check if free version is active
 */
function tpf_slider_pro_check_dependency() {
    if (!defined('TPF_SLIDER_VERSION')) {
        add_action('admin_notices', 'tpf_slider_pro_dependency_notice');
        return false;
    }
    return true;
}

/**
 * Show dependency notice
 */
function tpf_slider_pro_dependency_notice() {
    ?>
    <div class="notice notice-error">
        <p><strong>TPF Slider Pro</strong> requires <strong>TPF Starter Slider</strong> to be installed and activated. Please install the free version first.</p>
    </div>
    <?php
}

/**
 * Initialize Pro features
 */
function tpf_slider_pro_init() {
    if (!tpf_slider_pro_check_dependency()) {
        return;
    }

    // Load Pro class
    require_once TPF_SLIDER_PRO_PLUGIN_DIR . 'includes/class-tpf-slider-pro.php';

    // Initialize
    TPF_Slider_Pro::get_instance();
}
add_action('plugins_loaded', 'tpf_slider_pro_init', 20);
