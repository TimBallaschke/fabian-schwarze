<?php

return [
    'debug' => true,

    'api' => [
        'maxSize' => '2000M'
    ],

    'uploads' => [
        'maxSize' => '2000M'
    ],

    'routes' => [
        [
            'pattern' => '(:all)',
            'action'  => function (string $path = '') {
                $kirby = kirby();

                if (preg_match('#^(panel|api|media)(/|$)#', $path)) {
                    return $this->next();
                }

                if ($kirby->user()) {
                    return $this->next();
                }

                if ($kirby->site()->live()->toBool() === false) {
                    return snippet('wip', [], true);
                }

                return $this->next();
            }
        ]
    ]
];
