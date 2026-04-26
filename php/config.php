<?php
/**
 * Sahliya — config.php
 * Centralized configuration for email sending.
 * ⚠️  Do NOT commit this file with real credentials to a public repository.
 *     Add php/config.php to your .gitignore.
 */

// ── Recipient ────────────────────────────────────────────────────────────────
define('MAIL_TO',      'contact@sahliya.app');        // Where form submissions land
define('MAIL_TO_NAME', 'Sahliya');

// ── Sender (the "From" address) ──────────────────────────────────────────────
// Must match a domain authorized on your mail server / SPF record.
define('MAIL_FROM',      'noreply@sahliya.app');
define('MAIL_FROM_NAME', 'Sahliya — Formulaire');

// ── Reply-To ─────────────────────────────────────────────────────────────────
// Set dynamically to the form submitter's email (see send-demo.php / send-contact.php)

// ── Site info ────────────────────────────────────────────────────────────────
define('SITE_NAME', 'Sahliya');
define('SITE_URL',  'https://sahliya.app');

// ── Redirect after success ───────────────────────────────────────────────────
define('REDIRECT_SUCCESS', SITE_URL . '/merci.html');
define('REDIRECT_ERROR',   SITE_URL . '/contact.html?error=1');

// ── Rate limiting (simple file-based) ────────────────────────────────────────
// How many submissions are allowed per IP per RATE_WINDOW seconds
define('RATE_LIMIT',  5);
define('RATE_WINDOW', 3600); // 1 hour

// ── CSRF ─────────────────────────────────────────────────────────────────────
// Minimum token length accepted (client generates 48-char hex string)
define('CSRF_MIN_LENGTH', 32);

// ── Anti-spam ────────────────────────────────────────────────────────────────
// Honeypot field name — must match HTML input name="honeypot"
define('HONEYPOT_FIELD', 'honeypot');

// ── Environment ──────────────────────────────────────────────────────────────
// Set to true on production to suppress detailed error messages
define('PRODUCTION', true);

// ── Optional SMTP (if using PHPMailer) ───────────────────────────────────────
// Uncomment and configure if your host doesn't support PHP mail() reliably.
/*
define('SMTP_HOST',     'smtp.example.com');
define('SMTP_PORT',     587);
define('SMTP_SECURE',   'tls');    // 'tls' or 'ssl'
define('SMTP_USER',     'your@email.com');
define('SMTP_PASS',     'your_password');
*/
