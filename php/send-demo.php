<?php
/**
 * EduPilot — send-demo.php
 * Handles the demo request form submission.
 * Validates · Sanitizes · Rate-limits · Sends email · Redirects
 */

declare(strict_types=1);
session_start();

require_once __DIR__ . '/config.php';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

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

function ep_is_phone(string $phone): bool
{
    return (bool) preg_match('/^\+?[\d\s\-(). ]{7,20}$/', $phone);
}

function ep_rate_limit(string $ip): bool
{
    $file = sys_get_temp_dir() . '/ep_rl_' . md5($ip) . '.json';
    $now  = time();
    $data = [];

    if (file_exists($file)) {
        $raw = file_get_contents($file);
        $data = $raw ? json_decode($raw, true) : [];
    }

    // Purge old entries
    $data = array_filter($data, fn($ts) => ($now - $ts) < RATE_WINDOW);

    if (count($data) >= RATE_LIMIT) {
        return false; // limit exceeded
    }

    $data[] = $now;
    file_put_contents($file, json_encode(array_values($data)), LOCK_EX);
    return true;
}

/* ─── Gate: POST only ────────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . SITE_URL . '/demo.html');
    exit;
}

/* ─── Honeypot ───────────────────────────────────────────────────────────── */
if (!empty($_POST[HONEYPOT_FIELD])) {
    // Silently redirect — bot filled the hidden field
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
if (!ep_rate_limit($ip)) {
    ep_abort('Trop de soumissions. Réessayez dans une heure.');
}

/* ─── Collect & validate ─────────────────────────────────────────────────── */
$errors = [];

$prenom           = ep_sanitize($_POST['prenom']           ?? '');
$nom              = ep_sanitize($_POST['nom']              ?? '');
$email            = ep_sanitize($_POST['email']            ?? '');
$tel              = ep_sanitize($_POST['tel']              ?? '');
$etablissement    = ep_sanitize($_POST['etablissement']    ?? '');
$pays             = ep_sanitize($_POST['pays']             ?? '');
$ville            = ep_sanitize($_POST['ville']            ?? '');
$nb_eleves        = ep_sanitize($_POST['nb_eleves']        ?? '');
$role             = ep_sanitize($_POST['role']             ?? '');
$logiciel_actuel  = ep_sanitize($_POST['logiciel_actuel'] ?? '');
$message          = ep_sanitize($_POST['message']          ?? '', 2000);

if (strlen($prenom) < 2)          $errors[] = 'Prénom invalide.';
if (strlen($nom) < 2)             $errors[] = 'Nom invalide.';
if (!ep_is_email($email))         $errors[] = 'Email invalide.';
if (!ep_is_phone($tel))           $errors[] = 'Téléphone invalide.';
if (strlen($etablissement) < 2)   $errors[] = 'Nom d\'établissement invalide.';
if (empty($pays))                 $errors[] = 'Pays requis.';
if (strlen($ville) < 2)          $errors[] = 'Ville invalide.';
if (empty($nb_eleves))            $errors[] = 'Nombre d\'élèves requis.';
if (empty($role))                 $errors[] = 'Rôle requis.';
if (empty($_POST['rgpd']))        $errors[] = 'Consentement RGPD requis.';

if (!empty($errors)) {
    ep_abort(implode(' | ', $errors));
}

/* ─── Build email ────────────────────────────────────────────────────────── */
$subject = "[EduPilot] Nouvelle demande de démo — {$prenom} {$nom} ({$etablissement})";

$body  = "=== DEMANDE DE DÉMO EDUPILOT ===\n\n";
$body .= "Date       : " . date('d/m/Y H:i') . "\n";
$body .= "IP         : {$ip}\n\n";
$body .= "--- Contact ---\n";
$body .= "Prénom     : {$prenom}\n";
$body .= "Nom        : {$nom}\n";
$body .= "Email      : {$email}\n";
$body .= "Téléphone  : {$tel}\n\n";
$body .= "--- Établissement ---\n";
$body .= "Nom        : {$etablissement}\n";
$body .= "Pays       : {$pays}\n";
$body .= "Ville      : {$ville}\n";
$body .= "Nb élèves  : {$nb_eleves}\n";
$body .= "Rôle       : {$role}\n";
$body .= "Logiciel   : " . ($logiciel_actuel ?: 'Non renseigné') . "\n\n";
$body .= "--- Message ---\n";
$body .= ($message ?: 'Aucun message') . "\n\n";
$body .= "===================================\n";
$body .= "Ne pas répondre à cet email directement.\n";
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
    ep_abort('Échec de l\'envoi email (mail() a retourné false). Vérifiez la config SMTP du serveur.');
}

// Send confirmation to submitter
$confirmSubject = "Votre demande de démo EduPilot a bien été reçue";
$confirmBody    = "Bonjour {$prenom},\n\n";
$confirmBody   .= "Merci de votre intérêt pour EduPilot !\n\n";
$confirmBody   .= "Nous avons bien reçu votre demande de démo pour {$etablissement}.\n";
$confirmBody   .= "Un membre de notre équipe vous contactera sous 24 heures ouvrées.\n\n";
$confirmBody   .= "Pour toute question urgente, écrivez-nous sur WhatsApp : +33 7 44 81 07 84\n\n";
$confirmBody   .= "À très bientôt,\nL'équipe EduPilot\n" . SITE_URL . "\n";

$confirmHeaders  = "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
$confirmHeaders .= "MIME-Version: 1.0\r\n";
$confirmHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

@mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

/* ─── Redirect ───────────────────────────────────────────────────────────── */
header('Location: ' . REDIRECT_SUCCESS);
exit;
