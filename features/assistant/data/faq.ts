// ============================================================
// features/assistant/data/faq.ts
// Base de connaissances de l'assistant Agilly.
//
// ⚠️ BROUILLON à faire relire et compléter par la RH, la DFC et l'informatique.
// À terme : table en base, éditable depuis l'administration.
//
// Mise en forme des réponses : lignes « - » = liste à puces,
// « 1. » = liste numérotée, **texte** = gras.
// ============================================================

export type CategorieFaq = "conges" | "missions" | "evaluations" | "caisse" | "portail" | "rh";

export interface ActionFaq {
  label: string;
  href: string;
}

export interface EntreeFaq {
  id: string;
  categorie: CategorieFaq;
  question: string;
  /** Mots et expressions qui doivent déclencher cette réponse (synonymes, fautes courantes…) */
  motsCles: string[];
  reponse: string;
  actions?: ActionFaq[];
  /** Questions liées proposées après la réponse (ids) */
  liees?: string[];
}

export const CATEGORIES: Record<CategorieFaq, { label: string; emoji: string }> = {
  conges: { label: "Congés & absences", emoji: "🏖️" },
  missions: { label: "Missions", emoji: "🧳" },
  evaluations: { label: "Évaluations", emoji: "🎯" },
  caisse: { label: "Pièces de caisse", emoji: "💰" },
  portail: { label: "Portail & compte", emoji: "🧭" },
  rh: { label: "Ressources humaines", emoji: "🤝" },
};

