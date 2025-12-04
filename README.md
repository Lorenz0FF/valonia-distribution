# 📦 Valonia Distribution

Système de distribution de mods pour le Valonia Launcher.

## 🚀 Comment ça marche ?

1. **Placez vos mods** dans le dossier `mods/`
2. **Placez vos configs** dans le dossier `configs/`
3. **Placez vos resource packs** dans le dossier `resourcepacks/`
4. **Générez la distribution** : `npm run generate`
5. **Déployez** sur GitHub/votre serveur

## 📁 Structure

```
distribution/
├── distribution.json     # Fichier généré automatiquement
├── mods/                 # Vos fichiers .jar
├── configs/              # Vos fichiers de config
├── resourcepacks/        # Vos resource packs .zip
├── schema/               # Schéma JSON
└── scripts/              # Scripts de génération
```

## ⚙️ Configuration

Modifiez les variables dans `scripts/generate-distribution.js` :

```javascript
const CONFIG = {
  baseUrl: 'https://raw.githubusercontent.com/Lorenz0FF/valonia-distribution/main',
  server: {
    name: 'Nom du serveur',
    ip: 'play.serveur.fr',
    // ...
  },
  minecraft: {
    version: '1.20.1'
  },
  forge: {
    version: '47.3.0'
  }
}
```

## 🔄 Workflow de mise à jour

1. Ajoutez/mettez à jour vos mods dans `mods/`
2. Commit et push sur GitHub
3. Le launcher téléchargera automatiquement les mises à jour

## 📋 Format distribution.json

```json
{
  "version": "1.0.0",
  "minecraft": { "version": "1.20.1" },
  "forge": { "version": "47.3.0" },
  "files": {
    "mods": [
      {
        "name": "JEI",
        "fileName": "jei-1.20.1-15.3.0.4.jar",
        "url": "https://.../mods/jei-1.20.1-15.3.0.4.jar",
        "md5": "abc123...",
        "size": 1234567,
        "required": true
      }
    ]
  }
}
```

## 🎮 Mods recommandés pour 1.20.1 Forge

- **JEI** - Just Enough Items
- **JourneyMap** - Minimap
- **Rubidium** - Performance (alternative Optifine)
- **Embeddium** - Performance
- **Oculus** - Shaders

---

🎮 **Valonia** - L'aventure Minecraft ultime !
