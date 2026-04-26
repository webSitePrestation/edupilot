<?php
/**
 * EduPilot — send-contact.php
 * Handles the general contact form submission.
 */

declare(strict_types=1);
session_start();

require_once __DIR__ . '/config.php';

/* ─── Helpers (same as send-demo.php) ───────────────────────────────────── */

function ep_abort(string $reason): void
{
    if (defined('PRODUCTION') && PRODUCTION) {
        header('Location: ' . REDIRECT_ERROR);
    } else {
        http_response_code(400);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Erreur : ' . $reason;
    }
    exit;
}

function ep_sanitize(string $value, int $maxLen = 255): string
{
    $value = strip_tags(trim($value));
    $value = htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    return mb_substr($value, 0, $maxLen);
}

function ep_is_email(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function ep_rate_limit(string $ip, string $prefix = 'ep_rl'): bool
{
    $file = sys_get_temp_dir() . "/{$prefix}_" . md5($ip) . '.json';
    $now  = time();
    $data = [];

    if (file_exists($file)) {
        $raw = file_get_contents($file);
        $data = $raw ? json_decode($raw, true) : [];
    }

    $data = array_filter($data, fn($ts) => ($now - $ts) < RATE_WINDOW);

    if (count($data) >= RATE_LIMIT) {
        return false;
    }

    $data[] = $now;
    file_put_contents($file, json_encode(array_values($data)), LOCK_EX);
    return true;
}

/* ─── Gate: POST only ────────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . SITE_URL . '/contact.html');
    exit;
}

/* ─── Honeypot ───────────────────────────────────────────────────────────── */
if (!empty($_POST[HONEYPOT_FIELD])) {
    header('Location: ' . REDIRECT_SUCCESS);
    exit;
}

/* ─── CSRF ───────────────────────────────────────────────────────────────── */
$submittedToken = $_POST['csrf_token'] ?? '';
if (strlen($submittedToken) < CSRF_MIN_LENGTH) {
    ep_abort('Token CSRF manquant ou invalide.');
}

/* ─── Rate limiting ──────────────────────────────────────────────────────── */
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!ep_rate_limit($ip, 'ep_ct')) {
    ep_abort('Trop de soumissions. Réessayez dans une heure.');
}

/* ─── Collect & validate ─────────────────────────────────────────────────── */
$errors = [];

$prenom  = ep_sanitize($_POST['prenom']  ?? '');
$nom     = ep_sanitize($_POST['nom']     ?? '');
$email   = ep_sanitize($_POST['email']   ?? '');
$sujet   = ep_sanitize($_POST['sujet']   ?? '');
$message = ep_sanitize($_POST['message'] ?? '', 3000);

$allowed_sujets = ['demo', 'tarifs', 'technique', 'partenariat', 'presse', 'autre'];

if (strlen($prenom) < 2)                   $errors[] = 'Prénom invalide.';
if (strlen($nom) < 2)                      $errors[] = 'Nom invalide.';
if (!ep_is_email($email))                  $errors[] = 'Email invalide.';
if (!in_array($sujet, $allowed_sujets))    $errors[] = 'Sujet invalide.';
if (strlen($message) < 10)                 $errors[] = 'Message trop court.';
if (empty($_POST['rgpd']))                 $errors[] = 'Consentement RGPD requis.';

if (!empty($errors)) {
    ep_abort(implode(' | ', $errors));
}

/* ─── Build email ────────────────────────────────────────────────────────── */
$sujetLabels = [
    'demo'         => 'Demande de démo',
    'tarifs'       => 'Renseignements tarifs',
    'technique'    => 'Support technique',
    'partenariat'  => 'Partenariat',
    'presse'       => 'Presse / Média',
    'autre'        => 'Autre',
];

$sujetLabel = $sujetLabels[$sujet] ?? $sujet;
$subject = "[EduPilot] {$sujetLabel} — {$prenom} {$nom}";

$body  = "=== MESSAGE CONTACT EDUPILOT ===\n\n";
$body .= "Date    : " . date('d/m/Y H:i') . "\n";
$body .= "IP      : {$ip}\n\n";
$body .= "--- Expéditeur ---\n";
$body .= "Prénom  : {$prenom}\n";
$body .= "Nom     : {$nom}\n";
$body .= "Email   : {$email}\n";
$body .= "Sujet   : {$sujetLabel}\n\n";
$body .= "--- Message ---\n";
$body .= $message . "\n\n";
$body .= "================================\n";
$body .= "Répondre à : {$email}\n";

$headers  = "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
$headers .= "Reply-To: {$prenom} {$nom} <{$email}>\r\n";
$headers .= "X-Mailer: EduPilot-PHP/1.0\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

/* ─── Send ───────────────────────────────────────────────────────────────── */
$sent = mail(MAIL_TO, $subject, $body, $headers);

if (!$sent && !(defined('PRODUCTION') && PRODUCTION)) {
    ep_abort('Échec de l\'envoi email. Vérifiez la config SMTP du serveur.');
}

// Confirmation to sender
$confirmSubject = "Votre message à EduPilot a bien été reçu";
$confirmBody    = "Bonjour {$prenom},\n\n";
$confirmBody   .= "Merci de nous avoir contacté !\n\n";
$confirmBody   .= "Nous avons bien reçu votre message (sujet : {$sujetLabel}).\n";
$confirmBody   .= "Vous recevrez une réponse sous 24 heures ouvrées.\n\n";
$confirmBody   .= "Pour toute urgence : contact@edupilot.app | WhatsApp +33 7 44 81 07 84\n\n";
$confirmBody   .= "Cordialement,\nL'équipe EduPilot\n" . SITE_URL . "\n";

$confirmHeaders  = "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
$confirmHeaders .= "MIME-Version: 1.0\r\n";
$confirmHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

@mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

/* ─── Redirect ───────────────────────────────────────────────────────────── */
header('Location: ' . REDIRECT_SUCCESS);
exit;
