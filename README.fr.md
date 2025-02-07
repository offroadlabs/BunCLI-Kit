# BunCLI-Kit 🚀

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)

Un kit de développement CLI TypeScript puissant et moderne propulsé par Bun, conçu pour créer des applications en ligne de commande robustes avec facilité. Cette boîte à outils fournit une manière propre et structurée de créer des commandes CLI en utilisant TypeScript, Zod pour la validation, et Bun pour une exécution rapide. Elle intègre un système complet d'IA qui supporte plusieurs fournisseurs de modèles (OpenAI, Anthropic, Ollama) permettant d'enrichir vos commandes CLI avec des capacités d'intelligence artificielle de manière simple et efficace.

## 🌟 Fonctionnalités

- **TypeScript First**: Construit avec TypeScript pour une sécurité de type maximale et une expérience développeur optimale
- **Propulsé par Bun**: Exploite la vitesse et les fonctionnalités modernes de Bun
- **Architecture Propre**: Implémente l'architecture hexagonale avec les principes du domain-driven design
- **Validation des Données**: Validation des schémas Zod intégrée pour une gestion robuste des commandes
- **Support Multi-IA**: Intégration native avec OpenAI (GPT), Anthropic (Claude) et Ollama (modèles open source)
- **Expérience Développeur**: Inclut la configuration ESLint et Prettier prête à l'emploi
- **Sécurité des Types**: Configuration TypeScript stricte pour un code fiable
- **Patterns Modernes**: Implémente les principes SOLID et les pratiques de code propre
- **Logging Avancé**: Système de logging flexible avec plusieurs options de sortie

## 🔑 Configuration des Variables d'Environnement

BunCLI-Kit utilise des variables d'environnement pour gérer les configurations sensibles comme les clés API. Un fichier `.env.dist` est fourni comme modèle. Pour configurer votre environnement :

1. Copiez le fichier modèle :
```bash
cp .env.dist .env
```

2. Modifiez le fichier `.env` avec vos configurations :

```env
# Configuration OpenAI
OPENAI_API_KEY=votre-clé-api-openai
OPENAI_BASE_URL=https://api.openai.com/v1  # Optionnel, peut être modifié pour utiliser d'autres services compatibles

# Configuration Anthropic
ANTHROPIC_API_KEY=votre-clé-api-anthropic

# Configuration Ollama
OLLAMA_BASE_URL=http://localhost:11434  # Optionnel, modifiez si Ollama est sur un autre hôte
```

### Services Compatibles OpenAI

Le système supporte différents services compatibles avec l'API OpenAI. Voici quelques exemples de configuration :

```env
# OpenAI standard
OPENAI_BASE_URL=https://api.openai.com/v1

# Azure OpenAI
OPENAI_BASE_URL=https://votre-ressource.openai.azure.com

# LocalAI
OPENAI_BASE_URL=http://localhost:8080/v1

# Autres services compatibles
OPENAI_BASE_URL=https://api.votre-service.com/v1
```

⚠️ **Important** : 
- Le fichier `.env` est ignoré par Git pour protéger vos informations sensibles
- Ne committez jamais vos vraies clés API dans le dépôt
- Gardez une copie sécurisée de vos clés API

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

- **AiModelService**: Service central gérant les interactions et la validation des modèles d'IA
- **Interface IAiModel**: Interface de base pour tous les modèles d'IA
- **Formatters**: Système de formatage pour parser les réponses de l'IA
- **Factory Pattern**: Création de modèles d'IA via le singleton `AiModelFactory`
- **Support Streaming**: Capacités de streaming intégrées pour les réponses d'IA

### Modèles d'IA Supportés

BunCLI-Kit prend en charge plusieurs fournisseurs de modèles d'IA :

#### OpenAI
- Modèles GPT (3.5-turbo, GPT-4, etc.)
- Support complet du streaming
- Compatible avec les services Azure OpenAI et autres API compatibles OpenAI
- Configuration via `OPENAI_API_KEY` et `OPENAI_BASE_URL`

#### Anthropic
- Modèles Claude (Claude 3 Opus, Sonnet, Haiku)
- Support du streaming
- Configuration via `ANTHROPIC_API_KEY`

#### Ollama (Local)
- Modèles open source (Mistral, Llama, CodeLlama, etc.)
- Exécution locale des modèles
- Support du streaming
- Configuration via `OLLAMA_BASE_URL`

Exemple d'utilisation avec différents modèles :

```typescript
// Utilisation d'OpenAI
const openaiModel = this.aiModelService.createModel('openai', 'gpt-4');

// Utilisation d'Anthropic
const anthropicModel = this.aiModelService.createModel('anthropic', 'claude-3-opus-20240229');

// Utilisation d'Ollama
const ollamaModel = this.aiModelService.createModel('ollama', 'mistral');
```

