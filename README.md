# Projet Final: Sécurité des Données
Évaluation de sécurité, remédiation et automatisation CI/CD sur OWASP Juice Shop

## Contexte
Ce projet évalue la sécurité de l'application OWASP Juice Shop dans le cadre de
l'examen final du cours Sécurité des Données.

## Comment exécuter le projet

### Prérequis
- Node.js
- Docker (pour OWASP ZAP)
- Semgrep installé
- Jenkins avec le plugin Email Extension configuré

### Lancer Juice Shop en local
```bash
cd juice-shop
npm install
npm start
# Application accessible sur http://<votre-ip-locale>:3000
```

## Comment lancer les analyses de sécurité

### SAST Semgrep
```bash
semgrep --config=auto --json --output=reports/semgrep-report.json .
```

### DAST OWASP ZAP
```bash
docker run --rm --network host \
  -v $(pwd)/reports:/zap/wrk/:rw \
  zaproxy/zap-stable zap-baseline.py \
  -t http://<votre-ip-locale>:3000 \
  -J zap-report.json -r zap-report.html -I
```

## Outils utilisés

| Outil | Type | Rôle |
|---|---|---|
| Semgrep | SAST | Analyse statique du code source (règles communautaires) |
| OWASP ZAP | DAST | Scan dynamique de l'application en fonctionnement |
| Jenkins | CI/CD | Orchestration du pipeline d'analyse automatisé |

## Pipeline Jenkins
Le `Jenkinsfile` à la racine définit un pipeline à 6 étapes :
Checkout → Build/Préparation → SAST (Semgrep) → DAST (ZAP) → Génération de rapports → Notification (email).

Le déclenchement se fait automatiquement via **Poll SCM** (`H/2 * * * *`), Jenkins tournant en local sans exposition publique à internet.

Les rapports générés sont archivés dans Jenkins et copiés automatiquement dans `reports/`. Un email de notification est envoyé à chaque exécution, avec les rapports JSON en pièce jointe.

## Vulnérabilités identifiées et corrigées
5 vulnérabilités ont été identifiées (voir rapport complet). Parmi elles, 2 ont été corrigées et vérifiées — voir le dossier `remediation/` et `video` pour le détail :

- **SQL Injection** (Login) — remplacement de la concaténation directe par une requête paramétrée (bind parameters)
- **Cross-Site Scripting (XSS)** (Recherche) — suppression du contournement `bypassSecurityTrustHtml`, retour à l'échappement automatique d'Angular

Les 3 autres vulnérabilités (Broken Access Control, Broken Authentication, Brute Force) sont documentées dans le rapport mais non corrigées à ce stade, faute de temps.

## Limites des outils
- **Semgrep** dépend de règles publiques génériques, peut générer des faux positifs, et ne détecte pas les failles de logique métier (ex: Broken Authentication de Jim, trouvée uniquement par exploitation manuelle).
- **ZAP** effectue un scan baseline passif, sans exploitation active en profondeur.
- L'analyse humaine reste indispensable pour valider et contextualiser les résultats.
