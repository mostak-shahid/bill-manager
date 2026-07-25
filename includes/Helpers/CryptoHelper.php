<?php
namespace MosPress\BillManager\Helpers;

class CryptoHelper {
/**
     * Encryption method to use.
     *
     * @var string
     */
    private static $cipher_method = 'aes-256-cbc';

    /**
     * Get the encryption key.
     *
     * Uses WordPress security salts for added security.
     *
     * @return string The encryption key.
     */
    private static function get_encryption_key() {
        // Use WordPress security constants for the encryption key
        $key = defined( 'AUTH_KEY' ) ? AUTH_KEY : 'default-insecure-key';
        
        // Hash the key to ensure it's the right length for AES-256
        return hash( 'sha256', $key, true );
    }

    /**
     * Encrypt a string.
     *
     * @param string $data The data to encrypt.
     * @return string|false The encrypted string (base64 encoded) or false on failure.
     */
    public static function encrypt( $data ) {
        if ( empty( $data ) ) {
            return false;
        }

        try {
            // Generate a random initialization vector
            $iv_length = openssl_cipher_iv_length( self::$cipher_method );
            $iv = openssl_random_pseudo_bytes( $iv_length );

            // Encrypt the data
            $encrypted = openssl_encrypt(
                $data,
                self::$cipher_method,
                self::get_encryption_key(),
                OPENSSL_RAW_DATA,
                $iv
            );

            if ( false === $encrypted ) {
                return false;
            }

            // Combine IV and encrypted data, then base64 encode
            $result = base64_encode( $iv . $encrypted );

            return $result;

        } catch ( \Exception $e ) {
            // Log error if WP_DEBUG is enabled
            // if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            //     error_log( 'Encryption error: ' . $e->getMessage() );
            // }
            return false;
        }
    }

    /**
     * Decrypt a string.
     *
     * @param string $encrypted_data The encrypted data (base64 encoded).
     * @return string|false The decrypted string or false on failure.
     */
    public static function decrypt( $encrypted_data ) {
        if ( empty( $encrypted_data ) ) {
            return false;
        }

        try {
            // Decode the base64 encoded string
            $decoded = base64_decode( $encrypted_data, true );
            
            if ( false === $decoded ) {
                return false;
            }

            // Extract IV and encrypted data
            $iv_length = openssl_cipher_iv_length( self::$cipher_method );
            $iv = substr( $decoded, 0, $iv_length );
            $encrypted = substr( $decoded, $iv_length );

            // Decrypt the data
            $decrypted = openssl_decrypt(
                $encrypted,
                self::$cipher_method,
                self::get_encryption_key(),
                OPENSSL_RAW_DATA,
                $iv
            );

            if ( false === $decrypted ) {
                return false;
            }

            return $decrypted;

        } catch ( \Exception $e ) {
            // Log error if WP_DEBUG is enabled
            // if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            //     error_log( 'Decryption error: ' . $e->getMessage() );
            // }
            return false;
        }
    }

    /**
     * Generate a secure random string.
     *
     * @param int $length The length of the random string.
     * @return string The random string.
     */
    public static function generate_random_string( $length = 8 ) {
        return wp_generate_password( $length, false, false );
    }

    /**
     * Verify if encryption is available.
     *
     * @return bool True if OpenSSL is available, false otherwise.
     */
    public static function is_encryption_available() {
        return function_exists( 'openssl_encrypt' ) && 
               function_exists( 'openssl_decrypt' ) &&
               in_array( self::$cipher_method, openssl_get_cipher_methods(), true );
    }
}