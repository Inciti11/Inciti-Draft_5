<?php
/**
 * Plugin Name: ALRÍO HTML Landing
 * Description: Muestra la landing HTML/CSS del repo en una página de WordPress que elijas. El resto del sitio (contador Elementor, etc.) usa el tema normal.
 * Version: 1.0.0
 * Author: Inciti
 * Requires PHP: 7.4
 * Text Domain: alrio-html-page
 */

defined( 'ABSPATH' ) || exit;

define( 'ALRIO_HTML_PAGE_VERSION', '1.0.0' );
define( 'ALRIO_HTML_PAGE_FILE', __FILE__ );
define( 'ALRIO_HTML_PAGE_DIR', plugin_dir_path( __FILE__ ) );
define( 'ALRIO_HTML_PAGE_URL', plugin_dir_url( __FILE__ ) );

/**
 * Página de ajustes: elige qué página WP muestra el HTML.
 */
function alrio_html_page_admin_menu() {
	add_options_page(
		'ALRÍO HTML',
		'ALRÍO HTML',
		'manage_options',
		'alrio-html-page',
		'alrio_html_page_settings_render'
	);
}
add_action( 'admin_menu', 'alrio_html_page_admin_menu' );

function alrio_html_page_settings_render() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	if ( isset( $_POST['alrio_html_page_id'] ) && check_admin_referer( 'alrio_html_save' ) ) {
		update_option( 'alrio_html_page_id', (int) $_POST['alrio_html_page_id'] );
		echo '<div class="notice notice-success"><p>Guardado.</p></div>';
	}
	$selected = (int) get_option( 'alrio_html_page_id', 0 );
	$pages    = get_pages( array( 'sort_column' => 'post_title' ) );
	$html_ok  = is_readable( ALRIO_HTML_PAGE_DIR . 'public/landing.html' );
	?>
	<div class="wrap">
		<h1>ALRÍO HTML Landing</h1>
		<?php if ( ! $html_ok ) : ?>
			<div class="notice notice-error"><p>Falta <code>public/landing.html</code> dentro del plugin. Vuelve a empaquetar con <code>python scripts/build_wp_plugin.py</code>.</p></div>
		<?php endif; ?>
		<form method="post">
			<?php wp_nonce_field( 'alrio_html_save' ); ?>
			<table class="form-table">
				<tr>
					<th scope="row"><label for="alrio_html_page_id">Página con la landing HTML</label></th>
					<td>
						<select name="alrio_html_page_id" id="alrio_html_page_id">
							<option value="0">— Elegir —</option>
							<?php foreach ( $pages as $p ) : ?>
								<option value="<?php echo (int) $p->ID; ?>" <?php selected( $selected, $p->ID ); ?>>
									<?php echo esc_html( $p->post_title ); ?> (<?php echo esc_html( $p->post_name ); ?>)
								</option>
							<?php endforeach; ?>
						</select>
						<p class="description">Crea una página vacía (ej. «Web ALRÍO», slug <code>web</code>). No uses Elementor en esa página. El plugin sustituye toda la salida por tu HTML.</p>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Guardar' ); ?>
		</form>
		<p><strong>Contador en la portada:</strong> Ajustes → Lectura → portada = página «alrio» (Elementor). Redirige el countdown a la URL de la página elegida arriba.</p>
	</div>
	<?php
}

/**
 * Sirve landing.html en la página configurada (cualquier tema activo).
 */
function alrio_html_page_maybe_serve() {
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
		return;
	}
	$page_id = (int) get_option( 'alrio_html_page_id', 0 );
	if ( $page_id < 1 || ! is_page( $page_id ) ) {
		return;
	}
	$file = ALRIO_HTML_PAGE_DIR . 'public/landing.html';
	if ( ! is_readable( $file ) ) {
		return;
	}
	$html = file_get_contents( $file );
	if ( $html === false ) {
		return;
	}
	$base = trailingslashit( ALRIO_HTML_PAGE_URL . 'public/' );
	$html = str_replace( '{{ALRIO_ASSET_BASE}}', esc_url( $base ), $html );
	status_header( 200 );
	nocache_headers();
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML estático del proyecto.
	echo $html;
	exit;
}
add_action( 'template_redirect', 'alrio_html_page_maybe_serve', 0 );
