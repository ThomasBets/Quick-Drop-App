get_access_token.php
<?php
require 'vendor/autoload.php';

use Google\Auth\Credentials\ServiceAccountCredentials;

$scopes = ['https://www.googleapis.com/auth/datastore']; // Firestore scope

$serviceAccountPath = __DIR__ . '/firebase-service-account.json';

$creds = new ServiceAccountCredentials($scopes, $serviceAccountPath);

$token = $creds->fetchAuthToken();

echo $token['access_token'];
