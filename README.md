# Portail IFAG – MVP de portail universitaire

> <span style="color:#38bdf8">Portail IFAG</span> est un **MVP** de portail universitaire moderne, développé dans le cadre du **module de Gestion de Projet**.  
> Il propose un **espace étudiant** centralisé (emploi du temps, notes, absences, annonces) et prépare l’intégration d’un **assistant IA** basé sur un LLM.

---

## 1. Contexte du projet

- **Type de projet** : Projet académique – module _Gestion de Projet_
- **Portée** : MVP d’un **portail universitaire** pour les étudiants
- **Chef de projet** : **Youb Mahmoud Nader** (propriétaire de ce dépôt)
- **Objectifs pédagogiques** :
  - Appliquer une démarche de gestion de projet (cadrage, modélisation, architecture).
  - Concevoir un **MVP fonctionnel** prêt à être étendu (v1, production).
  - Documenter l’architecture logicielle et la modélisation (UML, MCD, flux).

---

## 2. Vue d’ensemble fonctionnelle

Fonctionnalités actuelles de l’espace étudiant :

- **Tableau de bord étudiant** (`/student`)
  - Vue synthétique : informations étudiant (nom, groupe, spécialité).
  - Indicateurs : progression académique, moyenne générale, assiduité, progression des vacances.
  - Annonces récentes de l’établissement.
- **Emploi du temps** (`/student/schedule`)
  - Visualisation hebdomadaire par créneaux fixes (08:30–17:30).
  - Mise en avant du jour courant.
  - Distinction visuelle des types de cours (TP / cours magistral / autres).
- **Notes / Absences / Profil**
  - Endpoints déjà prévus dans la navigation pour extension ultérieure.

À terme, le portail sera étendu aux **enseignants**, **administration** et **services pédagogiques**, avec un **assistant IA** (LLM) pour automatiser certaines tâches (FAQ, recommandations, génération de planning, etc.).

---

## 3. Architecture globale

Le projet suit une architecture **multi-couches** :

- **Frontend** : Next.js (App Router) – React/TypeScript.
- **Backend API** : service HTTP (ex. FastAPI / Django / Node) exposé via `NEXT_PUBLIC_API_URL`.
- **Base de données** : PostgreSQL (hébergée, par ex. NeonDB).
- **Service IA (LLM)** : backend `ai-backend` dédié à l’IA (intégration future / progressive).

### 3.1 Schéma haut niveau

```mermaid
flowchart LR
    subgraph Client["Navigateur web / Étudiant"]
        UI[Interface React / Next.js]
    end

    subgraph Frontend["Frontend Next.js (portail_ifag)"]
        P1[/Pages App Router<br/>/student, /student/schedule/]
        C1[Composants UI<br/>Shell, Card, ScheduleTable...]
    end

    subgraph Backend["Backend API applicatif"]
        API[(REST / GraphQL API<br/>NEXT_PUBLIC_API_URL)]
    end

    subgraph DB["Base de données PostgreSQL"]
        DBMain[(Schéma académique<br/>Étudiants, Classes, Groupes,<br/>Modules, Notes, Absences...)]
    end

    subgraph AI["Service IA (ai-backend)"]
        LLMCore[(Moteur LLM)]
        Orchestrator[Orchestrateur de prompts<br/>& contexte]
    end

    UI --> P1
    P1 --> API
    API --> DBMain
    API <--> AI
    AI --> LLMCore
```

---

## 4. Architecture Frontend (Next.js)

Le code fourni montre une **architecture orientée features** autour de l’espace étudiant :

### 4.1 Pages clés

- `app/student/page.tsx`
  - Page principale de **tableau de bord**.
  - Récupère les données via `getStudentDashboardData(studentId)`.
  - Affiche :
    - Bloc identité étudiant.
    - Progress bars (`ProgressBar`, `ProgressCircles`).
    - Notes rapides.
    - Annonces (`announcements`).
    - Widgets académiques + mini emploi du temps (`ScheduleTable`).

