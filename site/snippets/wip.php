<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fabian Schwarze</title>
    <link rel="icon" type="image/svg+xml" href="<?= assetUrl('assets/svg/favicon-01.svg') ?>">
    <link rel="stylesheet" href="<?= assetUrl('assets/style/style.css') ?>">
    <style>
        body {
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            padding: var(--page-padding);
            margin: 0;
        }
        .wip {
            text-align: center;
            line-height: var(--line-height);
        }
        .wip h1 {
            font-size: var(--font-size);
            font-weight: normal;
            margin: 0 0 1.5rem 0;
        }
        .wip p {
            margin: 0 0 1.5rem 0;
        }
        .wip a {
            color: inherit;
            text-decoration: underline;
        }
        .wip .links a {
            margin: 0 0.5rem;
        }
        .wip footer {
            margin-top: 3rem;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
    <main class="wip">
        <h1>Fabian Schwarze – Photographer</h1>
        <p>Ich erzähle von den Eigenarten am Leben zu sein.</p>
        <p>Work in Progress… find me here:</p>
        <p class="links">
            <a href="https://instagram.com/fschwrze" target="_blank" rel="noopener">@fschwrze</a>
            <a href="mailto:mail@fabianschwarze.com">mail@fabianschwarze.com</a>
        </p>
        <footer>© <?= date('Y') ?></footer>
    </main>
</body>
</html>
