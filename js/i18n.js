/**
 * SMARTSERVICES Schools - Internationalization
 * Supports: Français (fr), العربية (ar), English (en)
 */
const I18n = (function() {
  const STORAGE_KEY = 'smartschools_lang';
  let currentLang = 'fr';

  const translations = {
    fr: {
      meta: {
        indexTitle: 'SMARTSERVICES Schools - Tous les services de votre établissement en un seul endroit',
        servicesTitle: 'SMARTSERVICES Schools - Services',
        contactTitle: 'SMARTSERVICES Schools - Contact',
        faqTitle: 'SMARTSERVICES Schools - FAQ',
        fonctionnementTitle: 'SMARTSERVICES Schools - Comment ça marche',
        appTitle: 'SMARTSERVICES Schools - Services'
      },
      nav: {
        home: 'Accueil',
        services: 'Services',
        howItWorks: 'Fonctionnement',
        contact: 'Contact',
        login: 'Connexion',
        signup: 'Créer un compte',
        logout: 'Déconnexion',
        myProfile: 'Mon profil'
      },
      hero: {
        subtitle: 'SMARTSERVICES Schools',
        indexTitle: 'Tous les services de votre établissement... <span class="orange">en un seul endroit.</span>',
        servicesTitle: 'Nos <span class="orange">Services</span>',
        contactTitle: 'Contactez-<span class="orange">nous</span>',
        contactDesc: 'Une question ? Besoin d\'informations ? Notre équipe est à votre disposition pour vous accompagner.',
        howTitle: 'Comment ça <span class="orange">marche ?</span>',
        howDesc: 'Notre plateforme simplifie la gestion des services opérationnels de votre établissement en 3 étapes simples.',
        indexDesc: 'Une plateforme   dédiée aux écoles publiques, privées et établissements d\'enseignement au Maroc. Centralisez toutes vos demandes de services opérationnels et simplifiez votre gestion.',
        createAccount: 'Créer un compte',
        signIn: 'Se connecter',
        quickRequest: 'Demande rapide'
      },
      services: {
        sectionTitle: 'Nos <span class="orange">Services</span>',
        sectionSubtitle: 'Tous les services opérationnels dont votre établissement a besoin, réunis sur une seule plateforme.',
        requestBtn: 'Demander ce service',
        customRequestBtn: 'Faire une demande',
        supplies: {
          title: 'Fournitures de bureau',
          desc: 'Papeterie, cartouches d\'encre, classeurs, fournitures administratives, mobilier de bureau.'
        },
        printing: {
          title: 'Services d\'impression',
          desc: 'Services d\'impression professionnelle pour tous vos besoins.'
        },
        events: {
          title: 'Organisation d\'événements',
          desc: 'Organisation complète de vos événements scolaires.'
        },
        gifts: {
          title: 'Cadeaux & Récompenses scolaires',
          desc: 'Trophées, médailles, coupes, certificats, cadeaux de fin d\'année, lots de remise des prix.'
        },
        giveaways: {
          title: 'Produits personnalisés',
          desc: 'Articles promotionnels personnalisés avec le logo de votre établissement.'
        },
        repair: {
          title: 'Réparation d\'ordinateurs et de caméras',
          desc: 'Réparation et maintenance d\'ordinateurs et de caméras.'
        },
        wifi: {
          title: 'Installation et réparation de réseaux Wi-Fi',
          desc: 'Installation, réparation et optimisation de réseaux Wi-Fi.'
        },
        photo: {
          title: 'Photographie & Documentation',
          desc: 'Photos scolaires, couverture d\'événements, vidéos institutionnelles, documentation pédagogique.'
        },
        printer: {
          title: 'Maintenance des imprimantes',
          desc: 'Réparation et maintenance de toutes marques d\'imprimantes.'
        },
        programming: {
          title: 'Services de développement logiciel',
          desc: 'Développement de sites web, applications mobiles, logiciels de gestion, solutions e-learning et plateformes sur mesure.'
        },
        consulting: {
          title: 'Consulting',
          desc: 'Conseil en gestion scolaire, audit des processus, accompagnement à la transformation numérique.'
        },
        custom: {
          title: 'Demander un service personnalisé',
          desc: 'Vous ne trouvez pas ce que vous cherchez ? Décrivez-nous votre besoin et nous vous trouverons la solution.'
        }
      },
      steps: {
        sectionTitle: 'Comment ça <span class="orange">marche ?</span>',
        step1Title: 'Vous soumettez une demande',
        step1Desc: 'Choisissez le service dont vous avez besoin et remplissez un formulaire simple et rapide.',
        step2Title: 'Nous gérons l\'exécution',
        step2Desc: 'Notre équipe prend en charge votre demande et coordonne les meilleurs prestataires.',
        step3Title: 'Vous recevez votre service',
        step3Desc: 'Suivez l\'avancement de votre demande et recevez votre service dans les délais impartis.'
      },
      benefits: {
        sectionTitle: 'Pourquoi <span class="orange">SMARTSERVICES Schools ?</span>',
        timeTitle: 'Gain de temps',
        timeDesc: 'Plus besoin de contacter plusieurs fournisseurs. Une seule plateforme pour tous vos besoins.',
        costTitle: 'Optimisation des coûts',
        costDesc: 'Des tarifs négociés grâce à notre réseau de partenaires et notre volume d\'achats groupés.',
        trackingTitle: 'Suivi transparent',
        trackingDesc: 'Suivez l\'état de toutes vos demandes en temps réel depuis votre tableau de bord.',
        supportTitle: 'Accompagnement dédié',
        supportDesc: 'Un responsable de compte dédié pour vous accompagner à chaque étape.'
      },
      process: {
        sectionTitle: 'Notre <span class="orange">Processus</span>',
        sectionSubtitle: 'Un processus transparent et efficace pour chaque service',
        submitTitle: 'Soumission de la demande',
        submitDesc: 'Sélectionnez votre service, remplissez le formulaire avec les détails nécessaires et soumettez votre demande en quelques clics.',
        reviewTitle: 'Examen et validation',
        reviewDesc: 'Notre équipe examine votre demande, valide les détails et commence le processus de traitement sous 24h.',
        executeTitle: 'Coordination et exécution',
        executeDesc: 'Nous sélectionnons les meilleurs prestataires et coordonnons l\'exécution de votre demande avec suivi en temps réel.',
        deliverTitle: 'Livraison et suivi',
        deliverDesc: 'Recevez votre service dans les délais convenus et accédez à tous les documents de suivi depuis votre tableau de bord.'
      },
      cta: {
        title: 'Prêt à simplifier la gestion de votre établissement ?',
        subtitle: 'Rejoignez les écoles qui nous font déjà confiance au Maroc.',
        btn: 'Créer un compte gratuitement'
      },
      contact: {
        phone: 'Téléphone',
        email: 'Email'
      },
      faq: {
        q1Title: 'Comment créer un compte ?'
      },
      footer: {
        services: 'Services',
        company: 'Entreprise',
        contact: 'Contact',
        desc: 'La plateforme   qui centralise tous les services opérationnels pour les établissements scolaires au Maroc.',
        about: 'À propos',
        howItWorks: 'Comment ça marche',
        faq: 'FAQ',
        location: 'Tanger, Maroc',
        copyright: 'WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri'
      },
      auth: {
        loginTitle: 'Connexion',
        signupTitle: 'Créer un compte',
        email: 'Email',
        password: 'Mot de passe',
        loginBtn: 'Se connecter',
        signupBtn: 'Créer mon compte',
        fullName: 'Nom complet',
        school: 'Établissement',
        phone: 'Téléphone',
        confirmPassword: 'Confirmer le mot de passe',
        noAccount: 'Pas encore de compte ?',
        hasAccount: 'Déjà un compte ?',
        emailPlaceholder: 'votre@email.com',
        passwordPlaceholder: 'Votre mot de passe',
        passwordMinPlaceholder: 'Min. 6 caractères',
        confirmPlaceholder: 'Répétez le mot de passe',
        schoolPlaceholder: 'Nom de l\'école',
        phonePlaceholder: '+212 6XX XX XX XX',
        namePlaceholder: 'Votre nom'
      },
      form: {
        newRequest: 'Nouvelle demande',
        submit: 'Soumettre la demande',
        backToServices: 'Retour aux services',
        successTitle: 'Demande soumise avec succès',
        successMsg: 'Votre demande a été soumise avec succès ! Un responsable SMARTSERVICES vous contactera dans les plus brefs délais.',
        schoolName: 'Nom de l\'établissement',
        schoolPlaceholder: 'Ex: Groupe Scolaire........................',
        city: 'Ville',
        cityPlaceholder: 'Ex: Casablanca',
        contactName: 'Nom du contact',
        emailPlaceholder: 'contact@etablissement.ma',
        description: 'Description détaillée du besoin',
        descPlaceholder: 'Décrivez précisément ce dont vous avez besoin...',
        attachFiles: 'Joindre des documents (PDF, Images)',
        uploadText: 'Glissez vos fichiers ici ou cliquez pour parcourir',
        uploadHint: 'PDF, PNG, JPG, JPEG, GIF, WEBP (max 10MB par fichier)',
        desiredDate: 'Date souhaitée'
      },
      formFields: {
        rewardType: 'Type de récompense souhaitée',
        estimatedQuantity: 'Quantité estimée',
        suppliesType: 'Type de fournitures',
        estimatedBudget: 'Budget estimé (MAD)',
        articleType: 'Type d\'article',
        printType: 'Type d\'impression',
        eventType: 'Type d\'événement',
        estimatedParticipants: 'Nombre de participants estimé',
        equipmentType: 'Type d\'équipement',
        equipmentCount: 'Nombre d\'équipements',
        interventionType: 'Type d\'intervention',
        coverageSurface: 'Surface à couvrir (m²)',
        prestationType: 'Type de prestation',
        estimatedHours: 'Durée estimée (heures)',
        printerCount: 'Nombre d\'imprimantes',
        consultingDomain: 'Domaine de consulting',
        estimatedDays: 'Durée estimée (jours)',
        serviceCategory: 'Catégorie du service',
        printerBrand: 'Marque de l\'imprimante',
        issueType: 'Type de problème',
        awardType: 'Type de prix',
        occasion: 'Occasion',
        paperType: 'Type de papier',
        writingTools: 'Outils d\'écriture',
        organizationArchiving: 'Organisation et archivage',
        officeSupplies: 'Fournitures de bureau',
        printingSupplies: 'Fournitures d\'impression',
        classroomSupplies: 'Fournitures de classe',
        softwareService: 'Service de développement',
        requiredServices: 'Services requis'
      },
      options: {
        // Printing Services
        certificates: 'Certificats',
        appreciationCertificates: 'Attestations de mérite',
        cards: 'Cartes',
        rollUp: 'Roll-up',
        banners: 'Bannières',
        posters: 'Affiches',
        notebooks: 'Cahiers',
        files: 'Dossiers',
        envelopes: 'Enveloppes',
        bags: 'Sacs',
        mugs: 'Tasses',
        tshirts: 'T-shirts',
        trophiesAndMedals: 'Trophées et médailles',
        trophies: 'Trophées',
        medals: 'Médailles',
        cups: 'Coupes',
        prizePacks: 'Lots de remise des prix',
        
        // Event Organization
        endOfYearCeremony: 'Fête de fin d\'année',
        graduationCeremony: 'Cérémonie de remise des diplômes',
        openDay: 'Journée portes ouvertes',
        educationalActivity: 'Activité éducative',
        exhibition: 'Exposition',
        competition: 'Concours',
        entertainment: 'Animation',
        decoration: 'Décoration',
        stage: 'Scène',
        soundSystem: 'Sonorisation',
        lighting: 'Éclairage',
        photography: 'Photographie',
        catering: 'Restauration',
        eventGifts: 'Cadeaux',
        
        // Computer and Camera Repair
        desktopComputer: 'Ordinateur de bureau',
        laptop: 'Ordinateur portable',
        securityCamera: 'Caméra de surveillance',
        camera: 'Caméra professionnelle',
        monitor: 'Écran',
        otherDevice: 'Autre appareil',
        
        // Wi-Fi Installation and Repair
        newNetworkInstallation: 'Installation d\'un nouveau réseau',
        networkRepair: 'Réparation réseau',
        coverageExtension: 'Extension de couverture',
        signalBoost: 'Renforcement du signal',
        deviceConfiguration: 'Configuration des appareils',
        networkCameras: 'Caméras réseau',
        
        // Printer Maintenance
        hp: 'HP',
        canon: 'Canon',
        epson: 'Epson',
        brother: 'Brother',
        xerox: 'Xerox',
        ricoh: 'Ricoh',
        otherBrand: 'Autre',
        notPrinting: 'N\'imprime pas',
        poorPrintQuality: 'Mauvaise qualité d\'impression',
        paperJam: 'Bourrage papier',
        inkProblem: 'Problème d\'encre',
        networkIssue: 'Problème réseau',
        preventiveMaintenance: 'Maintenance préventive',
        
        // Awards and Recognition
        trophy: 'Coupe',
        medal: 'Médaille',
        shield: 'Bouclier d\'honneur',
        cashPrize: 'Prix en espèces',
        books: 'Livres',
        schoolSupplies: 'Fournitures scolaires',
        electronics: 'Appareils électroniques',
        
        // School and Office Supplies
        paperType: 'Type de papier',
        writingTools: 'Outils d\'écriture',
        organizationArchiving: 'Organisation et archivage',
        officeSupplies: 'Fournitures de bureau',
        printingSupplies: 'Fournitures d\'impression',
        classroomSupplies: 'Fournitures de classe',
        paperA4: 'Papier A4',
        paperA3: 'Papier A3',
        coloredPaper: 'Papier coloré',
        cardboardPaper: 'Papier cartonné',
        notebooks: 'Cahiers',
        dryPens: 'Stylos à bille',
        pencil: 'Crayons',
        whiteboardMarkers: 'Marqueurs pour tableau blanc',
        eraser: 'Gommes',
        sharpener: 'Taille-crayons',
        correction: 'Correcteur',
        coloringPens: 'Stylos de couleur',
        files: 'Fichiers',
        documentHolders: 'Porte-documents',
        folders: 'Dossiers',
        archiveBoxes: 'Boîtes d\'archives',
        fileSeparators: 'Séparateurs de fichiers',
        pins: 'Épingles',
        paperClips: 'Trombones',
        stapler: 'Agrafeuse',
        tape: 'Ruban adhésif',
        scissors: 'Ciseaux',
        glue: 'Colle',
        ruler: 'Règle',
        calculator: 'Calculatrice',
        ink: 'Encre',
        toner: 'Toner',
        inkCartridges: 'Cartouches d\'encre',
        stationery: 'Papeterie',
        bindersStorage: 'Classeurs et rangement',
        officeFurniture: 'Mobilier de bureau',
        adminSupplies: 'Fournitures administratives',
        specialPrintingPaper: 'Papier spécial impression',
        adhesiveLabels: 'Étiquettes adhésives',
        whiteboards: 'Tableaux blancs',
        whiteboardEraser: 'Effaceur de tableau',
        chalk: 'Craie',
        whiteboardMagnets: 'Magnets pour tableau',
        educationalIndicators: 'Indicateurs éducatifs',
        
        // Customized Products
        customPens: 'Stylos personnalisés',
        customBags: 'Sacs personnalisés',
        customNotebooks: 'Cahiers personnalisés',
        customMugs: 'Mugs personnalisés',
        toteBags: 'Sacs cabas',
        badges: 'Badges',
        lanyards: 'Lanières',
        waterBottles: 'Gourdes',
        customTshirts: 'T-shirts personnalisés',
        caps: 'Casquettes',
        stickers: 'Autocollants',
        bookmarks: 'Marque-pages',
        calendars: 'Calendriers',
        keychains: 'Porte-clés',
        
        // Software Development Services
        websiteDesign: 'Conception de sites web',
        schoolPlatform: 'Plateforme scolaire',
        mobileApp: 'Application mobile',
        studentManagementSystem: 'Système de gestion des élèves',
        teacherManagementSystem: 'Système de gestion des enseignants',
        invoicingSystem: 'Système de facturation',
        onlineRegistrationSystem: 'Système d\'inscription en ligne',
        appointmentBookingSystem: 'Système de réservation',
        elearningPlatform: 'Plateforme e-learning',
        notificationsSystem: 'Système de notifications',
        securityImprovement: 'Amélioration de la sécurité',
        customSoftware: 'Logiciel personnalisé',
        softwareUpdate: 'Mise à jour de logiciel',
        bugFixing: 'Correction de bugs',
        systemsIntegration: 'Intégration de systèmes',
        
        // Common
        other: 'Autre',
        schoolManagement: 'Gestion scolaire',
        processAudit: 'Audit des processus',
        digitalTransformation: 'Transformation numérique',
        staffTraining: 'Formation du personnel',
        generalServices: 'Services généraux',
        equipment: 'Équipement',
        training: 'Formation',
        maintenance: 'Maintenance',
        schoolPhotos: 'Photos scolaires',
        eventCoverage: 'Couverture d\'événement',
        institutionalVideo: 'Vidéo institutionnelle',
        educationalDocumentation: 'Documentation pédagogique',
        repair: 'Réparation',
        spareParts: 'Fourniture de pièces',
        newInstallation: 'Nouvelle installation',
        troubleshooting: 'Dépannage',
        networkOptimization: 'Optimisation du réseau',
        awardCeremony: 'Cérémonie de remise des prix',
        openDayEvent: 'Journée portes ouvertes',
        conference: 'Conférence',
        schoolTrip: 'Sortie scolaire',
        yearEndParty: 'Fête de fin d\'année',
        customPrints: 'Impressions personnalisées',
        signage: 'Signalétique',
        flyers: 'Flyers',
        businessCards: 'Cartes de visite',
        books: 'Livres',
        uniforms: 'Uniformes',
        brandedClothes: 'Vêtements aux couleurs de l\'établissement',
        topStudents: 'Élèves méritants',
        culturalCompetition: 'Concours culturel',
        sportsCompetition: 'Concours sportif',
        quranMemorization: 'Mémorisation du Coran',
        behaviorExcellence: 'Excellence en comportement',
        attendanceExcellence: 'Excellence en assiduité',
        artCompetition: 'Concours artistique',
        scientificCompetition: 'Concours scientifique',
        networkEquipment: 'Équipement réseau',
        privateSchool: 'Établissement privé',
        publicSchool: 'Établissement public',
        trainingInstitute: 'Institut de formation',
        french: 'Français',
        arabic: 'Arabe',
        english: 'Anglais'
      },
      app: {
        ourServices: 'Nos Services',
        myRequests: 'Mes demandes',
        invoices: 'Factures',
        sidebarServices: 'Services',
        sidebarRequests: 'Mes demandes',
        sidebarInvoices: 'Factures',
        sidebarArchives: 'Archives',
        sidebarProfile: 'Mon profil',
        sidebarLogout: 'Déconnexion',
        requestNum: 'N° Demande',
        service: 'Service',
        submitDate: 'Date de soumission',
        status: 'Statut',
        action: 'Action',
        noRequests: 'Aucune demande pour le moment',
        noRequestsDesc: 'Les demandes que vous soumettez apparaîtront ici. Commencez par parcourir nos services.',
        invoiceNum: 'N° Facture',
        date: 'Date',
        amount: 'Montant',
        paymentStatus: 'Statut paiement',
        noInvoices: 'Aucune facture pour le moment',
        noInvoicesDesc: 'Les factures liées à vos demandes apparaîtront ici une fois traitées.',
        profile: 'Profil de l\'établissement',
        schoolType: 'Type d\'établissement',
        directorName: 'Nom du directeur',
        secondaryPhone: 'Téléphone secondaire',
        address: 'Adresse',
        preferredLang: 'Langue préférée',
        saveChanges: 'Enregistrer les modifications'
      },
      admin: {
        panel: 'Panneau d\'administration',
        search: 'Rechercher...',
        notifications: 'Notifications',
        notificationsTitle: 'Notifications',
        markAllRead: 'Tout marquer lu',
        noNotifications: 'Aucune notification',
        toggleTheme: 'Changer le thème',
        loading: 'Chargement...',
        login: {
          title: 'Connexion administrateur',
          subtitle: 'Accès administrateur',
          email: 'Email',
          emailPlaceholder: 'admin@school.com',
          password: 'Mot de passe',
          passwordPlaceholder: 'Entrez votre mot de passe',
          signIn: 'Se connecter',
          secure: 'Authentification sécurisée administrateur',
          invalidCredentials: 'Email ou mot de passe invalide'
        },
        sidebar: {
          main: 'Principal',
          dashboard: 'Tableau de bord',
          requests: 'Demandes',
          allRequests: 'Toutes les demandes',
          users: 'Utilisateurs',
          allUsers: 'Tous les utilisateurs',
          services: 'Services',
          manageServices: 'Gérer les services',
          insights: 'Aperçus',
          analytics: 'Analytiques',
          system: 'Système',
          settings: 'Paramètres'
        },
        dashboard: {
          title: 'Tableau de bord',
          subtitle: 'Aperçu de l\'activité de la plateforme',
          export: 'Exporter',
          totalRequests: 'Total des demandes',
          activeRequests: 'Demandes actives',
          completed: 'Terminées',
          totalUsers: 'Total utilisateurs',
          quotations: 'Devis',
          revenueEstimate: 'Revenu estimé',
          requestsByMonth: 'Demandes par mois',
          recentActivity: 'Activité récente',
          requestsByService: 'Demandes par service',
          statusDistribution: 'Répartition des statuts'
        },
        requests: {
          title: 'Gestion des demandes',
          subtitle: 'Gérer toutes les demandes de service',
          exportCSV: 'Exporter CSV',
          search: 'Rechercher des demandes...',
          allStatuses: 'Tous les statuts',
          allPriorities: 'Toutes les priorités',
          allServices: 'Tous les services',
          pending: 'En attente',
          underReview: 'En examen',
          waitingInfo: 'En attente d\'infos',
          approved: 'Approuvée',
          inProgress: 'En cours',
          completed: 'Terminée',
          cancelled: 'Annulée',
          low: 'Basse',
          normal: 'Normale',
          high: 'Haute',
          urgent: 'Urgente',
          critical: 'Critique',
          id: 'Demande #',
          school: 'Établissement',
          service: 'Service',
          priority: 'Priorité',
          status: 'Statut',
          created: 'Créée le',
          attachments: 'Pièces jointes',
          quotation: 'Devis',
          actions: 'Actions'
        },
        pending: {
          title: 'Demandes en attente',
          subtitle: 'Demandes nécessitant une action'
        },
        inProgress: {
          title: 'En cours',
          subtitle: 'Demandes actives en traitement'
        },
        completed: {
          title: 'Terminées',
          subtitle: 'Demandes complétées avec succès'
        },
        cancelled: {
          title: 'Annulées',
          subtitle: 'Demandes annulées'
        },
        users: {
          title: 'Gestion des utilisateurs',
          subtitle: 'Gérer tous les utilisateurs de la plateforme',
          search: 'Rechercher des utilisateurs...',
          exportCSV: 'Exporter CSV',
          allRoles: 'Tous les rôles',
          admin: 'Admin',
          user: 'Utilisateur',
          allStatuses: 'Tous les statuts',
          active: 'Actif',
          suspended: 'Suspendu',
          archived: 'Archivé'
        },
        administrators: {
          title: 'Administrateurs',
          subtitle: 'Administrateurs de la plateforme'
        },
        schools: {
          title: 'Établissements',
          subtitle: 'Établissements et institutions inscrits'
        },
        servicesPage: {
          title: 'Gestion des services',
          subtitle: 'Gérer les catégories de services'
        },
        quotations: {
          title: 'Devis',
          subtitle: 'Gérer les devis téléchargés',
          exportCSV: 'Exporter CSV'
        },
        analyticsPage: {
          title: 'Analytiques',
          subtitle: 'Métriques de performance de la plateforme',
          conversionRate: 'Taux de conversion',
          requestsByMonthTitle: 'Demandes par mois (cette année)'
        },
        settingsPage: {
          title: 'Paramètres',
          subtitle: 'Configuration du système',
          appearance: 'Apparence',
          darkMode: 'Mode sombre',
          darkModeDesc: 'Basculer entre le thème clair et sombre',
          toggle: 'Basculer',
          account: 'Compte',
          session: 'Session',
          sessionDesc: 'Vous êtes connecté en tant qu\'administrateur',
          logout: 'Déconnexion'
        },
        auditLogs: {
          title: 'Journaux d\'audit',
          subtitle: 'Suivre toutes les actions administratives'
        },
        table: {
          id: 'ID',
          requestId: 'Demande #',
          school: 'Établissement',
          service: 'Service',
          priority: 'Priorité',
          status: 'Statut',
          created: 'Créée le',
          completed: 'Terminée le',
          cancelled: 'Annulée le',
          attachments: 'Pièces jointes',
          quotation: 'Devis',
          actions: 'Actions',
          user: 'Utilisateur',
          email: 'Email',
          role: 'Rôle',
          joined: 'Inscrit le',
          contact: 'Contact',
          nameFR: 'Nom (FR)',
          key: 'Clé',
          nameEN: 'Nom (EN)',
          nameAR: 'Nom (AR)',
          version: 'Version',
          uploaded: 'Téléchargé le',
          file: 'Fichier',
          timestamp: 'Date/heure',
          action: 'Action',
          entity: 'Entité',
          lastLogin: 'Dernière connexion',
          never: 'Jamais',
          description: 'Description',
          quotationDoc: 'Document du devis',
          download: 'Télécharger'
        },
        modal: {
          editUser: 'Modifier l\'utilisateur',
          editRequest: 'Modifier la demande',
          editService: 'Modifier le service',
          requestDetails: 'Détails de la demande',
          userProfile: 'Profil utilisateur',
          fullName: 'Nom complet',
          email: 'Email',
          school: 'Établissement',
          phone: 'Téléphone',
          role: 'Rôle',
          status: 'Statut',
          cancel: 'Annuler',
          save: 'Enregistrer',
          priority: 'Priorité',
          contactName: 'Nom du contact',
          contactEmail: 'Email de contact',
          quoteAmount: 'Montant du devis (MAD)',
          notes: 'Notes',
          nameFR: 'Nom (Français)',
          nameEN: 'Nom (Anglais)',
          nameAR: 'Nom (Arabe)',
          sortOrder: 'Ordre d\'affichage',
          descriptionFR: 'Description (Français)',
          selectDevis: 'Sélectionner le fichier PDF',
          pdfHint: 'PDF uniquement, max 10 Mo',
          browse: 'Parcourir',
          uploading: 'Téléchargement...',
          uploadDevis: 'Télécharger le devis',
          viewCurrent: 'Voir le devis actuel',
          currentDevis: 'Devis actuel',
          uploadedDocs: 'Documents téléchargés'
        },
        toast: {
          loadError: 'Erreur : ',
          loadUsersFailed: 'Échec du chargement des utilisateurs',
          loadDashboardFailed: 'Échec du chargement des données du tableau de bord',
          noDbConnection: 'Base de données non connectée',
          userUpdated: 'Utilisateur mis à jour avec succès',
          deleteUserConfirm: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
          userDeleted: 'Utilisateur supprimé',
          loadAttachmentsFailed: 'Impossible de charger les pièces jointes',
          noRequests: 'Aucune demande pour le moment',
          loadRequestsFailed: 'Échec du chargement des demandes',
          statusUpdated: 'Statut mis à jour',
          loadServicesFailed: 'Échec du chargement des services',
          serviceUpdated: 'Service mis à jour',
          serviceActivated: 'Service activé',
          serviceDeactivated: 'Service désactivé',
          loadQuotationsFailed: 'Échec du chargement des devis',
          loadAnalyticsFailed: 'Échec du chargement des analytiques',
          themeSwitched: 'Thème basculé en',
          noDataExport: 'Aucune donnée à exporter',
          csvExported: 'CSV exporté',
          deleteRequestConfirm: 'Êtes-vous sûr de vouloir supprimer cette demande ?',
          requestUpdated: 'Demande mise à jour avec succès',
          requestDeleted: 'Demande supprimée',
          selectPDF: 'Veuillez d\'abord sélectionner un fichier PDF',
          fileTooLarge: 'La taille du fichier doit être inférieure à 10 Mo',
          devisUploaded: 'Devis téléchargé avec succès',
          devisUploadError: 'Erreur lors du téléchargement du devis',
          deleteQuotationConfirm: 'Supprimer ce devis ?',
          quotationDeleted: 'Devis supprimé',
          deletePermissionError: 'Permission refusée. Ajoutez votre clé service_role dans Paramètres.'
        },
        empty: {
          noData: 'Pas encore de données',
          noActivity: 'Aucune activité récente',
          noUsers: 'Aucun utilisateur trouvé',
          noRequests: 'Aucune demande trouvée',
          noServices: 'Aucun service trouvé',
          noQuotations: 'Aucun devis trouvé',
          noAuditLogs: 'Aucun journal d\'audit'
        }
      }
    },
    ar: {
      meta: {
        indexTitle: 'SMARTSERVICES Schools - جميع خدمات مؤسستكم في مكان واحد',
        servicesTitle: 'SMARTSERVICES Schools - الخدمات',
        contactTitle: 'SMARTSERVICES Schools - اتصل بنا',
        faqTitle: 'SMARTSERVICES Schools - الأسئلة الشائعة',
        fonctionnementTitle: 'SMARTSERVICES Schools - كيف يعمل',
        appTitle: 'SMARTSERVICES Schools - الخدمات'
      },
      nav: {
        home: 'الرئيسية',
        services: 'الخدمات',
        howItWorks: 'كيف يعمل',
        contact: 'اتصل بنا',
        login: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
        myProfile: 'ملفي الشخصي'
      },
      hero: {
        subtitle: 'SMARTSERVICES Schools',
        indexTitle: 'جميع خدمات مؤسستكم... <span class="orange">في مكان واحد.</span>',
        servicesTitle: 'خدماتنا <span class="orange"></span>',
        contactTitle: 'اتصل <span class="orange">بنا</span>',
        contactDesc: 'لديك سؤال؟ بحاجة إلى معلومات؟ فريقنا في خدمتك لمرافقتك.',
        howTitle: 'كيف <span class="orange">يعمل؟</span>',
        howDesc: 'منصتنا تبسّط إدارة الخدمات التشغيلية لمؤسستك في 3 خطوات بسيطة.',
        indexDesc: 'منصة   مخصصة للمدارس العمومية والخصوصية ومؤسسات التعليم في المغرب. وحدّد جميع طلبات الخدمات التشغيلية الخاصة بك ويسّر إدارتك.',
        createAccount: 'إنشاء حساب',
        signIn: 'تسجيل الدخول',
        quickRequest: 'طلب سريع'
      },
      services: {
        sectionTitle: 'خدماتنا',
        sectionSubtitle: 'جميع الخدمات التشغيلية التي تحتاجها مؤسستك، مجمّعة في منصة واحدة.',
        requestBtn: 'اطلب هذه الخدمة',
        customRequestBtn: 'تقديم طلب',
        supplies: {
          title: 'اللوازم المكتبية',
          desc: 'أدوات مكتبية، خراطيش حبر، ملفات، لوازم إدارية، أثاث مكتبي.'
        },
        printing: {
          title: 'خدمات الطباعة',
          desc: 'خدمات طباعة احترافية لجميع احتياجاتك.'
        },
        events: {
          title: 'تنظيم الحفلات',
          desc: 'تنظيم كامل لحفلاتك ومناسباتك المدرسية.'
        },
        gifts: {
          title: 'الهدايا والجوائز المدرسية',
          desc: 'كؤوس، ميداليات، جوائز، شهادات، هدايا نهاية العام، حزم جوائز.'
        },
        giveaways: {
          title: 'المنتجات المخصصة',
          desc: 'منتجات ترويجية مخصصة بشعار مؤسستك.'
        },
        repair: {
          title: 'إصلاح الحواسيب والكاميرات',
          desc: 'إصلاح وصيانة الحواسيب والكاميرات.'
        },
        wifi: {
          title: 'إصلاح وتركيب شبكات Wi-Fi',
          desc: 'تركيب، إصلاح وتحسين شبكات الواي فاي.'
        },
        photo: {
          title: 'التصوير والتوثيق',
          desc: 'صور مدرسية، تغطية الفعاليات، فيديوهات مؤسسية، توثيق تربوي.'
        },
        printer: {
          title: 'صيانة الطابعات',
          desc: 'إصلاح وصيانة جميع أنواع الطابعات.'
        },
        programming: {
          title: 'خدمات تطوير البرمجيات',
          desc: 'تطوير مواقع الويب، تطبيقات الجوال، برامج الإدارة، حلول التعلم الإلكتروني ومنصات مخصصة.'
        },
        consulting: {
          title: 'الاستشارات',
          desc: 'استشارات في الإدارة المدرسية، تدقيق العمليات، مرافقة التحول الرقمي.'
        },
        custom: {
          title: 'طلب خدمة مخصصة',
          desc: 'لم تجد ما تبحث عنه؟ صِف لنا احتياجك وسنجد لك الحل.'
        }
      },
      steps: {
        sectionTitle: 'كيف <span class="orange">يعمل؟</span>',
        step1Title: 'تقوم بتقديم طلب',
        step1Desc: 'اختر الخدمة التي تحتاجها واملأ استمارة بسيطة وسريعة.',
        step2Title: 'نحن نتولى التنفيذ',
        step2Desc: 'فريقنا يتولى طلبك وينسق مع أفضل المزودين.',
        step3Title: 'تستلم خدمتك',
        step3Desc: 'تتبع تقدم طلبك واستلم خدمتك في الوقت المحدد.'
      },
      benefits: {
        sectionTitle: 'لماذا <span class="orange">SMARTSERVICES Schools؟</span>',
        timeTitle: 'توفير الوقت',
        timeDesc: 'لا مزيد من الاتصال بعدة مزودين. منصة واحدة لجميع احتياجاتك.',
        costTitle: 'تحسين التكاليف',
        costDesc: 'أسعار تفاوضية بفضل شبكة شركائنا وحجم المشتريات الجماعية.',
        trackingTitle: 'تتبع شفاف',
        trackingDesc: 'تتبع حالة جميع طلباتك في الوقت الفعلي من لوحة التحكم الخاصة بك.',
        supportTitle: 'دعم مخصص',
        supportDesc: 'مسؤول حساب مخصص لمرافقتك في كل خطوة.'
      },
      process: {
        sectionTitle: '<span class="orange">عمليتنا</span>',
        sectionSubtitle: 'عملية شفافة وفعالة لكل خدمة',
        submitTitle: 'تقديم الطلب',
        submitDesc: 'اختر خدمتك، املأ الاستمارة بالتفاصيل اللازمة وقدّم طلبك ببضع نقرات.',
        reviewTitle: 'المراجعة والموافقة',
        reviewDesc: 'فريقنا يراجع طلبك، يتحقق من التفاصيل ويبدأ عملية المعالجة خلال 24 ساعة.',
        executeTitle: 'التنسيق والتنفيذ',
        executeDesc: 'نختار أفضل المزودين وننسق تنفيذ طلبك مع متابعة في الوقت الفعلي.',
        deliverTitle: 'التسليم والمتابعة',
        deliverDesc: 'استلم خدمتك في الوقت المتفق عليه واطلع على جميع وثائق المتابعة من لوحة التحكم الخاصة بك.'
      },
      cta: {
        title: 'مستعدون لتبسيط إدارة مؤسستكم؟',
        subtitle: 'انضم إلى المدارس التي تثق بنا بالفعل في المغرب.',
        btn: 'إنشاء حساب مجاناً'
      },
      contact: {
        phone: 'الهاتف',
        email: 'البريد الإلكتروني'
      },
      faq: {
        q1Title: 'كيف أنشئ حساباً؟'
      },
      footer: {
        services: 'الخدمات',
        company: 'الشركة',
        contact: 'اتصل بنا',
        desc: 'المنصة   التي توحد جميع الخدمات التشغيلية للمؤسسات التعليمية في المغرب.',
        about: 'حول',
        howItWorks: 'كيف يعمل',
        faq: 'الأسئلة الشائعة',
        location: 'طنجة، المغرب',
        copyright: 'WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri'
      },
      auth: {
        loginTitle: 'تسجيل الدخول',
        signupTitle: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        loginBtn: 'تسجيل الدخول',
        signupBtn: 'إنشاء حسابي',
        fullName: 'الاسم الكامل',
        school: 'المؤسسة',
        phone: 'الهاتف',
        confirmPassword: 'تأكيد كلمة المرور',
        noAccount: 'ليس لديك حساب بعد؟',
        hasAccount: 'لديك حساب بالفعل؟',
        emailPlaceholder: 'بريدك@email.com',
        passwordPlaceholder: 'كلمة المرور',
        passwordMinPlaceholder: '6 أحرف على الأقل',
        confirmPlaceholder: 'أعد كتابة كلمة المرور',
        schoolPlaceholder: 'اسم المدرسة',
        phonePlaceholder: '+212 6XX XX XX XX',
        namePlaceholder: 'اسمك'
      },
      form: {
        newRequest: 'طلب جديد',
        submit: 'إرسال الطلب',
        backToServices: 'العودة إلى الخدمات',
        successTitle: 'تم تقديم الطلب بنجاح',
        successMsg: 'تم تقديم طلبك بنجاح! سيتصل بك مسؤول SMARTSERVICES في أقرب وقت ممكن.',
        schoolName: 'اسم المؤسسة',
        schoolPlaceholder: 'مثال: المجموعة المدرسية الكون',
        city: 'المدينة',
        cityPlaceholder: 'مثال: الدار البيضاء',
        contactName: 'اسم جهة الاتصال',
        emailPlaceholder: 'contact@institution.ma',
        description: 'وصف تفصيلي للاحتياجات',
        descPlaceholder: 'صف بدقة ما تحتاجه...',
        attachFiles: 'إرفاق المستندات (PDF، صور)',
        uploadText: 'اسحب ملفاتك هنا أو انقر للتصفح',
        uploadHint: 'PDF, PNG, JPG, JPEG, GIF, WEBP (الحد الأقصى 10 ميغابايت لكل ملف)',
        desiredDate: 'التاريخ المطلوب'
      },
      formFields: {
        rewardType: 'نوع الجائزة المطلوبة',
        estimatedQuantity: 'الكمية المقدرة',
        suppliesType: 'نوع اللوازم',
        estimatedBudget: 'الميزانية المقدرة (درهم)',
        articleType: 'نوع المقال',
        printType: 'نوع الطباعة',
        eventType: 'نوع الفعالية',
        estimatedParticipants: 'عدد المشاركين المقدر',
        equipmentType: 'نوع المعدات',
        equipmentCount: 'عدد المعدات',
        interventionType: 'نوع التدخل',
        coverageSurface: 'المساحة المراد تغطيتها (م²)',
        prestationType: 'نوع الخدمة',
        estimatedHours: 'المدة المقدرة (ساعات)',
        printerCount: 'عدد الطابعات',
        consultingDomain: 'مجال الاستشارات',
        estimatedDays: 'المدة المقدرة (أيام)',
        serviceCategory: 'فئة الخدمة',
        printerBrand: 'ماركة الطابعة',
        issueType: 'نوع المشكلة',
        awardType: 'نوع الجائزة',
        occasion: 'المناسبة',
        paperType: 'نوع الورق',
        writingTools: 'أدوات الكتابة',
        organizationArchiving: 'التنظيم والأرشفة',
        officeSupplies: 'اللوازم المكتبية',
        printingSupplies: 'مستلزمات الطباعة',
        classroomSupplies: 'مستلزمات القسم',
        softwareService: 'خدمة التطوير',
        requiredServices: 'الخدمات المطلوبة'
      },
      options: {
        // Printing Services
        certificates: 'شهادات',
        appreciationCertificates: 'شواهد تقديرية',
        cards: 'بطاقات',
        rollUp: 'رول أب',
        banners: 'بانرات',
        posters: 'ملصقات',
        notebooks: 'دفاتر',
        files: 'ملفات',
        envelopes: 'أظرفة',
        bags: 'أكياس',
        mugs: 'أكواب',
        tshirts: 'قمصان',
        trophiesAndMedals: 'كؤوس وميداليات',
        trophies: 'كؤوس',
        medals: 'ميداليات',
        cups: 'كؤوس',
        prizePacks: 'جوائز الحفل',
        
        // Event Organization
        endOfYearCeremony: 'حفل نهاية السنة',
        graduationCeremony: 'حفل تخرج',
        openDay: 'يوم مفتوح',
        educationalActivity: 'نشاط تربوي',
        exhibition: 'معرض',
        competition: 'مسابقة',
        entertainment: 'تنشيط',
        decoration: 'ديكور',
        stage: 'منصة',
        soundSystem: 'صوتيات',
        lighting: 'إضاءة',
        photography: 'تصوير',
        catering: 'ضيافة',
        eventGifts: 'هدايا',
        
        // Computer and Camera Repair
        desktopComputer: 'حاسوب مكتبي',
        laptop: 'حاسوب محمول',
        securityCamera: 'كاميرا مراقبة',
        camera: 'كاميرا تصوير',
        monitor: 'شاشة',
        otherDevice: 'جهاز آخر',
        
        // Wi-Fi Installation and Repair
        newNetworkInstallation: 'تركيب شبكة جديدة',
        networkRepair: 'إصلاح شبكة',
        coverageExtension: 'توسيع التغطية',
        signalBoost: 'تقوية الإشارة',
        deviceConfiguration: 'برمجة أجهزة',
        networkCameras: 'كاميرات مرتبطة بالشبكة',
        
        // Printer Maintenance
        hp: 'HP',
        canon: 'Canon',
        epson: 'Epson',
        brother: 'Brother',
        xerox: 'Xerox',
        ricoh: 'Ricoh',
        otherBrand: 'أخرى',
        notPrinting: 'لا تطبع',
        poorPrintQuality: 'جودة الطباعة ضعيفة',
        paperJam: 'انحشار الورق',
        inkProblem: 'مشكلة الحبر',
        networkIssue: 'مشكلة الشبكة',
        preventiveMaintenance: 'صيانة دورية',
        
        // Awards and Recognition
        trophy: 'كأس',
        medal: 'ميدالية',
        shield: 'درع تكريمي',
        cashPrize: 'جائزة عينية',
        books: 'كتب',
        schoolSupplies: 'أدوات مدرسية',
        electronics: 'أجهزة إلكترونية',
        topStudents: 'المتفوقون',
        culturalCompetition: 'مسابقة ثقافية',
        sportsCompetition: 'مسابقة رياضية',
        quranMemorization: 'حفظ القرآن الكريم',
        behaviorExcellence: 'التميز في السلوك',
        attendanceExcellence: 'التميز في المواظبة',
        artCompetition: 'مسابقة فنية',
        scientificCompetition: 'مسابقة علمية',
        
        // School and Office Supplies
        paperType: 'نوع الورق',
        writingTools: 'أدوات الكتابة',
        organizationArchiving: 'التنظيم والأرشفة',
        officeSupplies: 'اللوازم المكتبية',
        printingSupplies: 'مستلزمات الطباعة',
        classroomSupplies: 'مستلزمات القسم',
        paperA4: 'ورق A4',
        paperA3: 'ورق A3',
        coloredPaper: 'ورق ملون',
        cardboardPaper: 'ورق مقوى',
        dryPens: 'أقلام جافة',
        pencil: 'أقلام رصاص',
        whiteboardMarkers: 'أقلام سبورة',
        eraser: 'ممحاة',
        sharpener: 'مبراة',
        correction: 'مصحح',
        coloringPens: 'أقلام تلوين',
        documentHolders: 'حافظات وثائق',
        folders: 'مجلدات',
        archiveBoxes: 'صناديق أرشيف',
        fileSeparators: 'فواصل ملفات',
        pins: 'دبابيس',
        paperClips: 'مشابك ورق',
        stapler: 'دباسة',
        tape: 'شريط لاصق',
        scissors: 'مقص',
        glue: 'غراء',
        ruler: 'مسطرة',
        calculator: 'آلة حاسبة',
        ink: 'أحبار',
        toner: 'تونر',
        inkCartridges: 'خراطيش حبر',
        stationery: 'قرطاسية',
        bindersStorage: 'ملفات وترتيب',
        officeFurniture: 'أثاث مكتبي',
        adminSupplies: 'لوازم إدارية',
        specialPrintingPaper: 'أوراق خاصة بالطباعة',
        adhesiveLabels: 'ملصقات لاصقة',
        whiteboards: 'سبورات',
        whiteboardEraser: 'ممحاة سبورة',
        chalk: 'طباشير',
        whiteboardMagnets: 'مغناطيس سبورة',
        educationalIndicators: 'مؤشرات تعليمية',
        
        // Customized Products
        customPens: 'أقلام مخصصة',
        customBags: 'حقائب مخصصة',
        customNotebooks: 'دفاتر وكراسات',
        customMugs: 'أكواب',
        toteBags: 'حقائب قماشية',
        badges: 'ميداليات تعريفية',
        lanyards: 'حبال تعليق البطاقات',
        waterBottles: 'زجاجات ماء',
        customTshirts: 'قمصان وقبعات',
        caps: 'قبعات',
        stickers: 'ملصقات',
        bookmarks: 'فواصل كتب',
        calendars: 'تقاويم',
        keychains: 'مفاتيح',
        
        // Software Development Services
        websiteDesign: 'تصميم موقع إلكتروني',
        schoolPlatform: 'تطوير منصة مدرسية',
        mobileApp: 'تطوير تطبيق للهاتف',
        studentManagementSystem: 'نظام إدارة التلاميذ',
        teacherManagementSystem: 'نظام إدارة الأساتذة',
        invoicingSystem: 'نظام الفواتير والأداءات',
        onlineRegistrationSystem: 'نظام التسجيل الإلكتروني',
        appointmentBookingSystem: 'نظام حجز المواعيد',
        elearningPlatform: 'منصة التعليم الإلكتروني',
        notificationsSystem: 'نظام الإشعارات والرسائل',
        securityImprovement: 'تحسين الأمان وحماية البيانات',
        customSoftware: 'تطوير برنامج مخصص',
        softwareUpdate: 'تعديل أو تحديث برنامج موجود',
        bugFixing: 'إصلاح أخطاء برمجية',
        systemsIntegration: 'ربط الأنظمة وقواعد البيانات',
        
        // Common
        other: 'أخرى',
        schoolManagement: 'إدارة مدرسية',
        processAudit: 'تدقيق العمليات',
        digitalTransformation: 'تحول رقمي',
        staffTraining: 'تدريب الموظفين',
        generalServices: 'خدمات عامة',
        equipment: 'معدات',
        training: 'تدريب',
        maintenance: 'صيانة',
        schoolPhotos: 'صور مدرسية',
        eventCoverage: 'تغطية فعاليات',
        institutionalVideo: 'فيديو مؤسسي',
        educationalDocumentation: 'توثيق تربوي',
        repair: 'إصلاح',
        spareParts: 'توفير قطع الغيار',
        newInstallation: 'تركيب جديد',
        troubleshooting: 'تشخيص الأعطال',
        networkOptimization: 'تحسين الشبكة',
        awardCeremony: 'حفل توزيع الجوائز',
        openDayEvent: 'يوم الأبواب المفتوحة',
        conference: 'مؤتمر',
        schoolTrip: 'رحلة مدرسية',
        yearEndParty: 'حفل نهاية العام',
        customPrints: 'مطبوعات مخصصة',
        signage: 'لوحات إرشادية',
        flyers: 'منشورات',
        businessCards: 'بطاقات أعمال',
        books: 'كتب',
        uniforms: 'زي موحد',
        brandedClothes: 'ملابس بألوان المؤسسة',
        networkEquipment: 'معدات الشبكة',
        privateSchool: 'مؤسسة خاصة',
        publicSchool: 'مؤسسة عمومية',
        trainingInstitute: 'معهد تكوين',
        french: 'الفرنسية',
        arabic: 'العربية',
        english: 'الإنجليزية'
      },
      app: {
        ourServices: 'خدماتنا',
        myRequests: 'طلباتي',
        invoices: 'الفواتير',
        sidebarServices: 'الخدمات',
        sidebarRequests: 'طلباتي',
        sidebarInvoices: 'الفواتير',
        sidebarArchives: 'الأرشيف',
        sidebarProfile: 'ملفي الشخصي',
        sidebarLogout: 'تسجيل الخروج',
        requestNum: 'رقم الطلب',
        service: 'الخدمة',
        submitDate: 'تاريخ الإرسال',
        status: 'الحالة',
        action: 'إجراء',
        noRequests: 'لا توجد طلبات في الوقت الحالي',
        noRequestsDesc: 'ستظهر الطلبات التي تقدمها هنا. ابدأ بتصفح خدماتنا.',
        invoiceNum: 'رقم الفاتورة',
        date: 'التاريخ',
        amount: 'المبلغ',
        paymentStatus: 'حالة الدفع',
        noInvoices: 'لا توجد فواتير في الوقت الحالي',
        noInvoicesDesc: 'ستظهر الفواتير المرتبطة بطلباتك هنا بمجرد معالجتها.',
        profile: 'ملف المؤسسة',
        schoolType: 'نوع المؤسسة',
        directorName: 'اسم المدير',
        secondaryPhone: 'هاتف ثانوي',
        address: 'العنوان',
        preferredLang: 'اللغة المفضلة',
        saveChanges: 'حفظ التغييرات'
      },
      admin: {
        panel: 'لوحة التحكم',
        search: 'بحث...',
        notifications: 'الإشعارات',
        notificationsTitle: 'الإشعارات',
        markAllRead: 'تحديد الكل كمقروء',
        noNotifications: 'لا توجد إشعارات',
        toggleTheme: 'تغيير السمة',
        loading: 'جارٍ التحميل...',
        login: {
          title: 'تسجيل دخول المشرف',
          subtitle: 'وصول المشرف',
          email: 'البريد الإلكتروني',
          emailPlaceholder: 'admin@school.com',
          password: 'كلمة المرور',
          passwordPlaceholder: 'أدخل كلمة المرور',
          signIn: 'تسجيل الدخول',
          secure: 'مصادقة آمنة للمشرفين',
          invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صالحة'
        },
        sidebar: {
          main: 'الرئيسية',
          dashboard: 'لوحة التحكم',
          requests: 'الطلبات',
          allRequests: 'جميع الطلبات',
          users: 'المستخدمون',
          allUsers: 'جميع المستخدمين',
          services: 'الخدمات',
          manageServices: 'إدارة الخدمات',
          insights: 'الرؤى',
          analytics: 'التحليلات',
          system: 'النظام',
          settings: 'الإعدادات'
        },
        dashboard: {
          title: 'لوحة التحكم',
          subtitle: 'نظرة عامة على نشاط المنصة',
          export: 'تصدير',
          totalRequests: 'إجمالي الطلبات',
          activeRequests: 'الطلبات النشطة',
          completed: 'المكتملة',
          totalUsers: 'إجمالي المستخدمين',
          quotations: 'عروض الأسعار',
          revenueEstimate: 'الإيرادات المقدرة',
          requestsByMonth: 'الطلبات حسب الشهر',
          recentActivity: 'النشاط الأخير',
          requestsByService: 'الطلبات حسب الخدمة',
          statusDistribution: 'توزيع الحالات'
        },
        requests: {
          title: 'إدارة الطلبات',
          subtitle: 'إدارة جميع طلبات الخدمة',
          exportCSV: 'تصدير CSV',
          search: 'البحث عن طلبات...',
          allStatuses: 'جميع الحالات',
          allPriorities: 'جميع الأولويات',
          allServices: 'جميع الخدمات',
          pending: 'قيد الانتظار',
          underReview: 'قيد المراجعة',
          waitingInfo: 'بانتظار المعلومات',
          approved: 'معتمدة',
          inProgress: 'قيد التنفيذ',
          completed: 'مكتملة',
          cancelled: 'ملغاة',
          low: 'منخفضة',
          normal: 'عادية',
          high: 'عالية',
          urgent: 'عاجلة',
          critical: 'حرجة',
          id: 'رقم الطلب',
          school: 'المؤسسة',
          service: 'الخدمة',
          priority: 'الأولوية',
          status: 'الحالة',
          created: 'تاريخ الإنشاء',
          attachments: 'المرفقات',
          quotation: 'عرض السعر',
          actions: 'الإجراءات'
        },
        pending: {
          title: 'الطلبات المعلقة',
          subtitle: 'الطلبات التي تنتظر إجراءً'
        },
        inProgress: {
          title: 'قيد التنفيذ',
          subtitle: 'الطلبات النشطة قيد المعالجة'
        },
        completed: {
          title: 'المكتملة',
          subtitle: 'الطلبات المنجزة بنجاح'
        },
        cancelled: {
          title: 'الملغاة',
          subtitle: 'الطلبات الملغاة'
        },
        users: {
          title: 'إدارة المستخدمين',
          subtitle: 'إدارة جميع مستخدمي المنصة',
          search: 'البحث عن مستخدمين...',
          exportCSV: 'تصدير CSV',
          allRoles: 'جميع الأدوار',
          admin: 'مشرف',
          user: 'مستخدم',
          allStatuses: 'جميع الحالات',
          active: 'نشط',
          suspended: 'موقوف',
          archived: 'مؤرشف'
        },
        administrators: {
          title: 'المشرفون',
          subtitle: 'مشرفو المنصة'
        },
        schools: {
          title: 'المؤسسات',
          subtitle: 'المؤسسات المسجلة'
        },
        servicesPage: {
          title: 'إدارة الخدمات',
          subtitle: 'إدارة فئات الخدمات'
        },
        quotations: {
          title: 'عروض الأسعار',
          subtitle: 'إدارة عروض الأسعار المرفوعة',
          exportCSV: 'تصدير CSV'
        },
        analyticsPage: {
          title: 'التحليلات',
          subtitle: 'مقاييس أداء المنصة',
          conversionRate: 'معدل التحويل',
          requestsByMonthTitle: 'الطلبات حسب الشهر (هذه السنة)'
        },
        settingsPage: {
          title: 'الإعدادات',
          subtitle: 'تكوين النظام',
          appearance: 'المظهر',
          darkMode: 'الوضع المظلم',
          darkModeDesc: 'التبديل بين السمة الفاتحة والداكنة',
          toggle: 'تبديل',
          account: 'الحساب',
          session: 'الجلسة',
          sessionDesc: 'أنت مسجل الدخول كمشرف',
          logout: 'تسجيل الخروج'
        },
        auditLogs: {
          title: 'سجلات التدقيق',
          subtitle: 'تتبع جميع الإجراءات الإدارية'
        },
        table: {
          id: 'المعرف',
          requestId: 'رقم الطلب',
          school: 'المؤسسة',
          service: 'الخدمة',
          priority: 'الأولوية',
          status: 'الحالة',
          created: 'تاريخ الإنشاء',
          completed: 'تاريخ الإكمال',
          cancelled: 'تاريخ الإلغاء',
          attachments: 'المرفقات',
          quotation: 'عرض السعر',
          actions: 'الإجراءات',
          user: 'المستخدم',
          email: 'البريد الإلكتروني',
          role: 'الدور',
          joined: 'تاريخ التسجيل',
          contact: 'جهة الاتصال',
          nameFR: 'الاسم (فرنسي)',
          key: 'المفتاح',
          nameEN: 'الاسم (إنجليزي)',
          nameAR: 'الاسم (عربي)',
          version: 'الإصدار',
          uploaded: 'تاريخ الرفع',
          file: 'الملف',
          timestamp: 'التاريخ والوقت',
          action: 'الإجراء',
          entity: 'الكيان',
          lastLogin: 'آخر تسجيل دخول',
          never: 'أبداً',
          description: 'الوصف',
          quotationDoc: 'مستند عرض السعر',
          download: 'تحميل'
        },
        modal: {
          editUser: 'تعديل المستخدم',
          editRequest: 'تعديل الطلب',
          editService: 'تعديل الخدمة',
          requestDetails: 'تفاصيل الطلب',
          userProfile: 'الملف الشخصي',
          fullName: 'الاسم الكامل',
          email: 'البريد الإلكتروني',
          school: 'المؤسسة',
          phone: 'الهاتف',
          role: 'الدور',
          status: 'الحالة',
          cancel: 'إلغاء',
          save: 'حفظ',
          priority: 'الأولوية',
          contactName: 'اسم جهة الاتصال',
          contactEmail: 'بريد جهة الاتصال',
          quoteAmount: 'مبلغ عرض السعر (درهم)',
          notes: 'ملاحظات',
          nameFR: 'الاسم (الفرنسية)',
          nameEN: 'الاسم (الإنجليزية)',
          nameAR: 'الاسم (العربية)',
          sortOrder: 'ترتيب العرض',
          descriptionFR: 'الوصف (الفرنسية)',
          selectDevis: 'اختيار ملف PDF',
          pdfHint: 'PDF فقط، الحد الأقصى 10 ميغابايت',
          browse: 'تصفح',
          uploading: 'جارٍ الرفع...',
          uploadDevis: 'رفع عرض السعر',
          viewCurrent: 'عرض الحالي',
          currentDevis: 'عرض السعر الحالي',
          uploadedDocs: 'المستندات المرفوعة'
        },
        toast: {
          loadError: 'خطأ: ',
          loadUsersFailed: 'فشل تحميل المستخدمين',
          loadDashboardFailed: 'فشل تحميل بيانات لوحة التحكم',
          noDbConnection: 'قاعدة البيانات غير متصلة',
          userUpdated: 'تم تحديث المستخدم بنجاح',
          deleteUserConfirm: 'هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.',
          userDeleted: 'تم حذف المستخدم',
          loadAttachmentsFailed: 'تعذر تحميل المرفقات',
          noRequests: 'لا توجد طلبات حالياً',
          loadRequestsFailed: 'فشل تحميل الطلبات',
          statusUpdated: 'تم تحديث الحالة',
          loadServicesFailed: 'فشل تحميل الخدمات',
          serviceUpdated: 'تم تحديث الخدمة',
          serviceActivated: 'تم تفعيل الخدمة',
          serviceDeactivated: 'تم إلغاء تفعيل الخدمة',
          loadQuotationsFailed: 'فشل تحميل عروض الأسعار',
          loadAnalyticsFailed: 'فشل تحميل التحليلات',
          themeSwitched: 'تم التبديل إلى',
          noDataExport: 'لا توجد بيانات للتصدير',
          csvExported: 'تم تصدير CSV',
          deleteRequestConfirm: 'هل أنت متأكد من حذف هذا الطلب؟',
          requestUpdated: 'تم تحديث الطلب بنجاح',
          requestDeleted: 'تم حذف الطلب',
          selectPDF: 'الرجاء اختيار ملف PDF أولاً',
          fileTooLarge: 'حجم الملف يجب أن يكون أقل من 10 ميغابايت',
          devisUploaded: 'تم رفع عرض السعر بنجاح',
          devisUploadError: 'خطأ في رفع عرض السعر',
          deleteQuotationConfirm: 'حذف عرض السعر هذا؟',
          quotationDeleted: 'تم حذف عرض السعر',
          deletePermissionError: 'تم رفض الإذن. أضف مفتاح service_role في الإعدادات.'
        },
        empty: {
          noData: 'لا توجد بيانات بعد',
          noActivity: 'لا نشاط حديث',
          noUsers: 'لم يتم العثور على مستخدمين',
          noRequests: 'لم يتم العثور على طلبات',
          noServices: 'لم يتم العثور على خدمات',
          noQuotations: 'لم يتم العثور على عروض أسعار',
          noAuditLogs: 'لا توجد سجلات تدقيق'
        }
      }
    },
    en: {
      meta: {
        indexTitle: 'SMARTSERVICES Schools - All your institution services in one place',
        servicesTitle: 'SMARTSERVICES Schools - Services',
        contactTitle: 'SMARTSERVICES Schools - Contact',
        faqTitle: 'SMARTSERVICES Schools - FAQ',
        fonctionnementTitle: 'SMARTSERVICES Schools - How it works',
        appTitle: 'SMARTSERVICES Schools - Services'
      },
      nav: {
        home: 'Home',
        services: 'Services',
        howItWorks: 'How it works',
        contact: 'Contact',
        login: 'Login',
        signup: 'Create account',
        logout: 'Logout',
        myProfile: 'My profile'
      },
      hero: {
        subtitle: 'SMARTSERVICES Schools',
        indexTitle: 'All your institution services... <span class="orange">in one place.</span>',
        servicesTitle: 'Our <span class="orange">Services</span>',
        contactTitle: 'Contact <span class="orange">Us</span>',
        contactDesc: 'A question? Need information? Our team is at your disposal to assist you.',
        howTitle: 'How does it <span class="orange">work?</span>',
        howDesc: 'Our platform simplifies the management of your institution\'s operational services in 3 simple steps.',
        indexDesc: 'A   platform dedicated to public and private schools, and educational institutions in Morocco. Centralize all your operational service requests and simplify your management.',
        createAccount: 'Create an account',
        signIn: 'Sign in',
        quickRequest: 'Quick request'
      },
      services: {
        sectionTitle: 'Our <span class="orange">Services</span>',
        sectionSubtitle: 'All the operational services your institution needs, gathered in a single platform.',
        requestBtn: 'Request this service',
        customRequestBtn: 'Make a request',
        supplies: {
          title: 'School and Office Supplies',
          desc: 'Notebooks, pens, pencils, books, bags, educational materials, office supplies.'
        },
        printing: {
          title: 'Printing Services',
          desc: 'Professional printing services for all your needs.'
        },
        events: {
          title: 'Event Organization',
          desc: 'Complete organization of your school events.'
        },
        gifts: {
          title: 'Awards and Recognition',
          desc: 'Trophies, medals, cups, certificates, year-end gifts, prize packs, recognition items.'
        },
        giveaways: {
          title: 'Customized Promotional Products',
          desc: 'Custom promotional products with your institution\'s logo.'
        },
        repair: {
          title: 'Computer and Camera Repair',
          desc: 'Desktop and laptop repair, security and professional cameras, monitors, other devices.'
        },
        wifi: {
          title: 'Wi-Fi Installation and Repair',
          desc: 'New network installation, repair, coverage extension, signal boost, device configuration, network cameras.'
        },
        photo: {
          title: 'Photography & Documentation',
          desc: 'School photos, event coverage, institutional videos, educational documentation.'
        },
        printer: {
          title: 'Printer Maintenance',
          desc: 'Repair and maintenance for all printer brands.'
        },
        programming: {
          title: 'Software Development Services',
          desc: 'Website development, mobile apps, management software, e-learning solutions and custom platforms.'
        },
        consulting: {
          title: 'Consulting',
          desc: 'School management consulting, process audits, digital transformation support.'
        },
        custom: {
          title: 'Request a Custom Service',
          desc: 'Can\'t find what you\'re looking for? Describe your needs and we\'ll find you the solution.'
        }
      },
      steps: {
        sectionTitle: 'How does it <span class="orange">work?</span>',
        step1Title: 'You submit a request',
        step1Desc: 'Choose the service you need and fill out a simple, quick form.',
        step2Title: 'We handle the execution',
        step2Desc: 'Our team takes charge of your request and coordinates with the best providers.',
        step3Title: 'You receive your service',
        step3Desc: 'Track the progress of your request and receive your service within the agreed timeframe.'
      },
      benefits: {
        sectionTitle: 'Why <span class="orange">SMARTSERVICES Schools?</span>',
        timeTitle: 'Time Savings',
        timeDesc: 'No more contacting multiple suppliers. One platform for all your needs.',
        costTitle: 'Cost Optimization',
        costDesc: 'Negotiated rates thanks to our partner network and group purchasing volume.',
        trackingTitle: 'Transparent Tracking',
        trackingDesc: 'Track the status of all your requests in real time from your dashboard.',
        supportTitle: 'Dedicated Support',
        supportDesc: 'A dedicated account manager to accompany you at every step.'
      },
      process: {
        sectionTitle: 'Our <span class="orange">Process</span>',
        sectionSubtitle: 'A transparent and efficient process for every service',
        submitTitle: 'Request Submission',
        submitDesc: 'Select your service, fill out the form with the necessary details and submit your request in a few clicks.',
        reviewTitle: 'Review and Validation',
        reviewDesc: 'Our team reviews your request, validates the details and begins the processing within 24 hours.',
        executeTitle: 'Coordination and Execution',
        executeDesc: 'We select the best providers and coordinate the execution of your request with real-time tracking.',
        deliverTitle: 'Delivery and Follow-up',
        deliverDesc: 'Receive your service within the agreed timeframe and access all tracking documents from your dashboard.'
      },
      cta: {
        title: 'Ready to simplify your institution management?',
        subtitle: 'Join the schools that already trust us in Morocco.',
        btn: 'Create a free account'
      },
      contact: {
        phone: 'Phone',
        email: 'Email'
      },
      faq: {
        q1Title: 'How do I create an account?'
      },
      footer: {
        services: 'Services',
        company: 'Company',
        contact: 'Contact',
        desc: 'The   platform that centralizes all operational services for educational institutions in Morocco.',
        about: 'About',
        howItWorks: 'How it works',
        faq: 'FAQ',
        location: 'Tangier, Morocco',
        copyright: 'WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri'
      },
      auth: {
        loginTitle: 'Login',
        signupTitle: 'Create account',
        email: 'Email',
        password: 'Password',
        loginBtn: 'Sign in',
        signupBtn: 'Create my account',
        fullName: 'Full Name',
        school: 'Institution',
        phone: 'Phone',
        confirmPassword: 'Confirm Password',
        noAccount: 'Don\'t have an account yet?',
        hasAccount: 'Already have an account?',
        emailPlaceholder: 'your@email.com',
        passwordPlaceholder: 'Your password',
        passwordMinPlaceholder: 'Min. 6 characters',
        confirmPlaceholder: 'Repeat password',
        schoolPlaceholder: 'School name',
        phonePlaceholder: '+212 6XX XX XX XX',
        namePlaceholder: 'Your name'
      },
      form: {
        newRequest: 'New request',
        submit: 'Submit request',
        backToServices: 'Back to services',
        successTitle: 'Request submitted successfully',
        successMsg: 'Your request has been submitted successfully! A SMARTSERVICES representative will contact you shortly.',
        schoolName: 'Institution Name',
        schoolPlaceholder: 'Ex:........................ School Group',
        city: 'City',
        cityPlaceholder: 'Ex: Casablanca',
        contactName: 'Contact Name',
        emailPlaceholder: 'contact@institution.ma',
        description: 'Detailed Description of Your Needs',
        descPlaceholder: 'Describe precisely what you need...',
        attachFiles: 'Attach Documents (PDF, Images)',
        uploadText: 'Drag your files here or click to browse',
        uploadHint: 'PDF, PNG, JPG, JPEG, GIF, WEBP (max 10MB per file)',
        desiredDate: 'Desired Date'
      },
      formFields: {
        rewardType: 'Desired award type',
        estimatedQuantity: 'Estimated quantity',
        suppliesType: 'Type of supplies',
        estimatedBudget: 'Estimated budget (MAD)',
        articleType: 'Type of article',
        printType: 'Print type',
        eventType: 'Type of event',
        estimatedParticipants: 'Estimated number of participants',
        equipmentType: 'Type of equipment',
        equipmentCount: 'Number of equipment',
        interventionType: 'Type of intervention',
        coverageSurface: 'Area to cover (m²)',
        prestationType: 'Type of service',
        estimatedHours: 'Estimated duration (hours)',
        printerCount: 'Number of printers',
        consultingDomain: 'Consulting domain',
        estimatedDays: 'Estimated duration (days)',
        serviceCategory: 'Service category',
        printerBrand: 'Printer brand',
        issueType: 'Type of issue',
        awardType: 'Award type',
        occasion: 'Occasion',
        paperType: 'Paper type',
        writingTools: 'Writing tools',
        organizationArchiving: 'Organization and archiving',
        officeSupplies: 'Office supplies',
        printingSupplies: 'Printing supplies',
        classroomSupplies: 'Classroom supplies',
        softwareService: 'Software service',
        requiredServices: 'Required services'
      },
      options: {
        // Printing Services
        certificates: 'Certificates',
        appreciationCertificates: 'Appreciation Certificates',
        cards: 'Cards',
        rollUp: 'Roll-up Banner',
        banners: 'Banners',
        posters: 'Posters',
        notebooks: 'Notebooks',
        files: 'Files',
        envelopes: 'Envelopes',
        bags: 'Bags',
        mugs: 'Mugs',
        tshirts: 'T-Shirts',
        trophiesAndMedals: 'Trophies and Medals',
        trophies: 'Trophies',
        medals: 'Medals',
        cups: 'Cups',
        prizePacks: 'Prize packs',
        
        // Event Organization
        endOfYearCeremony: 'End of Year Ceremony',
        graduationCeremony: 'Graduation Ceremony',
        openDay: 'Open Day',
        educationalActivity: 'Educational Activity',
        exhibition: 'Exhibition',
        competition: 'Competition',
        entertainment: 'Entertainment',
        decoration: 'Decoration',
        stage: 'Stage',
        soundSystem: 'Sound System',
        lighting: 'Lighting',
        photography: 'Photography',
        catering: 'Catering',
        eventGifts: 'Gifts',
        
        // Computer and Camera Repair
        desktopComputer: 'Desktop Computer',
        laptop: 'Laptop',
        securityCamera: 'Security Camera',
        camera: 'Camera',
        monitor: 'Monitor',
        otherDevice: 'Other Device',
        
        // Wi-Fi Installation and Repair
        newNetworkInstallation: 'New Network Installation',
        networkRepair: 'Network Repair',
        coverageExtension: 'Coverage Extension',
        signalBoost: 'Signal Boost',
        deviceConfiguration: 'Device Configuration',
        networkCameras: 'Network Cameras',
        
        // Printer Maintenance
        hp: 'HP',
        canon: 'Canon',
        epson: 'Epson',
        brother: 'Brother',
        xerox: 'Xerox',
        ricoh: 'Ricoh',
        otherBrand: 'Other',
        notPrinting: 'Not Printing',
        poorPrintQuality: 'Poor Print Quality',
        paperJam: 'Paper Jam',
        inkProblem: 'Ink Problem',
        networkIssue: 'Network Issue',
        preventiveMaintenance: 'Preventive Maintenance',
        
        // Awards and Recognition
        trophy: 'Trophy',
        medal: 'Medal',
        shield: 'Honor Shield',
        cashPrize: 'Cash Prize',
        books: 'Books',
        schoolSupplies: 'School Supplies',
        electronics: 'Electronics',
        topStudents: 'Top Students',
        culturalCompetition: 'Cultural Competition',
        sportsCompetition: 'Sports Competition',
        quranMemorization: 'Quran Memorization',
        behaviorExcellence: 'Behavior Excellence',
        attendanceExcellence: 'Attendance Excellence',
        artCompetition: 'Art Competition',
        scientificCompetition: 'Scientific Competition',
        
        // School and Office Supplies
        paperType: 'Paper Type',
        writingTools: 'Writing Tools',
        organizationArchiving: 'Organization and Archiving',
        officeSupplies: 'Office Supplies',
        printingSupplies: 'Printing Supplies',
        classroomSupplies: 'Classroom Supplies',
        paperA4: 'A4 Paper',
        paperA3: 'A3 Paper',
        coloredPaper: 'Colored Paper',
        cardboardPaper: 'Cardboard Paper',
        dryPens: 'Ballpoint Pens',
        pencil: 'Pencils',
        whiteboardMarkers: 'Whiteboard Markers',
        eraser: 'Erasers',
        sharpener: 'Pencil Sharpeners',
        correction: 'Correction Fluid',
        coloringPens: 'Coloring Pens',
        documentHolders: 'Document Holders',
        folders: 'Folders',
        archiveBoxes: 'Archive Boxes',
        fileSeparators: 'File Separators',
        pins: 'Pins',
        paperClips: 'Paper Clips',
        stapler: 'Stapler',
        tape: 'Tape',
        scissors: 'Scissors',
        glue: 'Glue',
        ruler: 'Ruler',
        calculator: 'Calculator',
        ink: 'Ink',
        toner: 'Toner',
        inkCartridges: 'Ink Cartridges',
        stationery: 'Stationery',
        bindersStorage: 'Binders & Storage',
        officeFurniture: 'Office Furniture',
        adminSupplies: 'Administrative Supplies',
        specialPrintingPaper: 'Special Printing Paper',
        adhesiveLabels: 'Adhesive Labels',
        whiteboards: 'Whiteboards',
        whiteboardEraser: 'Whiteboard Eraser',
        chalk: 'Chalk',
        whiteboardMagnets: 'Whiteboard Magnets',
        educationalIndicators: 'Educational Indicators',
        
        // Customized Products
        customPens: 'Custom Pens',
        customBags: 'Custom Bags',
        customNotebooks: 'Notebooks',
        customMugs: 'Mugs',
        toteBags: 'Tote Bags',
        badges: 'Badges',
        lanyards: 'Lanyards',
        waterBottles: 'Water Bottles',
        customTshirts: 'T-Shirts',
        caps: 'Caps',
        stickers: 'Stickers',
        bookmarks: 'Bookmarks',
        calendars: 'Calendars',
        keychains: 'Keychains',
        
        // Software Development Services
        websiteDesign: 'Website Design',
        schoolPlatform: 'School Platform',
        mobileApp: 'Mobile App',
        studentManagementSystem: 'Student Management System',
        teacherManagementSystem: 'Teacher Management System',
        invoicingSystem: 'Invoicing System',
        onlineRegistrationSystem: 'Online Registration System',
        appointmentBookingSystem: 'Appointment Booking System',
        elearningPlatform: 'E-Learning Platform',
        notificationsSystem: 'Notifications System',
        securityImprovement: 'Security Improvement',
        customSoftware: 'Custom Software',
        softwareUpdate: 'Software Update',
        bugFixing: 'Bug Fixing',
        systemsIntegration: 'Systems Integration',
        
        // Common
        other: 'Other',
        schoolManagement: 'School management',
        processAudit: 'Process audit',
        digitalTransformation: 'Digital transformation',
        staffTraining: 'Staff training',
        generalServices: 'General services',
        equipment: 'Equipment',
        training: 'Training',
        maintenance: 'Maintenance',
        schoolPhotos: 'School photos',
        eventCoverage: 'Event coverage',
        institutionalVideo: 'Institutional video',
        educationalDocumentation: 'Educational documentation',
        repair: 'Repair',
        spareParts: 'Spare parts supply',
        newInstallation: 'New installation',
        troubleshooting: 'Troubleshooting',
        networkOptimization: 'Network optimization',
        awardCeremony: 'Award ceremony',
        openDayEvent: 'Open day',
        conference: 'Conference',
        schoolTrip: 'School trip',
        yearEndParty: 'Year-end party',
        customPrints: 'Custom prints',
        signage: 'Signage',
        flyers: 'Flyers',
        businessCards: 'Business cards',
        books: 'Books',
        uniforms: 'Uniforms',
        brandedClothes: 'Branded clothes',
        networkEquipment: 'Network equipment',
        privateSchool: 'Private school',
        publicSchool: 'Public school',
        trainingInstitute: 'Training institute',
        french: 'French',
        arabic: 'Arabic',
        english: 'English'
      },
      app: {
        ourServices: 'Our Services',
        myRequests: 'My requests',
        invoices: 'Invoices',
        sidebarServices: 'Services',
        sidebarRequests: 'My requests',
        sidebarInvoices: 'Invoices',
        sidebarArchives: 'Archives',
        sidebarProfile: 'My profile',
        sidebarLogout: 'Logout',
        requestNum: 'Request #',
        service: 'Service',
        submitDate: 'Submission date',
        status: 'Status',
        action: 'Action',
        noRequests: 'No requests yet',
        noRequestsDesc: 'Your submitted requests will appear here. Start by browsing our services.',
        invoiceNum: 'Invoice #',
        date: 'Date',
        amount: 'Amount',
        paymentStatus: 'Payment status',
        noInvoices: 'No invoices yet',
        noInvoicesDesc: 'Invoices related to your requests will appear here once processed.',
        profile: 'Institution profile',
        schoolType: 'Institution type',
        directorName: 'Director name',
        secondaryPhone: 'Secondary phone',
        address: 'Address',
        preferredLang: 'Preferred language',
        saveChanges: 'Save changes'
      },
      admin: {
        panel: 'Admin Panel',
        search: 'Search...',
        notifications: 'Notifications',
        notificationsTitle: 'Notifications',
        markAllRead: 'Mark all read',
        noNotifications: 'No notifications',
        toggleTheme: 'Toggle Theme',
        loading: 'Loading...',
        login: {
          title: 'Admin Login',
          subtitle: 'Administrator Access',
          email: 'Email',
          emailPlaceholder: 'admin@school.com',
          password: 'Password',
          passwordPlaceholder: 'Enter your password',
          signIn: 'Sign In',
          secure: 'Secure administrator authentication',
          invalidCredentials: 'Invalid email or password'
        },
        sidebar: {
          main: 'Main',
          dashboard: 'Dashboard',
          requests: 'Requests',
          allRequests: 'All Requests',
          users: 'Users',
          allUsers: 'All Users',
          services: 'Services',
          manageServices: 'Manage Services',
          insights: 'Insights',
          analytics: 'Analytics',
          system: 'System',
          settings: 'Settings'
        },
        dashboard: {
          title: 'Dashboard',
          subtitle: 'Overview of your platform activity',
          export: 'Export',
          totalRequests: 'Total Requests',
          activeRequests: 'Active Requests',
          completed: 'Completed',
          totalUsers: 'Total Users',
          quotations: 'Quotations',
          revenueEstimate: 'Revenue Estimate',
          requestsByMonth: 'Requests by Month',
          recentActivity: 'Recent Activity',
          requestsByService: 'Requests by Service',
          statusDistribution: 'Status Distribution'
        },
        requests: {
          title: 'Request Management',
          subtitle: 'Manage all service requests',
          exportCSV: 'Export CSV',
          search: 'Search requests...',
          allStatuses: 'All Statuses',
          allPriorities: 'All Priorities',
          allServices: 'All Services',
          pending: 'Pending',
          underReview: 'Under Review',
          waitingInfo: 'Waiting for Info',
          approved: 'Approved',
          inProgress: 'In Progress',
          completed: 'Completed',
          cancelled: 'Cancelled',
          low: 'Low',
          normal: 'Normal',
          high: 'High',
          urgent: 'Urgent',
          critical: 'Critical',
          id: 'Request #',
          school: 'School',
          service: 'Service',
          priority: 'Priority',
          status: 'Status',
          created: 'Created',
          attachments: 'Attachments',
          quotation: 'Quotation',
          actions: 'Actions'
        },
        pending: {
          title: 'Pending Requests',
          subtitle: 'Requests awaiting action'
        },
        inProgress: {
          title: 'In Progress',
          subtitle: 'Active requests being processed'
        },
        completed: {
          title: 'Completed',
          subtitle: 'Successfully completed requests'
        },
        cancelled: {
          title: 'Cancelled',
          subtitle: 'Cancelled requests'
        },
        users: {
          title: 'User Management',
          subtitle: 'Manage all platform users',
          search: 'Search users...',
          exportCSV: 'Export CSV',
          allRoles: 'All Roles',
          admin: 'Admin',
          user: 'User',
          allStatuses: 'All Statuses',
          active: 'Active',
          suspended: 'Suspended',
          archived: 'Archived'
        },
        administrators: {
          title: 'Administrators',
          subtitle: 'Platform administrators'
        },
        schools: {
          title: 'Schools',
          subtitle: 'Registered schools and institutions'
        },
        servicesPage: {
          title: 'Service Management',
          subtitle: 'Manage service categories'
        },
        quotations: {
          title: 'Quotations',
          subtitle: 'Manage uploaded quotations',
          exportCSV: 'Export CSV'
        },
        analyticsPage: {
          title: 'Analytics',
          subtitle: 'Platform performance metrics',
          conversionRate: 'Conversion Rate',
          requestsByMonthTitle: 'Requests by Month (This Year)'
        },
        settingsPage: {
          title: 'Settings',
          subtitle: 'System configuration',
          appearance: 'Appearance',
          darkMode: 'Dark Mode',
          darkModeDesc: 'Toggle between light and dark theme',
          toggle: 'Toggle',
          account: 'Account',
          session: 'Session',
          sessionDesc: 'You are logged in as an administrator',
          logout: 'Logout'
        },
        auditLogs: {
          title: 'Audit Logs',
          subtitle: 'Track all administrative actions'
        },
        table: {
          id: 'ID',
          requestId: 'Request #',
          school: 'School',
          service: 'Service',
          priority: 'Priority',
          status: 'Status',
          created: 'Created',
          completed: 'Completed',
          cancelled: 'Cancelled',
          attachments: 'Attachments',
          quotation: 'Quotation',
          actions: 'Actions',
          user: 'User',
          email: 'Email',
          role: 'Role',
          joined: 'Joined',
          contact: 'Contact',
          nameFR: 'Name (FR)',
          key: 'Key',
          nameEN: 'Name (EN)',
          nameAR: 'Name (AR)',
          version: 'Version',
          uploaded: 'Uploaded',
          file: 'File',
          timestamp: 'Timestamp',
          action: 'Action',
          entity: 'Entity',
          lastLogin: 'Last Login',
          never: 'Never',
          description: 'Description',
          quotationDoc: 'Quotation Document',
          download: 'Download'
        },
        modal: {
          editUser: 'Edit User',
          editRequest: 'Edit Request',
          editService: 'Edit Service',
          requestDetails: 'Request Details',
          userProfile: 'User Profile',
          fullName: 'Full Name',
          email: 'Email',
          school: 'School',
          phone: 'Phone',
          role: 'Role',
          status: 'Status',
          cancel: 'Cancel',
          save: 'Save Changes',
          priority: 'Priority',
          contactName: 'Contact Name',
          contactEmail: 'Contact Email',
          quoteAmount: 'Quote Amount (MAD)',
          notes: 'Notes',
          nameFR: 'Name (French)',
          nameEN: 'Name (English)',
          nameAR: 'Name (Arabic)',
          sortOrder: 'Sort Order',
          descriptionFR: 'Description (French)',
          selectDevis: 'Select Devis PDF file',
          pdfHint: 'PDF only, max 10MB',
          browse: 'Browse',
          uploading: 'Uploading...',
          uploadDevis: 'Upload Devis',
          viewCurrent: 'View current',
          currentDevis: 'Current Devis',
          uploadedDocs: 'Uploaded Documents'
        },
        toast: {
          loadError: 'Error: ',
          loadUsersFailed: 'Failed to load users',
          loadDashboardFailed: 'Failed to load dashboard data',
          noDbConnection: 'Database not connected',
          userUpdated: 'User updated successfully',
          deleteUserConfirm: 'Are you sure you want to delete this user? This action cannot be undone.',
          userDeleted: 'User deleted',
          loadAttachmentsFailed: 'Failed to load attachments',
          noRequests: 'No requests yet',
          loadRequestsFailed: 'Failed to load requests',
          statusUpdated: 'Status updated',
          loadServicesFailed: 'Failed to load services',
          serviceUpdated: 'Service updated',
          serviceActivated: 'Service activated',
          serviceDeactivated: 'Service deactivated',
          loadQuotationsFailed: 'Failed to load quotations',
          loadAnalyticsFailed: 'Failed to load analytics',
          themeSwitched: 'Switched to',
          noDataExport: 'No data to export',
          csvExported: 'CSV exported',
          deleteRequestConfirm: 'Are you sure you want to delete this request?',
          requestUpdated: 'Request updated successfully',
          requestDeleted: 'Request deleted',
          selectPDF: 'Please select a PDF file first',
          fileTooLarge: 'File size must be under 10MB',
          devisUploaded: 'Devis uploaded successfully',
          devisUploadError: 'Error uploading devis',
          deleteQuotationConfirm: 'Delete this quotation?',
          quotationDeleted: 'Quotation deleted',
          deletePermissionError: 'Permission denied. Add your service_role key in Settings.'
        },
        empty: {
          noData: 'No data yet',
          noActivity: 'No recent activity',
          noUsers: 'No users found',
          noRequests: 'No requests found',
          noServices: 'No services found',
          noQuotations: 'No quotations found',
          noAuditLogs: 'No audit logs'
        }
      }
    }
  };

  function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  function t(key) {
    const value = getNestedValue(translations[currentLang], key);
    if (value !== null) return value;
    return getNestedValue(translations.fr, key) || key;
  }

  function setDocumentDirection(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl', lang === 'ar');
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = t(key);
      if (text) el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const html = t(key);
      if (html) el.innerHTML = html;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = t(key);
      if (text) el.placeholder = text;
    });

    const pageTitle = document.querySelector('meta[data-i18n-page-title]');
    if (pageTitle) {
      const key = pageTitle.getAttribute('data-i18n-page-title');
      document.title = t(key);
    }

    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = currentLang;

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
  }

  function setLanguage(lang) {
    if (!translations[lang]) lang = 'ar';
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    setDocumentDirection(lang);
    applyTranslations();
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang = translations[saved] ? saved : 'fr';
    currentLang = lang;
    setDocumentDirection(lang);
    applyTranslations();

    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = lang;
      langSelect.addEventListener('change', function() {
        setLanguage(this.value);
      });
    }

    var showPage = function() {
      requestAnimationFrame(function() {
        document.body.classList.add('translated');
      });
    };
    if (document.fonts && document.fonts.ready) {
      var fontTimeout = setTimeout(showPage, 3000);
      document.fonts.ready.then(function() {
        clearTimeout(fontTimeout);
        showPage();
      });
    } else {
      showPage();
    }
  }

  return { t, setLanguage, init, applyTranslations, getLang: () => currentLang, translations };
})();

window.I18n = I18n;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}