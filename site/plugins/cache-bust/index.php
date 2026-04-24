<?php

Kirby::plugin('local/cache-bust', []);

function assetUrl(string $path): string
{
    $full = kirby()->root('index') . '/' . ltrim($path, '/');
    $url  = url($path);

    if (file_exists($full)) {
        return $url . '?v=' . filemtime($full);
    }

    return $url;
}
