<?php
/**
 * TPF Slider Pro - Main Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class TPF_Slider_Pro {

    /**
     * Single instance
     */
    private static $instance = null;

    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Remove slider limit
        add_filter('tpf_slider_max_sliders', array($this, 'unlimited_sliders'));

        // Add pro settings to admin
        add_action('tpf_slider_settings_fields', array($this, 'add_pro_settings'), 10, 2);

        // Save pro settings
        add_filter('tpf_slider_save_settings', array($this, 'save_pro_settings'), 10, 2);

        // Add pro settings defaults
        add_filter('tpf_slider_settings_defaults', array($this, 'add_pro_defaults'));

        // Add pro transitions
        add_filter('tpf_slider_transitions', array($this, 'add_pro_transitions'));

        // Enqueue pro assets
        add_action('wp_enqueue_scripts', array($this, 'enqueue_pro_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));

        // Add pro CSS variables to slider output
        add_filter('tpf_slider_inline_styles', array($this, 'add_pro_styles'), 10, 3);

        // Add pro indicator to admin
        add_action('admin_notices', array($this, 'pro_active_notice'));
    }

    /**
     * Remove slider limit - return unlimited
     */
    public function unlimited_sliders($limit) {
        return PHP_INT_MAX;
    }

    /**
     * Add pro settings defaults
     */
    public function add_pro_defaults($defaults) {
        $defaults['title_color'] = '#ffffff';
        $defaults['subtitle_color'] = '#ffffff';
        $defaults['button_bg_color'] = '#ffffff';
        $defaults['button_text_color'] = '#333333';
        return $defaults;
    }

    /**
     * Add pro transitions
     */
    public function add_pro_transitions($transitions) {
        $transitions['coverflow'] = '3D Coverflow';
        $transitions['flip'] = '3D Flip';
        $transitions['cube'] = '3D Cube';
        return $transitions;
    }

    /**
     * Add pro settings fields to admin
     */
    public function add_pro_settings($settings, $slider_id) {
        ?>
        <tr>
            <th colspan="2" style="padding-top: 20px; border-top: 1px solid #f0f0f1;">
                <span class="dashicons dashicons-star-filled" style="color: #f0b849;"></span>
                Pro Settings
            </th>
        </tr>
        <tr>
            <th>Title Color</th>
            <td>
                <input type="color" name="title_color" value="<?php echo esc_attr($settings['title_color']); ?>">
            </td>
        </tr>
        <tr>
            <th>Subtitle Color</th>
            <td>
                <input type="color" name="subtitle_color" value="<?php echo esc_attr($settings['subtitle_color']); ?>">
            </td>
        </tr>
        <tr>
            <th>Button Background</th>
            <td>
                <input type="color" name="button_bg_color" value="<?php echo esc_attr($settings['button_bg_color']); ?>">
            </td>
        </tr>
        <tr>
            <th>Button Text Color</th>
            <td>
                <input type="color" name="button_text_color" value="<?php echo esc_attr($settings['button_text_color']); ?>">
            </td>
        </tr>
        <?php
    }

    /**
     * Save pro settings
     */
    public function save_pro_settings($settings, $post_data) {
        $settings['title_color'] = isset($post_data['title_color']) ? sanitize_hex_color($post_data['title_color']) : '#ffffff';
        $settings['subtitle_color'] = isset($post_data['subtitle_color']) ? sanitize_hex_color($post_data['subtitle_color']) : '#ffffff';
        $settings['button_bg_color'] = isset($post_data['button_bg_color']) ? sanitize_hex_color($post_data['button_bg_color']) : '#ffffff';
        $settings['button_text_color'] = isset($post_data['button_text_color']) ? sanitize_hex_color($post_data['button_text_color']) : '#333333';
        return $settings;
    }

    /**
     * Add pro inline styles to slider
     */
    public function add_pro_styles($styles, $settings, $unique_id) {
        $pro_styles = "
            #{$unique_id} .tpf-slide-title {
                color: {$settings['title_color']} !important;
            }
            #{$unique_id} .tpf-slide-subtitle {
                color: {$settings['subtitle_color']} !important;
            }
            #{$unique_id} .tpf-slide-button {
                background: {$settings['button_bg_color']} !important;
                color: {$settings['button_text_color']} !important;
            }
        ";
        return $styles . $pro_styles;
    }

    /**
     * Enqueue pro frontend assets
     */
    public function enqueue_pro_assets() {
        wp_enqueue_style(
            'tpf-slider-pro',
            TPF_SLIDER_PRO_PLUGIN_URL . 'assets/css/slider-pro.css',
            array('tpf-slider'),
            TPF_SLIDER_PRO_VERSION
        );

        wp_enqueue_script(
            'tpf-slider-pro',
            TPF_SLIDER_PRO_PLUGIN_URL . 'assets/js/slider-pro.js',
            array('tpf-slider'),
            TPF_SLIDER_PRO_VERSION,
            true
        );
    }

    /**
     * Enqueue pro admin assets
     */
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'tpf-slider') === false) {
            return;
        }

        wp_enqueue_style(
            'tpf-slider-pro-admin',
            TPF_SLIDER_PRO_PLUGIN_URL . 'assets/css/admin-pro.css',
            array('tpf-slider-admin'),
            TPF_SLIDER_PRO_VERSION
        );
    }

    /**
     * Show pro active notice (once)
     */
    public function pro_active_notice() {
        $screen = get_current_screen();
        if (strpos($screen->id, 'tpf-slider') === false) {
            return;
        }

        if (get_transient('tpf_slider_pro_activated')) {
            return;
        }

        // Only show once per session
        if (!get_option('tpf_slider_pro_notice_shown')) {
            update_option('tpf_slider_pro_notice_shown', true);
            ?>
            <div class="notice notice-success is-dismissible">
                <p><span class="dashicons dashicons-star-filled" style="color: #f0b849;"></span> <strong>TPF Slider Pro</strong> is active! You now have unlimited sliders, 3D effects, and color customization options.</p>
            </div>
            <?php
        }
    }
}