- `app/student/schedule/page.tsx`
  - Page détaillée **Emploi du temps** hebdomadaire.
  - Utilise une matrice jour × créneaux horaires pour afficher les cours.
  - Navigation étudiante (mobile + desktop) intégrée dans le layout `Shell`.

### 4.2 Composants et layout

- `Shell`
  - Layout générique : titre, sous-titre, navigation contextuelle (`variant="student"`).
- `Card`
  - Composant de conteneur stylé (cartes).
- `ScheduleTable`
  - Composant de tableau d’emploi du temps compact.
- Autres composants :
  - `ProgressBar`, `ProgressCircles` : visualisation de progression.
  - `BadgePill` : tags de statut (niveau, badges, assiduité).
  - `ExpandStatsButton` : future extension pour détails statistiques.

---

## 5. Architecture Backend & Base de données

Même si l’implémentation complète du backend n’est pas montrée ici, on peut déduire le modèle logique :

- Accès BDD via **PostgreSQL** (`DATABASE_URL`).
- Données agrégées via `getStudentDashboardData(studentId)` :
  - `student` (profil, classe, groupe, spécialité).
  - `schedule` (créneaux de cours).
  - `notesSummary` (moyenne, meilleur module, etc.).
  - `absencesCount`.
  - `announcements`.
  - `academicProgress`, `holidaysProgress`.

---

## 6. Modélisation – Diagrammes (Gestion de Projet)

### 6.1 Diagramme de classes (Vue métier simplifiée)

```mermaid
classDiagram
    class Student {
      +id : UUID
      +full_name : string
      +email : string
      +matricule : string
      +photo_url : string
    }

    class Class {
      +id : UUID
      +name : string
      +level : string
      +speciality_name : string
      +promotion_name : string
    }

    class Group {
      +id : UUID
      +name : string
    }

    class ScheduleSlot {
      +id : UUID
      +day : string
      +start : time
      +end : time
      +subject : string
      +type : string
      +teacher : string
      +room : string
    }

    class Module {
      +id : UUID
      +name : string
      +coefficient : float
    }

    class Grade {
      +id : UUID
      +value : float
    }

    class Absence {
      +id : UUID
      +date : date
      +justified : bool
    }

    class Announcement {
      +id : UUID
      +title : string
      +content : text
      +published_at : datetime
    }

    Student "1" --> "1" Class
    Student "1" --> "1" Group
    Class "1" --> "*" ScheduleSlot
    Group "1" --> "*" ScheduleSlot
    Student "1" --> "*" Grade
    Module "1" --> "*" Grade
    Student "1" --> "*" Absence
    Class "1" --> "*" Announcement
```

### 6.2 Diagramme de flux (Vue processus – étudiant)

```mermaid
flowchart LR
    A["Connexion étudiant<br/>SSO et Auth"]
    A --> B["Chargement page<br/>student"]

    B --> C["Appel getStudentDashboardData"]
    C --> D[(PostgreSQL)]
    D --> C
    C --> E["Affichage dashboard<br/>Notes, progression, annonces"]

    E --> F["Navigation vers page<br/>student schedule"]
    F --> G["Appel API emploi du temps"]
    G --> D
    D --> G
    G --> H["Tableau des créneaux<br/>Jour courant mis en avant"]

    E --> I["Interaction IA future<br/>chatbot, FAQ"]
    I --> J["Service IA LLM"]
    J --> D
```

### 6.3 Modèle Conceptuel de Données (MCD simplifié)

