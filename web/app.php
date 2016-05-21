<?php

use Symfony\Component\HttpFoundation\Request;

$isDev = true;
/**
 * @var Composer\Autoload\ClassLoader
 */
$loader = require __DIR__.'/../app/autoload.php';
if (!$isDev) {
    include_once __DIR__.'/../var/bootstrap.php.cache';
}

if ($isDev) {
    \Symfony\Component\Debug\Debug::enable();
}

$kernel = new AppKernel($isDev ? 'dev' : 'prod', $isDev);
$kernel->loadClassCache();
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
