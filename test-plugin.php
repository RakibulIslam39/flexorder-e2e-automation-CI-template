<?php
/**
 * Test Plugin File
 * 
 * This is a simple test file to verify PHPCS functionality.
 * It follows WordPress coding standards.
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Test function
 *
 * @param string $param Test parameter.
 * @return string
 */
function test_function( $param ) {
	return sanitize_text_field( $param );
}

/**
 * Test class
 */
class Test_Class {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Initialize
	}
}