```mermaid
erDiagram
    STUDENT {
      uuid id
      string full_name
      string email
      string matricule
    }

    ACADEMIC_CLASS {
      uuid id
      string name
      string level
      string speciality_name
      string promotion_name
    }

    STUDENT_GROUP {
      uuid id
      string name
    }

    SCHEDULE_SLOT {
      uuid id
      string day
      string start_time
      string end_time
      string subject
      string type
      string teacher
      string room
    }

    MODULE {
      uuid id
      string name
      float coefficient
    }

    GRADE {
      uuid id
      float value
    }

    ABSENCE {
      uuid id
      date date
      boolean justified
    }

    ANNOUNCEMENT {
      uuid id
      string title
      string content
      datetime published_at
    }

    STUDENT ||--o{ GRADE : "reçoit"
    MODULE ||--o{ GRADE : "est noté par"
    STUDENT ||--o{ ABSENCE : "possède"
    ACADEMIC_CLASS ||--o{ SCHEDULE_SLOT : "planifie"
    STUDENT_GROUP ||--o{ SCHEDULE_SLOT : "assiste"
    ACADEMIC_CLASS ||--o{ STUDENT : "regroupe"
    STUDENT_GROUP ||--o{ STUDENT : "regroupe"
    ACADEMIC_CLASS ||--o{ ANNOUNCEMENT : "émet"
```

---

## 7. Composant IA – LLM et architecture

Le projet prévoit (ou héberge) un **service IA** dans un dossier dédié (`ai-backend`) qui communique avec un **LLM** (Large Language Model) de type GPT.

### 7.1 Rôle du LLM dans le portail

- Répondre aux **questions fréquentes** des étudiants (règlement, deadlines, procédures).
- Générer des **explications personnalisées** sur les notes et la progression.
- Aider à la **planification** (révisions, rattrapage, organisation hebdomadaire).
- Fournir des **recommandations** contextualisées (basées sur classe, groupe, modules suivis, historique).

### 7.2 Architecture logique du composant IA

```mermaid
flowchart LR
    subgraph Frontend
      ChatUI["UI assistant IA<br/>chat — panneau latéral"]
    end

    subgraph AI_Backend["ai-backend"]
      Controller["Endpoint HTTP<br/>chat"]
      ContextBuilder["Construction du contexte<br/>données étudiant, cours"]
      PromptEngine["Génération de prompt<br/>et post-traitement"]
    end

    subgraph LLM_Cloud["Service LLM cloud"]
      LLMModel[(Modèle de langage<br/>multi-couches)]
    end

    ChatUI --> Controller
    Controller --> ContextBuilder
    ContextBuilder --> PromptEngine
    PromptEngine --> LLMModel
    LLMModel --> PromptEngine
    PromptEngine --> Controller
    Controller --> ChatUI
```

### 7.3 Vue interne du LLM (simplifiée)

Le LLM est un **réseau de neurones profond** organisé en couches de **transformers** :

- Entrée : texte (prompt) + contexte (données de l’étudiant).
- Passage par plusieurs couches :
  - **Embedding** des tokens.
  - **Mécanismes d’attention** multi-têtes.
  - **Couches feed-forward** pour la projection dans un espace sémantique riche.
- Sortie : texte généré (réponse en langage naturel).

---

## 8. Mise en route rapide (développement)

### 8.1 Prérequis

- **Node.js** (version LTS recommandée)
- **npm** ou **pnpm** / **yarn**
- Accès à une base **PostgreSQL**
- Fichier `.env.local` correctement rempli (URL BDD, URL API, secrets d’auth)

### 8.2 Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd portail_ifag

