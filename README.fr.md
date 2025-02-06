# BunCLI-Kit 🚀

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)

Un kit de développement CLI TypeScript puissant et moderne propulsé par Bun, conçu pour vous aider à créer des applications en ligne de commande robustes avec facilité. Cette boîte à outils fournit une manière propre et structurée de créer des commandes CLI en utilisant TypeScript, Zod pour la validation, et Bun pour une exécution rapide. Elle intègre également un système complet pour interagir avec des modèles d'IA en local via Ollama, permettant d'enrichir vos commandes CLI avec des capacités d'intelligence artificielle de manière simple et efficace.

## 🌟 Fonctionnalités

- **TypeScript First**: Construit avec TypeScript pour une sécurité de type maximale et une expérience développeur optimale
- **Propulsé par Bun**: Exploite la vitesse et les fonctionnalités modernes de Bun
- **Architecture Propre**: Implémente l'architecture hexagonale avec les principes du domain-driven design
- **Validation des Données**: Validation des schémas Zod intégrée pour une gestion robuste des commandes
- **Expérience Développeur**: Inclut la configuration ESLint et Prettier prête à l'emploi
- **Sécurité des Types**: Configuration TypeScript stricte pour un code fiable
- **Patterns Modernes**: Implémente les principes SOLID et les pratiques de code propre
- **Logging Avancé**: Système de logging flexible avec plusieurs options de sortie

## 📝 Système de Logging

Le BunCLI-Kit inclut un puissant système de logging via le `LoggerService` qui vous aide à suivre et déboguer votre application :

- **Sortie Flexible**: Support pour la console et le logging dans des fichiers
- **Niveaux de Log**: Différents niveaux de log (INFO, ERROR, DEBUG, etc.)
- **Interface Propre**: Implémentation de l'interface `LoggerPort` pour une extension facile
- **Injection de Dépendances**: Suit les principes de l'architecture propre

Exemple d'utilisation :

```typescript
// Injecter le service de logging
constructor(private readonly logger: LoggerPort) {}

// Utiliser dans votre code
this.logger.info('Commande exécutée avec succès');
this.logger.error('Une erreur est survenue', error);
this.logger.debug('Information de débogage');
```

## 🚀 Démarrage Rapide

```bash
# Cloner le dépôt
git clone https://github.com/offroadlabs/buncli-kit.git
cd buncli-kit

# Installer les dépendances
bun install

# Voir les commandes disponibles
bun run help

# Créer une nouvelle commande CLI
bun run command:create <nom-commande>

# Supprimer une commande CLI
bun run command:remove <nom-commande>
```

## 📖 Création de Nouvelles Commandes

1. Créez une nouvelle commande en utilisant le générateur :

```bash
bun run command:create ma-commande
```

2. Cela va automatiquement :
   - Créer un nouveau fichier de commande dans `src/infrastructure/commands/MaCommandeCommand.ts`
   - Mettre à jour `src/index.ts` pour enregistrer la commande
   - Ajouter un script à `package.json`

La commande générée aura cette structure :

```typescript
import { CommandPort } from "../../domain/ports/CommandPort";

export class MaCommandeCommand implements CommandPort {
    getName(): string {
        return 'ma-commande';
    }

    getDescription(): string {
        return 'Description de la commande ma-commande';
    }

    async execute(args: string[]): Promise<void> {
        // Implémentez votre logique de commande ici
        console.log('ma-commande exécutée');
    }
}
```

## 🗑️ Suppression de Commandes

Pour supprimer une commande de votre CLI :

```bash
bun run command:remove ma-commande
```

Cela va :
- Supprimer le fichier de commande
- Nettoyer les imports dans `src/index.ts`
- Supprimer le script de `package.json`

## 🛠️ Directives de Développement

- Utilisez les schémas Zod pour la validation des arguments de commande
- Suivez le modèle d'architecture hexagonale :
  - `domain/`: Logique métier et interfaces
  - `infrastructure/`: Implémentations des commandes
  - `application/`: Services d'application
- Écrivez du code propre et maintenable suivant les principes SOLID
- Utilisez la configuration ESLint et Prettier fournie
- Ajoutez des tests pour vos commandes en utilisant le runner de test de Bun

## 🎨 Style de Code & Linting

Ce projet utilise ESLint et Prettier pour assurer un style de code cohérent et détecter les problèmes potentiels tôt. La configuration est conçue pour appliquer les meilleures pratiques TypeScript et maintenir une haute qualité de code.

### Configuration ESLint

Le projet utilise une configuration moderne plate (`eslint.config.js`) avec des règles TypeScript strictes :

```javascript
// Règles ESLint principales :
{
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/strict-boolean-expressions': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  'eqeqeq': 'error',
  'no-var': 'error',
  'prefer-const': 'error'
}
```

