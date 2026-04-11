# Politique de Sécurité — O-229 Marketplace

## Signalement de Vulnérabilités

Nous prenons la sécurité de cette plateforme très au sérieux. Si vous découvrez une vulnérabilité, veuillez ne pas l'ouvrir comme une "Issue" publique. Envoyez plutôt un rapport détaillé à l'adresse suivante : [votre-email@exemple.com].

## Versions Supportées

| Version | Supportée          |
| ------- | ------------------ |
| 1.0.x   | ✅ Oui              |
| < 1.0   | ❌ Non              |

## Meilleures Pratiques Appliquées

1. **Secrets** : Aucun secret ou clé API ne doit être commité dans le dépôt. Utilisez les GitHub Secrets pour le CI/CD.
2. **Dépendances** : Nous utilisons Dependabot pour surveiller et mettre à jour les dépendances vulnérables.
3. **Scan de Code** : Le scan de code statique (SAST) est activé pour identifier les erreurs de logique de sécurité.
4. **Protection de Branche** : La branche `main` est protégée pour empêcher les modifications directes sans revue de code.
