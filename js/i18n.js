/**
 * SMARTSERVICES Schools - Internationalization
 * Supports: Français (fr), العربية (ar), English (en)
 */
const I18n = (function() {
  const STORAGE_KEY = 'smartschools_lang';
  let currentLang = 'ar';

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
        indexDesc: 'Une plateforme B2B dédiée aux écoles publiques, privées et établissements d\'enseignement au Maroc. Centralisez toutes vos demandes de services opérationnels et simplifiez votre gestion.',
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
          desc: 'Certificats, bannières, signalétique, flyers, cartes de visite, livres, impressions personnalisées.'
        },
        events: {
          title: 'Organisation d\'événements',
          desc: 'Cérémonies, journées portes ouvertes, conférences, sorties scolaires, fêtes de fin d\'année.'
        },
        gifts: {
          title: 'Cadeaux & Récompenses scolaires',
          desc: 'Trophées, médailles, coupes, certificats, cadeaux de fin d\'année, lots de remise des prix.'
        },
        giveaways: {
          title: 'Goodies scolaires',
          desc: 'Articles personnalisés : cahiers, stylos, sacs, uniformes, vêtements aux couleurs de l\'établissement.'
        },
        repair: {
          title: 'Réparation informatique & CCTV',
          desc: 'Réparation d\'ordinateurs, installation de caméras de surveillance, maintenance des équipements.'
        },
        wifi: {
          title: 'Réparation réseau Wi-Fi',
          desc: 'Installation, dépannage et optimisation du réseau Wi-Fi dans l\'ensemble de l\'établissement.'
        },
        photo: {
          title: 'Photographie & Documentation',
          desc: 'Photos scolaires, couverture d\'événements, vidéos institutionnelles, documentation pédagogique.'
        },
        printer: {
          title: 'Maintenance d\'imprimantes',
          desc: 'Réparation, entretien, fourniture de pièces détachées et cartouches pour tous types d\'imprimantes.'
        },
        programming: {
          title: 'Programmation & Développement',
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
        desc: 'La plateforme B2B qui centralise tous les services opérationnels pour les établissements scolaires au Maroc.',
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
        schoolName: 'Nom de l\'établissement',
        schoolPlaceholder: 'Ex: Groupe Scolaire L\'Univers',
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
        serviceCategory: 'Catégorie du service'
      },
      options: {
        trophies: 'Trophées',
        medals: 'Médailles',
        cups: 'Coupes',
        certificates: 'Certificats',
        prizePacks: 'Lots de remise des prix',
        other: 'Autre',
        stationery: 'Papeterie',
        inkCartridges: 'Cartouches d\'encre',
        bindersStorage: 'Classeurs et rangement',
        officeFurniture: 'Mobilier de bureau',
        adminSupplies: 'Fournitures administratives',
        customNotebooks: 'Cahiers personnalisés',
        customPens: 'Stylos personnalisés',
        customBags: 'Sacs personnalisés',
        uniforms: 'Uniformes',
        brandedClothes: 'Vêtements aux couleurs de l\'établissement',
        banners: 'Bannières',
        signage: 'Signalétique',
        flyers: 'Flyers',
        businessCards: 'Cartes de visite',
        books: 'Livres',
        customPrints: 'Impressions personnalisées',
        awardCeremony: 'Cérémonie de remise des prix',
        openDay: 'Journée portes ouvertes',
        conference: 'Conférence',
        schoolTrip: 'Sortie scolaire',
        yearEndParty: 'Fête de fin d\'année',
        desktopComputer: 'Ordinateur fixe',
        laptop: 'Ordinateur portable',
        securityCamera: 'Caméra de surveillance',
        networkEquipment: 'Équipement réseau',
        newInstallation: 'Nouvelle installation',
        troubleshooting: 'Dépannage',
        networkOptimization: 'Optimisation du réseau',
        coverageExtension: 'Extension de couverture',
        schoolPhotos: 'Photos scolaires',
        eventCoverage: 'Couverture d\'événement',
        institutionalVideo: 'Vidéo institutionnelle',
        educationalDocumentation: 'Documentation pédagogique',
        repair: 'Réparation',
        preventiveMaintenance: 'Entretien préventif',
        spareParts: 'Fourniture de pièces',
        schoolManagement: 'Gestion scolaire',
        processAudit: 'Audit des processus',
        digitalTransformation: 'Transformation numérique',
        staffTraining: 'Formation du personnel',
        generalServices: 'Services généraux',
        equipment: 'Équipement',
        training: 'Formation',
        maintenance: 'Maintenance'
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
        sidebarLogout: 'Déconnexion'
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
        indexDesc: 'منصة B2B مخصصة للمدارس العمومية والخصوصية ومؤسسات التعليم في المغرب. وحدّد جميع طلبات الخدمات التشغيلية الخاصة بك ويسّر إدارتك.',
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
          desc: 'شهادات، لافتات، لوحات إرشادية، منشورات، بطاقات أعمال، كتب، مطبوعات مخصصة.'
        },
        events: {
          title: 'تنظيم الفعاليات',
          desc: 'حفلات توزيع الجوائز، أيام الأبواب المفتوحة، مؤتمرات، رحلات مدرسية، حفلات نهاية العام.'
        },
        gifts: {
          title: 'الهدايا والجوائز المدرسية',
          desc: 'كؤوس، ميداليات، جوائز، شهادات، هدايا نهاية العام، حزم جوائز.'
        },
        giveaways: {
          title: 'الهدايا المدرسية',
          desc: 'منتجات مخصصة: دفاتر، أقلام، حقائب، زيّ موحّد، ملابس بألوان المؤسسة.'
        },
        repair: {
          title: 'صيانة الحواسيب وكاميرات المراقبة',
          desc: 'إصلاح الحواسيب، تركيب كاميرات المراقبة، صيانة المعدات.'
        },
        wifi: {
          title: 'إصلاح شبكات الواي فاي',
          desc: 'تركيب، تشخيص الأعطال وتحسين شبكة الواي فاي في جميع أنحاء المؤسسة.'
        },
        photo: {
          title: 'التصوير والتوثيق',
          desc: 'صور مدرسية، تغطية الفعاليات، فيديوهات مؤسسية، توثيق تربوي.'
        },
        printer: {
          title: 'صيانة الطابعات',
          desc: 'إصلاح، صيانة، توفير قطع الغيار وخراطيش الحبر لجميع أنواع الطابعات.'
        },
        programming: {
          title: 'البرمجة والتطوير',
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
        desc: 'المنصة B2B التي توحد جميع الخدمات التشغيلية للمؤسسات التعليمية في المغرب.',
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
        serviceCategory: 'فئة الخدمة'
      },
      options: {
        trophies: 'كؤوس',
        medals: 'ميداليات',
        cups: 'جوائز',
        certificates: 'شهادات',
        prizePacks: 'حزم جوائز',
        other: 'آخر',
        stationery: 'أدوات مكتبية',
        inkCartridges: 'خراطيش حبر',
        bindersStorage: 'ملفات وتنظيم',
        officeFurniture: 'أثاث مكتبي',
        adminSupplies: 'لوازم إدارية',
        customNotebooks: 'دفاتر مخصصة',
        customPens: 'أقلام مخصصة',
        customBags: 'حقائب مخصصة',
        uniforms: 'زي موحد',
        brandedClothes: 'ملابس بألوان المؤسسة',
        banners: 'لافتات',
        signage: 'لوحات إرشادية',
        flyers: 'منشورات',
        businessCards: 'بطاقات أعمال',
        books: 'كتب',
        customPrints: 'مطبوعات مخصصة',
        awardCeremony: 'حفل توزيع الجوائز',
        openDay: 'يوم الأبواب المفتوحة',
        conference: 'مؤتمر',
        schoolTrip: 'رحلة مدرسية',
        yearEndParty: 'حفل نهاية العام',
        desktopComputer: 'حاسوب مكتبي',
        laptop: 'حاسوب محمول',
        securityCamera: 'كاميرا مراقبة',
        networkEquipment: 'معدات شبكة',
        newInstallation: 'تركيب جديد',
        troubleshooting: 'تشخيص الأعطال',
        networkOptimization: 'تحسين الشبكة',
        coverageExtension: 'توسيع التغطية',
        schoolPhotos: 'صور مدرسية',
        eventCoverage: 'تغطية فعاليات',
        institutionalVideo: 'فيديو مؤسسي',
        educationalDocumentation: 'توثيق تربوي',
        repair: 'إصلاح',
        preventiveMaintenance: 'صيانة وقائية',
        spareParts: 'توفير قطع الغيار',
        schoolManagement: 'إدارة مدرسية',
        processAudit: 'تدقيق العمليات',
        digitalTransformation: 'تحول رقمي',
        staffTraining: 'تدريب الموظفين',
        generalServices: 'خدمات عامة',
        equipment: 'معدات',
        training: 'تدريب',
        maintenance: 'صيانة'
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
        sidebarLogout: 'تسجيل الخروج'
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
        indexDesc: 'A B2B platform dedicated to public and private schools, and educational institutions in Morocco. Centralize all your operational service requests and simplify your management.',
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
          title: 'Office Supplies',
          desc: 'Stationery, ink cartridges, binders, administrative supplies, office furniture.'
        },
        printing: {
          title: 'Printing Services',
          desc: 'Certificates, banners, signage, flyers, business cards, books, custom prints.'
        },
        events: {
          title: 'Event Organization',
          desc: 'Award ceremonies, open days, conferences, school trips, year-end parties.'
        },
        gifts: {
          title: 'Gifts & School Awards',
          desc: 'Trophies, medals, cups, certificates, year-end gifts, prize packs.'
        },
        giveaways: {
          title: 'School Giveaways',
          desc: 'Custom items: notebooks, pens, bags, uniforms, clothing in the institution\'s colors.'
        },
        repair: {
          title: 'Computer Repair & CCTV',
          desc: 'Computer repair, surveillance camera installation, equipment maintenance.'
        },
        wifi: {
          title: 'Wi-Fi Network Repair',
          desc: 'Installation, troubleshooting and optimization of the Wi-Fi network throughout the institution.'
        },
        photo: {
          title: 'Photography & Documentation',
          desc: 'School photos, event coverage, institutional videos, educational documentation.'
        },
        printer: {
          title: 'Printer Maintenance',
          desc: 'Repair, maintenance, spare parts and cartridges for all types of printers.'
        },
        programming: {
          title: 'Programming & Development',
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
        desc: 'The B2B platform that centralizes all operational services for educational institutions in Morocco.',
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
        schoolName: 'Institution Name',
        schoolPlaceholder: 'Ex: L\'Univers School Group',
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
        rewardType: 'Desired reward type',
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
        serviceCategory: 'Service category'
      },
      options: {
        trophies: 'Trophies',
        medals: 'Medals',
        cups: 'Cups',
        certificates: 'Certificates',
        prizePacks: 'Prize packs',
        other: 'Other',
        stationery: 'Stationery',
        inkCartridges: 'Ink cartridges',
        bindersStorage: 'Binders and storage',
        officeFurniture: 'Office furniture',
        adminSupplies: 'Administrative supplies',
        customNotebooks: 'Custom notebooks',
        customPens: 'Custom pens',
        customBags: 'Custom bags',
        uniforms: 'Uniforms',
        brandedClothes: 'Branded clothes',
        banners: 'Banners',
        signage: 'Signage',
        flyers: 'Flyers',
        businessCards: 'Business cards',
        books: 'Books',
        customPrints: 'Custom prints',
        awardCeremony: 'Award ceremony',
        openDay: 'Open day',
        conference: 'Conference',
        schoolTrip: 'School trip',
        yearEndParty: 'Year-end party',
        desktopComputer: 'Desktop computer',
        laptop: 'Laptop',
        securityCamera: 'Security camera',
        networkEquipment: 'Network equipment',
        newInstallation: 'New installation',
        troubleshooting: 'Troubleshooting',
        networkOptimization: 'Network optimization',
        coverageExtension: 'Coverage extension',
        schoolPhotos: 'School photos',
        eventCoverage: 'Event coverage',
        institutionalVideo: 'Institutional video',
        educationalDocumentation: 'Educational documentation',
        repair: 'Repair',
        preventiveMaintenance: 'Preventive maintenance',
        spareParts: 'Spare parts supply',
        schoolManagement: 'School management',
        processAudit: 'Process audit',
        digitalTransformation: 'Digital transformation',
        staffTraining: 'Staff training',
        generalServices: 'General services',
        equipment: 'Equipment',
        training: 'Training',
        maintenance: 'Maintenance'
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
        sidebarLogout: 'Logout'
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
    const lang = translations[saved] ? saved : 'ar';
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
  }

  return { t, setLanguage, init, applyTranslations, getLang: () => currentLang, translations };
})();

window.I18n = I18n;