export const FAQ: EntreeFaq[] = [
  // ─── Congés & absences ─────────────────────────────────────
  {
    id: "poser-conge",
    categorie: "conges",
    question: "Comment poser un congé ?",
    motsCles: ["poser conge", "demande de conge", "prendre conge", "vacances", "faire une demande", "nouvelle demande", "partir en conge", "jour off"],
    reponse:
      "Tout se fait dans **Absences & Congés** :\n1. Cliquez sur **Nouvelle demande**.\n2. Choisissez le type (congé payé, permission…), les dates et le motif.\n3. Ajoutez un justificatif si nécessaire, puis **Soumettez**.\n\nVotre responsable (N+1) reçoit la demande, puis elle suit le circuit de validation. Vous êtes notifié à chaque étape.",
    actions: [{ label: "Nouvelle demande", href: "/absences/nouvelle" }],
    liees: ["circuit-validation", "voir-solde", "suivre-demande"],
  },
  {
    id: "voir-solde",
    categorie: "conges",
    question: "Combien de jours de congé me reste-t-il ?",
    motsCles: ["solde", "jours restants", "reste combien", "combien de jours", "mes droits", "jours acquis", "compteur"],
    reponse:
      "Votre solde est visible dans **Absences & Congés → Soldes** : jours acquis, jours pris et jours restants pour l'année en cours.\n\nSi un chiffre vous semble incorrect, contactez la RH : elle peut ajuster le solde.",
    actions: [{ label: "Voir mon solde", href: "/absences/soldes" }],
    liees: ["poser-conge", "contacter-rh"],
  },
  {
    id: "suivre-demande",
    categorie: "conges",
    question: "Où en est ma demande ?",
    motsCles: ["suivre demande", "statut", "ou en est", "avancement", "mes demandes", "demande en attente", "pas de reponse", "validee", "refusee"],
    reponse:
      "Retrouvez toutes vos demandes dans **Mes demandes**, avec leur statut en temps réel : en attente du N+1, en validation RH, approuvée, refusée…\n\nEn cas de refus, le motif est indiqué et vous pouvez corriger puis renvoyer la demande.",
    actions: [{ label: "Mes demandes", href: "/absences/demandes" }],
    liees: ["circuit-validation", "annuler-demande"],
  },
  {
    id: "circuit-validation",
    categorie: "conges",
    question: "Qui valide ma demande de congé ?",
    motsCles: ["qui valide", "circuit", "validation", "workflow", "etapes", "approbation", "superieur", "n+1", "drh"],
    reponse:
      "Le circuit dépend du type de demande. En général :\n1. Votre **responsable direct (N+1)**\n2. La **Direction des Ressources Humaines** (contrôle du solde et des règles)\n3. La **Direction générale** pour certains types ou durées\n\nÀ chaque étape, le valideur peut accepter ou refuser avec un motif.",
    actions: [{ label: "Mes demandes", href: "/absences/demandes" }],
    liees: ["suivre-demande", "valider-equipe"],
  },
  {
    id: "annuler-demande",
    categorie: "conges",
    question: "Comment annuler ou modifier une demande ?",
    motsCles: ["annuler", "modifier", "supprimer demande", "changer les dates", "erreur demande", "corriger"],
    reponse:
      "Ouvrez la demande depuis **Mes demandes**. Tant qu'elle n'est pas entièrement validée, vous pouvez l'annuler.\n\nSi elle vous a été retournée, corrigez-la puis renvoyez-la. Une fois approuvée, contactez votre N+1 et la RH pour toute modification.",
    actions: [{ label: "Mes demandes", href: "/absences/demandes" }],
    liees: ["suivre-demande", "contacter-rh"],
  },
  {
    id: "valider-equipe",
    categorie: "conges",
    question: "Comment valider les demandes de mon équipe ?",
    motsCles: ["valider equipe", "valider demande", "manager", "approuver", "demandes a valider", "mon equipe", "en attente de validation"],
    reponse:
      "Si vous êtes responsable, les demandes de votre équipe arrivent dans **Validations**. Pour chacune, vous pouvez **approuver** ou **refuser avec un motif**.\n\nLe **planning d'équipe** vous aide à éviter que tout le monde parte en même temps.",
    actions: [
      { label: "Mes validations", href: "/absences/validations" },
      { label: "Planning d'équipe", href: "/absences/planning" },
    ],
    liees: ["delegation", "circuit-validation"],
  },
  {
    id: "delegation",
    categorie: "conges",
    question: "Je pars en congé : qui valide à ma place ?",
    motsCles: ["delegation", "interim", "deleguer", "remplacant", "absent valider", "a ma place", "suppleant"],
    reponse:
      "Avant de partir, désignez un **intérimaire** dans la page **Validations** (section délégation). Il pourra valider les demandes de votre équipe pendant votre absence.\n\nPensez à révoquer la délégation à votre retour.",
    actions: [{ label: "Gérer la délégation", href: "/absences/validations" }],
    liees: ["valider-equipe"],
  },

  // ─── Missions ──────────────────────────────────────────────
  {
    id: "ordre-mission",
    categorie: "missions",
    question: "Comment faire un ordre de mission ?",
    motsCles: ["ordre de mission", "mission", "deplacement", "voyage", "partir en mission", "frais de mission", "deplacement professionnel"],
    reponse:
      "Dans **Missions & Interventions**, cliquez sur **Nouvelle mission** et renseignez la destination, les dates, l'objet et les frais prévus.\n\nL'ordre de mission suit ensuite son circuit de validation, puis le document officiel est généré et archivé.",
    actions: [{ label: "Nouvelle mission", href: "/absences/missions/nouvelle" }],
    liees: ["intervention", "suivre-demande"],
  },
  {
    id: "intervention",
    categorie: "missions",
    question: "Comment déclarer une intervention terrain ?",
    motsCles: ["intervention", "terrain", "technicien", "site client", "declarer intervention"],
    reponse:
      "Rendez-vous dans **Interventions**, puis **Nouvelle intervention** : indiquez le site, le collaborateur, les dates et la nature de l'intervention.",
    actions: [{ label: "Nouvelle intervention", href: "/absences/interventions/nouvelle" }],
    liees: ["ordre-mission"],
  },

  // ─── Évaluations ───────────────────────────────────────────
  {
    id: "mes-objectifs",
    categorie: "evaluations",
    question: "Où voir mes objectifs de l'année ?",
    motsCles: ["objectifs", "mes objectifs", "evaluation", "performance", "entretien annuel", "rheval", "note", "kpi"],
    reponse:
      "Vos objectifs sont dans **Performances → Mon espace → Objectifs**. Vous y voyez leur pondération, leur avancement et, en fin de cycle, l'évaluation de votre N+1.",
    actions: [{ label: "Mes objectifs", href: "/dashboard/mon-espace/objectifs" }],
    liees: ["deroulement-evaluation", "ponderation"],
  },
  {
    id: "deroulement-evaluation",
    categorie: "evaluations",
    question: "Comment se déroule l'évaluation annuelle ?",
    motsCles: ["deroulement", "etapes evaluation", "campagne", "cycle", "comment ca marche evaluation", "auto evaluation", "arbitrage", "n+2"],
    reponse:
      "Une campagne se déroule en plusieurs étapes :\n1. Votre **N+1 fixe vos objectifs** (pondérés, total 100 %).\n2. En fin de période, il **évalue** chaque objectif.\n3. Le **N+2** donne son avis.\n4. Vous **prenez connaissance** de l'évaluation et donnez votre accord… ou exprimez un désaccord.\n5. En cas de désaccord, la **RH arbitre**.",
    actions: [{ label: "Mon espace Performances", href: "/dashboard/mon-espace" }],
    liees: ["mes-objectifs", "desaccord-evaluation"],
  },
  {
    id: "ponderation",
    categorie: "evaluations",
    question: "Pourquoi je ne peux pas transmettre les objectifs ?",
    motsCles: ["ponderation", "100", "transmettre objectifs", "bloque", "total", "pourcentage", "equilibrer"],
    reponse:
      "La transmission est bloquée tant que le **total des pondérations n'est pas exactement de 100 %**.\n\nAjustez les pourcentages, ou utilisez le bouton **Équilibrer (100 %)** pour répartir automatiquement.",
    liees: ["deroulement-evaluation"],
  },
  {
    id: "desaccord-evaluation",
    categorie: "evaluations",
    question: "Je ne suis pas d'accord avec mon évaluation",
    motsCles: ["pas d'accord", "desaccord", "contester", "contestation", "litige", "arbitrage", "injuste"],
    reponse:
      "Lors de la prise de connaissance, vous pouvez indiquer votre **désaccord** et le motiver. Le dossier part alors en **arbitrage RH**, qui tranche après avoir étudié les éléments.",
    liees: ["deroulement-evaluation", "contacter-rh"],
  },

  // ─── Pièces de caisse ──────────────────────────────────────
  {
    id: "avance-caisse",
    categorie: "caisse",
    question: "Comment demander une avance de caisse ?",
    motsCles: ["avance de caisse", "avance", "caisse", "argent", "sortie de caisse", "especes"],
    reponse:
      "L'application **Pièces de caisse** arrive bientôt sur le portail. Le circuit prévu :\n1. Votre demande de sortie de caisse\n2. Validation de votre **supérieur**\n3. Validation de la **Trésorerie**, puis du **DFC**, puis du **DG**\n4. Édition de la pièce et remise des fonds par le **caissier**\n\nEn attendant, adressez-vous à la Direction Financière.",
    liees: ["depense-caisse"],
  },
  {
    id: "depense-caisse",
    categorie: "caisse",
    question: "Comment me faire rembourser une dépense ?",
    motsCles: ["depense", "rembourser", "remboursement", "facture", "justificatif", "note de frais", "frais"],
    reponse:
      "Pour une **dépense de caisse**, il faudra joindre vos justificatifs scannés (factures, reçus) dès la demande. Elle passera par votre supérieur, la Trésorerie, le DFC et le DG, puis sera comptabilisée.\n\nL'application arrive bientôt ; en attendant, adressez-vous à la Direction Financière.",
    liees: ["avance-caisse"],
  },

  // ─── Portail & compte ──────────────────────────────────────
  {
    id: "trouver-collegue",
    categorie: "portail",
    question: "Comment trouver un collègue ?",
    motsCles: ["trouver", "collegue", "annuaire", "trombinoscope", "contact", "numero", "telephone", "email de", "qui est"],
    reponse:
      "Utilisez le **Trombinoscope** : recherchez par nom, poste ou direction, puis contactez la personne en un clic sur **Teams** ou par **e-mail**.\n\nAstuce : la barre de recherche en haut du portail trouve aussi les personnes.",
    actions: [{ label: "Ouvrir le trombinoscope", href: "/portail/annuaire" }],
  },
  {
    id: "connexion",
    categorie: "portail",
    question: "Je n'arrive pas à me connecter",
    motsCles: ["connexion", "connecter", "mot de passe", "login", "sso", "microsoft", "acces", "bloque compte", "deconnecte"],
    reponse:
      "Le portail utilise votre **compte Microsoft Agilly** (le même que Outlook et Teams) : il n'y a pas de mot de passe spécifique.\n- Vérifiez que vous choisissez bien votre adresse **@agilly**.\n- Si votre session a expiré, déconnectez-vous puis reconnectez-vous.\n- Si le problème persiste, contactez le **support informatique**.",
    liees: ["infos-incorrectes"],
  },
  {
    id: "infos-incorrectes",
    categorie: "portail",
    question: "Mon poste ou mon responsable est incorrect",
    motsCles: ["poste incorrect", "mauvais manager", "responsable incorrect", "mauvaise direction", "photo", "informations fausses", "profil"],
    reponse:
      "Vos informations (poste, direction, responsable, photo) proviennent de **Microsoft 365**. Pour les corriger, contactez la **RH** ou le **support informatique**, qui mettront à jour l'annuaire. La correction apparaîtra automatiquement sur le portail.",
    actions: [{ label: "Mon profil", href: "/dashboard/mon-espace/profil" }],
    liees: ["contacter-rh"],
  },
  {
    id: "applications",
    categorie: "portail",
    question: "Quelles applications sont disponibles ?",
    motsCles: ["applications", "outils", "apps", "disponible", "que puis je faire", "portail"],
    reponse:
      "Aujourd'hui sur le portail :\n- **Performances** : évaluations et objectifs\n- **Absences & Congés** : demandes et soldes\n- **Missions & Interventions** : ordres de mission\n- **Trombinoscope** : l'équipe Agilly\n\nBientôt : **Pièces de caisse** et **Évaluation des compétences**.",
    actions: [{ label: "Retour à l'accueil", href: "/portail" }],
  },

  // ─── RH ────────────────────────────────────────────────────
  {
    id: "contacter-rh",
    categorie: "rh",
    question: "Comment contacter la RH ?",
    motsCles: ["contacter rh", "ressources humaines", "parler a quelqu'un", "humain", "aide", "drh", "probleme", "reclamation"],
    reponse:
      "Retrouvez l'équipe de la **Direction des Ressources Humaines** dans le trombinoscope (filtre « Ressources Humaines ») et contactez-la directement sur Teams ou par e-mail.",
    actions: [{ label: "Voir l'équipe RH", href: "/portail/annuaire" }],
  },
];

/** Questions affichées à l'ouverture de l'assistant */
export const SUGGESTIONS_ACCUEIL = ["poser-conge", "voir-solde", "deroulement-evaluation", "trouver-collegue"];