# Installer les dépendances
npm install
# ou
pnpm install
```

### 8.3 Lancer le projet

```bash
npm run dev
# puis ouvrir http://localhost:3000
```

---

## 9. Roadmap (MVP → v1)

- [x] Dashboard étudiant avec indicateurs clés.
- [x] Emploi du temps hebdomadaire détaillé.
- [ ] Gestion complète des **notes** (vue par module, export PDF).
- [ ] Gestion avancée des **absences** (justification, notifications).
- [ ] Espace **enseignant** (saisie notes, absences, annonces).
- [ ] Espace **administration** (gestion des classes, groupes, calendriers).
- [ ] Intégration complète de l’**assistant IA** dans le portail.
- [ ] Internationalisation (fr / en).
- [ ] Renforcement sécurité (auth, rôles, audit).

---

## 10. Crédits & gouvernance de projet

- **Chef de projet** : **Youb Mahmoud Nader**
- **Type** : Projet universitaire – module _Gestion de Projet_
- **But** : Démontrer un MVP fonctionnel, documenté, extensible, servant de base pour un portail universitaire complet.

Les autres membres de l’équipe seront ajoutés ultérieurement dans cette section (rôles : développeurs backend, frontend, responsable QA, etc.).

---

## 11. Planification du projet – PERT, Gantt & histogramme de charge

Le projet a été réalisé sur **10 semaines** effectives. La **réalisation technique** (frontend + backend) et surtout la **conception / implémentation du LLM** ont représenté la charge la plus importante.

- **Diagramme PERT** : visualise les **dépendances logiques** entre tâches, met en évidence le **chemin critique**.
- **Diagramme de Gantt** : visualise le **calendrier** (qui fait quoi, quand, et pendant combien de temps).
- **Histogramme de charge** : dérivé du Gantt, il montre la **répartition de l’effort** par phase.

### 11.1 Hypothèses de planning (10 semaines)

- Horizon : **10 semaines** (S1 → S10).
- 1 semaine ≈ 5 jours ouvrés (valeur indicative).
- Certaines tâches sont **en parallèle** (frontend / backend, LLM / autres).
- Le **chemin critique** est dominé par :  
  _Analyse → Conception → Dev LLM / Intégration → Tests → Clôture_.

### 11.2 Diagramme PERT (dépendances, 10 semaines)

```mermaid
flowchart LR
    A["Étude de faisabilité<br/>Semaine 1"]
        --> B["Cadrage et objectifs MVP<br/>Semaine 1"]

    B --> C["Analyse des besoins<br/>Semaine 2"]

    C --> D["Modélisation<br/>UML, MCD, flux<br/>Semaine 3"]

    D --> E["Architecture technique globale<br/>Semaines 3 à 4"]

    E --> F["Développement Backend API<br/>Semaines 4 à 6"]
    E --> G["Développement Frontend Next.js<br/>Semaines 4 à 6"]
    E --> H["Conception et développement LLM<br/>Semaines 4 à 7"]

    F --> I["Intégration Base de données et API<br/>Semaines 6 à 7"]
    G --> I

    H --> J["Tests d'intégration et corrections<br/>Semaines 8 à 9"]
    I --> J

    J --> K["Documentation et soutenance MVP<br/>Semaine 10"]
```

**Lecture (exemples)**

- On ne commence pas la **modélisation** (D) avant l’**analyse des besoins** (C).
- Le **dev LLM** (H) dépend de l’**architecture** (E) et s’étale sur **3 semaines** (4→7).
- La **livraison du MVP** (K) dépend des **tests** (J) → c’est la fin du **chemin critique**.

### 11.3 Diagramme de Gantt (10 semaines, vue calendrier)

Exemple de Gantt aligné sur 10 semaines (dates indicatives, l’important est la durée relative).

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       Portail IFAG – Planning sur 10 semaines (exemple)

    section Cadrage & analyse
    Étude de faisabilité + cadrage        :a1, 2024-02-05, 7d
    Analyse des besoins                   :a2, after a1, 7d

    section Conception
    Modélisation (UML, MCD, flux)         :b1, after a2, 7d
    Architecture technique globale        :b2, after b1, 7d

    section Réalisation
    Dev Backend API                       :c1, 2024-03-04, 21d
    Dev Frontend Next.js                  :c2, 2024-03-04, 21d
    Conception & dev LLM + intégration IA :crit, c3, 2024-03-11, 21d

    section Intégration & tests
    Intégration BDD + API                 :d1, after c1, 5d
    Tests d'intégration & corrections     :d2, after d1, 7d

    section Clôture
    Documentation & préparation soutenance :e1, after d2, 5d
```

