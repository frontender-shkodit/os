# Оценка разработчика тимлидом

React + TypeScript + Vite.

## Локальная сборка

```bash
npm install
npm run build
```

## GitHub Pages

1. Загрузите содержимое папки в корень репозитория.
2. Ветка должна называться `main`.
3. GitHub → Settings → Pages → Source → `GitHub Actions`.
4. Workflow сам установит зависимости, выполнит build и опубликует `dist`.

В `vite.config.ts` используется `base: './'`, поэтому проект можно размещать в GitHub Pages независимо от имени репозитория.
