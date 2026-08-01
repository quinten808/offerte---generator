# Offertegenerator

Een responsive offertegenerator voor een klusbedrijf, met lokale klant-, offerte- en bedrijfsgegevens, PDF-downloads en Supabase-authenticatie. Er is nog geen databasekoppeling voor de applicatiegegevens, e-mail- of AI-functionaliteit.

## Supabase-authenticatie

Maak in de hoofdmap een `.env.local`-bestand. Dit bestand wordt niet gecommit; `.env*` staat in `.gitignore`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://uw-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Maak gebruikers handmatig aan via **Supabase Dashboard → Authentication → Users → Add user** en kies een e-mailadres en wachtwoord. De applicatie heeft bewust nog geen registratie- of wachtwoordresetpagina.

## Installatie

Gebruik Node.js en npm. Installeer de projectafhankelijkheden vanuit de hoofdmap:

```bash
npm install
```

## Ontwikkelen

Start de ontwikkelserver en open daarna [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

Controleer de codekwaliteit:

```bash
npm run lint
```

Maak een productiebuild:

```bash
npm run build
```