### Configuration Prettier

Le formatage du code est géré par Prettier avec les paramètres suivants :

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Exécution du Linting

```bash
# Lancer ESLint
bun run lint

# Corriger les problèmes auto-fixables
bun run lint --fix
```

## 🤖 Intelligence Artificielle

BunCLI-Kit intègre un système flexible pour interagir avec différents modèles d'IA via une architecture propre et extensible.

### Architecture IA

- **Interface IAiModel**: Interface de base pour tous les modèles d'IA
- **Formatters**: Système de formatage pour parser les réponses de l'IA
- **Factory Pattern**: Création de modèles d'IA via le singleton `AiModelFactory`
- **Support Streaming**: Capacités de streaming intégrées pour les réponses d'IA

### Utilisation du Formatteur JSON

Le `JsonFormatter` permet de parser et valider les réponses JSON des modèles d'IA. Voici un exemple complet :

```typescript
import { CommandPort } from '@/domain/ports/CommandPort';
import { LoggerService } from '@/application/services/LoggerService';
import { AiModelFactory } from '../ai/AiModelFactory';
import { z } from 'zod';
import { JsonFormatter } from '@/domain/ai/formatters/JsonFormatter';

// Définir votre schéma
const WeatherDataSchema = z.object({
  temperature: z.number(),
  conditions: z.string(),
  location: z.string(),
});

type WeatherData = z.infer<typeof WeatherDataSchema>;

export class MyAiCommand implements CommandPort {
  private readonly logger;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'my-ai-command',
      timestamp: false,
    });
  }

  async execute(): Promise<void> {
    const factory = AiModelFactory.getInstance();
    const model = factory.createOllamaModel('mistral');
    const jsonFormatter = new JsonFormatter();

    try {
      // Exemple avec formatage JSON
      const response = await model.generate<WeatherData>(
        'Give me the weather in Paris in JSON format with the fields temperature (number), conditions (string) and location (string)',
        {
          temperature: 0.7,
          systemPrompt: 'You are an assistant that only responds in valid JSON.',
          formatter: jsonFormatter.create(WeatherDataSchema),
        }
      );

      this.logger.info('Données météo :');
      this.logger.info('- Température :', response.content?.temperature ?? 'N/A');
      this.logger.info('- Conditions :', response.content?.conditions ?? 'N/A');
      this.logger.info('- Localisation :', response.content?.location ?? 'N/A');

      // Exemple avec streaming et transformation simple
      this.logger.info('\nRéponse en streaming avec transformation :');
      const upperCaseFormatter = (content: string): string => content.toUpperCase();

      if (model.streamGenerate) {
        for await (const chunk of model.streamGenerate<string>('Tell me a short story.', {
          temperature: 0.7,
          formatter: upperCaseFormatter,
          systemPrompt: 'in french.',
        })) {
          process.stdout.write(chunk.content ?? 'N/A');
        }
      }
    } catch (error) {
      this.logger.error('Erreur :', error);
    }
  }
}
```

### Fonctionnalités Clés

- Pattern singleton factory pour l'instanciation des modèles d'IA
- Réponses type-safe avec validation par schéma Zod
- Support des réponses en streaming avec transformation
- Gestion des erreurs et logging intégrés
- Système de formatage flexible pour différents types de sortie
- Configuration de la température et du prompt système
- Support de multiples modèles d'IA (Ollama, etc.)

## 🔧 Services Professionnels

### Expertise Technique

Je propose des services de développement et de conseil dans les domaines suivants :

- Applications Web Modernes (Next.js, React, TypeScript)
- APIs et Microservices (Symfony, Node.js)
- Architecture Logicielle et DevOps
- Formation et Support Technique

### Domaines d'Intervention

- Développement d'Applications Sur Mesure
- Migration et Modernisation de Systèmes Legacy
- Optimisation des Performances
- Conseil Technique

### Technologies Maîtrisées

- **Frontend**: TypeScript, React, Next.js, Tailwind
- **Backend**: PHP/Symfony, Node.js
- **Mobile**: Flutter, React Native
- **DevOps**: Docker, CI/CD, AWS
- **Bases de données**: PostgreSQL, MySQL, MongoDB

## 📫 Contact

Pour toute demande de collaboration ou de développement sur mesure :

- 📧 Email: [sebastien@offroadlabs.com](mailto:sebastien@offroadlabs.com)
- 📝 Blog: [https://timoner.com](https://timoner.com)
- 🌐 Site Web: [https://offroadlabs.com](https://offroadlabs.com)
- 📅 Calendrier: [Planifier un rendez-vous](https://hub.timoner.com)
- 📍 Localisation: Aix-en-Provence, France

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.

## ⭐ Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

---

Développé par [Sébastien TIMONER](https://github.com/offroadlabs) 