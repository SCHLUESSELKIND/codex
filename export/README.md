# Export

Diese Dateien sind mit `npm run export` erzeugt und werden bei jedem Lauf überschrieben.
Sie liegen im Repo, damit das System ohne Installation beurteilt werden kann.

## Sofort verwendbar

- `bop-banner-2560x1440.png` · Kanalbanner
- `bop-avatar-800x800.png` · Profilbild
- `bop-endscreen-1920x1080.png` · Endscreen
- `bop-social-*.png` · 15 Social-Vorlagen
- `bop-card-*.png` · die sechs Vollbild-Sendekarten

## Noch nicht hochladefertig

- `bop-thumb-*.png` · die fünf Thumbnail-Sorten zeigen aktuell den **Portrait-Platzhalter**.
  Sobald `public/portraits/tom-thumb.png` vorliegt, `npm run export -- --only=thumbs`
  erneut laufen lassen. Vorher nicht auf YouTube verwenden.

Benennung und Zielorte: `../docs/EXPORT_GUIDE.md`.