- Les tâches **backend** et **frontend** démarrent en parallèle à partir de la semaine 4.
- Le **bloc LLM** (`crit`) est volontairement long (≈ 3 semaines) pour refléter le temps important passé sur cette partie.
- L’ensemble du planning tient dans un horizon d’environ **10 semaines**.

### 11.4 Histogramme de charge (dérivé du Gantt)

Histogramme simplifié de la **charge par grande phase** (en semaines-homme approximatives) :

| Phase                                  | Durée approx. (sem.) | Charge relative | Représentation visuelle |
| -------------------------------------- | -------------------- | --------------- | ----------------------- |
| Cadrage & analyse                      | 2                    | Moyenne         | ████████                |
| Modélisation & architecture            | 2                    | Moyenne         | ████████                |
| Dev Backend API                        | 3                    | Importante      | ██████████████          |
| Dev Frontend Next.js                   | 3                    | Importante      | ██████████████          |
| Conception & dev LLM + intégration IA  | 3                    | Très élevée     | ████████████████████    |
| Intégration BDD + API                  | 1                    | Faible          | ████                    |
| Tests d'intégration & corrections      | 1                    | Moyenne         | █████                   |
| Documentation & préparation soutenance | 1                    | Moyenne         | █████                   |

#### 11.4.1 Graphe de répartition de la charge (histogramme)

```mermaid
chart
    title: Répartition de la charge par phase (en "semaines équivalentes")
    type: bar
    xAxisTitle: Phases du projet
    yAxisTitle: Semaines équivalentes
    "Cadrage & analyse": 2
    "Modélisation & architecture": 2
    "Dev Backend API": 3
    "Dev Frontend Next.js": 3
    "Conception & dev LLM + IA": 3
    "Intégration BDD + API": 1
    "Tests intégration & corrections": 1
    "Documentation & soutenance": 1
```

On voit clairement que :

- La **réalisation technique** (backend + frontend) consomme une grande partie des 10 semaines.
- Le **LLM** représente un **pic de charge** (conception, expérimentations, intégration au backend).

### 11.5 Interprétation des diagrammes (vue Gestion de Projet)

- **PERT** : utile pour identifier le **chemin critique** (suite de tâches qui déterminent la durée minimale du projet) et les tâches pouvant être décalées sans impacter la date de fin.
- **Gantt** : permet de **communiquer le planning** à l’équipe (visibilité sur les chevauchements et les jalons).
- **Histogramme de charge** : permet de vérifier que la **charge de travail est réaliste**, d’anticiper les **pics** (ici sur le LLM) et d’ajuster la répartition des ressources si besoin.

---

## 12. Conclusion

Le projet a démontré la faisabilité d’un MVP fonctionnel et documenté, avec une architecture modulaire et extensible. Le **LLM** a représenté un point de tension important, mais le planning et la conception ont permis de le gérer efficacement. Le portail est maintenant prêt à être étendu aux enseignants et services pédagogiques.

---

## 13. Recommandations

- **Étendre le portail** aux enseignants et services pédagogiques.
- **Intégrer un assistant IA** plus sophistiqué (LLM avec contexte, mémoire, etc.).
- **Renforcer la sécurité** (auth, rôles, audit).
- **Internationalisation** (fr / en).
- **Documentation complète** (README, diagrammes, livrables).

---

## 14. Crédits

- **Chef de projet** : **Youb Mahmoud Nader**
- **Type** : Projet universitaire – module _Gestion de Projet_
- **But** : Démontrer un MVP fonctionnel, documenté, extensible, servant de base pour un portail universitaire complet.

Les autres membres de l’équipe seront ajoutés ultérieurement dans cette section (rôles : développeurs backend, frontend, responsable QA, etc.).

---