### Utilisation du AiModelService

Le système d'IA fournit un service centralisé pour la gestion des modèles d'IA. Voici un exemple complet :

```typescript
import { CommandPort } from '@/domain/ports/CommandPort';
import { LoggerService } from '@/application/services/LoggerService';
import { AiModelService } from '@/application/services/AiModelService';
import { z } from 'zod';

// Définir vos schémas
const WeatherDataSchema = z.object({
  temperature: z.number(),
  conditions: z.string(),
  location: z.string(),
});

export class MyAiCommand implements CommandPort {
  private readonly logger;
  private readonly aiModelService;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'my-ai-command',
      timestamp: false,
    });
    this.aiModelService = AiModelService.getInstance();
  }

  async execute(): Promise<void> {
    const model = this.aiModelService.createModel('ollama', 'mistral');

    try {
      // Exemple avec validation de schéma
      const response = await model.generate(
        'Give me the weather in Paris. For temperature, write 9 for 9°C, 10 for 10°C, etc.',
        {
          temperature: 0.7,
          systemPrompt: 'You are a weather reporter. Write in Spanish.',
          schema: WeatherDataSchema,
        }
      );

      // Valider la réponse avec AiModelService
      const isValid = await this.aiModelService.validateModelResponse(
        response.content,
        WeatherDataSchema
      );

      if (isValid) {
        this.logger.info('Données météo :');
        this.logger.info('- Température :', response.content?.temperature ?? 'N/A');
        this.logger.info('- Conditions :', response.content?.conditions ?? 'N/A');
        this.logger.info('- Location :', response.content?.location ?? 'N/A');
      } else {
        this.logger.error('Format de réponse invalide');
      }

      // Exemple avec streaming et transformation
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

- Gestion centralisée des modèles d'IA via AiModelService
- Typage fort avec schémas Zod pour les réponses de l'IA
- Validation intégrée des réponses
- Support de plusieurs types de modèles d'IA
- Support du streaming avec transformation
- Configuration flexible (température, prompt système)
- Gestion complète des logs et des erreurs

### Utilisation des Formatters Personnalisés

En plus de la validation des schémas, vous pouvez utiliser des formatters personnalisés pour transformer les réponses. Voici comment les utiliser avec AiModelService :

```typescript
import { CommandPort } from '@/domain/ports/CommandPort';
import { LoggerService } from '@/application/services/LoggerService';
import { AiModelService } from '@/application/services/AiModelService';

export class MyFormatterCommand implements CommandPort {
  private readonly logger;
  private readonly aiModelService;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'my-formatter-command',
      timestamp: false,
    });
    this.aiModelService = AiModelService.getInstance();
  }

  async execute(): Promise<void> {
    const model = this.aiModelService.createModel('ollama', 'mistral');

    try {
      // Exemple avec un formatter simple qui met le texte en majuscules
      const upperCaseFormatter = (content: string): string => content.toUpperCase();
      
      const response = await model.generate(
        'Raconte-moi une courte histoire.',
        {
          temperature: 0.7,
          formatter: upperCaseFormatter,
          systemPrompt: 'Tu es un conteur d\'histoires.',
        }
      );

      this.logger.info('Histoire en majuscules :', response.content);

      // Exemple avec un formatter qui ajoute un préfixe et un suffixe
      const wrapFormatter = (content: string): string => {
        return `🌟 ${content} 🌟`;
      };

      const wrappedResponse = await model.generate(
        'Donne-moi une citation inspirante.',
        {
          temperature: 0.7,
          formatter: wrapFormatter,
          systemPrompt: 'Tu es un coach motivant.',
        }
      );

      this.logger.info('Citation décorée :', wrappedResponse.content);

      // Exemple avec streaming et transformation
      this.logger.info('\nRéponse en streaming avec transformation :');
      
      if (model.streamGenerate) {
        for await (const chunk of model.streamGenerate<string>(
          'Raconte-moi une blague.',
          {
            temperature: 0.7,
            formatter: upperCaseFormatter,
            systemPrompt: 'Tu es un comédien.',
          }
        )) {
          process.stdout.write(chunk.content ?? 'N/A');
        }
      }
    } catch (error) {
      this.logger.error('Erreur :', error);
    }
  }
}
```

Les formatters peuvent être utilisés pour :
- Transformer le texte (majuscules, minuscules, etc.)
- Ajouter des décorations ou du formatage
- Nettoyer ou normaliser les réponses
- Appliquer des transformations personnalisées
- Traiter les réponses avant la validation

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

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## ⭐ Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

---

Développé par [Sébastien TIMONER](https://github.com/offroadlabs) 