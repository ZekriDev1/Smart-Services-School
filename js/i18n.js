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
        user: 'Utilisateur',
        myAccount: 'Mon compte',
        myProfile: 'Mon profil',
        myRequests: 'Mes demandes',
        invoices: 'Factures'
      },
      hero: {
        subtitle: 'SMARTSERVICES Schools',
        indexTitle: 'Tous les services de votre établissement... <span class="orange">en un seul endroit.</span>',
        indexDesc: "Une plateforme B2B dédiée aux écoles publiques, privées et établissements d'enseignement au Maroc. Centralisez toutes vos demandes de services opérationnels et simplifiez votre gestion.",
        createAccount: 'Créer un compte',
        signIn: 'Se connecter',
        quickRequest: 'Demande rapide',
        contactTitle: 'Contactez-<span class="orange">nous</span>',
        contactDesc: "Une question ? Besoin d'informations ? Notre équipe est à votre disposition pour vous accompagner.",
        faqTitle: 'Questions <span class="orange">Fréquentes</span>',
        faqDesc: 'Trouvez rapidement des réponses aux questions les plus courantes sur nos services.',
        howTitle: 'Comment ça <span class="orange">marche ?</span>',
        howDesc: 'Notre plateforme simplifie la gestion des services opérationnels de votre établissement en 3 étapes simples.',
        servicesTitle: 'Nos <span class="orange">Services</span>',
        servicesDesc: 'Découvrez tous nos services opérationnels pour établissements scolaires.'
      },
      services: {
        sectionTitle: 'Nos <span class="orange">Services</span>',
        sectionSubtitle: 'Tous les services opérationnels dont votre établissement a besoin, réunis sur une seule plateforme.',
        requestBtn: 'Demander ce service',
        customRequestBtn: 'Faire une demande',
        supplies: { title: 'Fournitures de bureau', desc: "Papeterie, cartouches d'encre, classeurs, fournitures administratives, mobilier de bureau." },
        printing: { title: "Services d'impression", desc: 'Certificats, bannières, signalétique, flyers, cartes de visite, livres, impressions personnalisées.' },
        events: { title: "Organisation d'événements", desc: "Cérémonies, journées portes ouvertes, conférences, sorties scolaires, fêtes de fin d'année." },
        gifts: { title: 'Cadeaux & Récompenses scolaires', desc: "Trophées, médailles, coupes, certificats, cadeaux de fin d'année, lots de remise des prix." },
        giveaways: { title: 'Goodies scolaires', desc: "Articles personnalisés : cahiers, stylos, sacs, uniformes, vêtements aux couleurs de l'établissement." },
        repair: { title: 'Réparation informatique & CCTV', desc: "Réparation d'ordinateurs, installation de caméras de surveillance, maintenance des équipements." },
        wifi: { title: 'Réparation réseau Wi-Fi', desc: "Installation, dépannage et optimisation du réseau Wi-Fi dans l'ensemble de l'établissement." },
        photo: { title: 'Photographie & Documentation', desc: "Photos scolaires, couverture d'événements, vidéos institutionnelles, documentation pédagogique." },
        printer: { title: "Maintenance d'imprimantes", desc: "Réparation, entretien, fourniture de pièces détachées et cartouches pour tous types d'imprimantes." },
        consulting: { title: 'Consulting', desc: 'Conseil en gestion scolaire, audit des processus, accompagnement à la transformation numérique.' },
        programming: { title: 'Programmation & Développement', desc: 'Développement de sites web, applications mobiles, logiciels de gestion, solutions e-learning et plateformes sur mesure.' },
        custom: { title: 'Demander un service personnalisé', desc: 'Vous ne trouvez pas ce que vous cherchez ? Décrivez-nous votre besoin et nous vous trouverons la solution.' }
      },
      steps: {
        sectionTitle: 'Comment ça <span class="orange">marche ?</span>',
        step1Title: 'Vous soumettez une demande',
        step1Desc: 'Choisissez le service dont vous avez besoin et remplissez un formulaire simple et rapide.',
        step2Title: "Nous gérons l'exécution",
        step2Desc: 'Notre équipe prend en charge votre demande et coordonne les meilleurs prestataires.',
        step3Title: 'Vous recevez votre service',
        step3Desc: "Suivez l'avancement de votre demande et recevez votre service dans les délais impartis."
      },
      benefits: {
        sectionTitle: 'Pourquoi <span class="orange">SMARTSERVICES Schools ?</span>',
        timeTitle: 'Gain de temps',
        timeDesc: 'Plus besoin de contacter plusieurs fournisseurs. Une seule plateforme pour tous vos besoins.',
        costTitle: 'Optimisation des coûts',
        costDesc: "Des tarifs négociés grâce à notre réseau de partenaires et notre volume d'achats groupés.",
        trackingTitle: 'Suivi transparent',
        trackingDesc: "Suivez l'état de toutes vos demandes en temps réel depuis votre tableau de bord.",
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
        executeDesc: "Nous sélectionnons les meilleurs prestataires et coordonnons l'exécution de votre demande avec suivi en temps réel.",
        deliverTitle: 'Livraison et suivi',
        deliverDesc: 'Recevez votre service dans les délais convenus et accédez à tous les documents de suivi depuis votre tableau de bord.'
      },
      cta: {
        title: 'Prêt à simplifier la gestion de votre établissement ?',
        subtitle: 'Rejoignez les écoles qui nous font déjà confiance au Maroc.',
        btn: 'Créer un compte gratuitement',
        faqTitle: "Vous n'avez pas trouvé votre réponse ?",
        faqSubtitle: 'Contactez-nous directement et notre équipe vous répondra dans les plus brefs délais.',
        faqBtn: 'Nous contacter'
      },
      contact: {
        phone: 'Téléphone',
        email: 'Email'
      },
      faq: {
        q1Title: 'Comment créer un compte ?',
        q1Desc: 'Cliquez sur "Créer un compte", remplissez le formulaire avec vos informations et validez. Vous recevrez un email de confirmation.',
        q2Title: 'Quels sont les délais de traitement ?',
        q2Desc: 'Les demandes sont généralement traitées sous 24 à 48 heures ouvrables selon le type de service demandé.',
        q3Title: 'Comment suivre ma demande ?',
        q3Desc: 'Connectez-vous à votre compte et accédez à "Mes demandes" pour suivre l\'état d\'avancement en temps réel.',
        q4Title: 'Quels modes de paiement acceptez-vous ?',
        q4Desc: 'Nous acceptons les virements bancaires, chèques et paiements en ligne via notre plateforme sécurisée.',
        q5Title: 'Mes données sont-elles sécurisées ?',
        q5Desc: 'Oui, toutes vos données sont chiffrées et stockées sur des serveurs sécurisés conformes aux normes internationales.',
        q6Title: 'Puis-je annuler une demande ?',
        q6Desc: "Oui, vous pouvez annuler une demande tant qu'elle n'a pas été prise en charge par nos équipes. Contactez-nous au plus vite."
      },
      footer: {
        desc: 'La plateforme B2B qui centralise tous les services opérationnels pour les établissements scolaires au Maroc.',
        services: 'Services',
        company: 'Entreprise',
        about: 'À propos',
        howItWorks: 'Comment ça marche',
        contact: 'Contact',
        faq: 'FAQ',
        location: 'Tanger, Maroc',
        copyright: 'WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri'
      },
      auth: {
        loginTitle: 'Connexion',
        signupTitle: 'Créer un compte',
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        fullName: 'Nom complet',
        school: 'Établissement',
        phone: 'Téléphone',
        loginBtn: 'Se connecter',
        signupBtn: 'Créer mon compte',
        noAccount: 'Pas encore de compte ?',
        hasAccount: 'Déjà un compte ?',
        emailPlaceholder: 'votre@email.com',
        passwordPlaceholder: 'Votre mot de passe',
        namePlaceholder: 'Votre nom',
        schoolPlaceholder: "Nom de l'école",
        phonePlaceholder: '+212 6XX XX XX XX',
        passwordMinPlaceholder: 'Min. 6 caractères',
        confirmPlaceholder: 'Répétez le mot de passe'
      },
      form: {
        newRequest: 'Nouvelle demande',
        requestPrefix: 'Demande : ',
        schoolName: "Nom de l'établissement",
        city: 'Ville',
        contactName: 'Nom du contact',
        description: 'Description détaillée du besoin',
        attachFiles: 'Joindre des documents (PDF, Images)',
        desiredDate: 'Date souhaitée',
        submit: 'Soumettre la demande',
        backToServices: 'Retour aux services',
        uploadText: 'Glissez vos fichiers ici ou cliquez pour parcourir',
        uploadHint: 'PDF, PNG, JPG, JPEG, GIF, WEBP (max 10MB par fichier)',
        schoolPlaceholder: "Ex: Groupe Scolaire L'Univers",
        cityPlaceholder: 'Ex: Casablanca',
        emailPlaceholder: 'contact@etablissement.ma',
        descPlaceholder: 'Décrivez précisément ce dont vous avez besoin...',
        successMsg: 'Votre demande a été soumise avec succès ! Un responsable SMARTSERVICES vous contactera dans les plus brefs délais.'
      },
      app: {
        ourServices: 'Nos Services',
        myRequests: 'Mes demandes',
        invoices: 'Factures',
        profile: "Profil de l'établissement",
        archives: 'Archives',
        sidebarServices: 'Services',
        sidebarRequests: 'Mes demandes',
        sidebarInvoices: 'Factures',
        sidebarArchives: 'Archives',
        sidebarProfile: 'Profil',
        sidebarLogout: 'Déconnexion',
        requestNum: 'N° Demande',
        service: 'Service',
        submitDate: 'Date de soumission',
        status: 'Statut',
        action: 'Action',
        viewDetails: 'Voir détails',
        invoiceNum: 'N° Facture',
        date: 'Date',
        amount: 'Montant',
        paymentStatus: 'Statut paiement',
        saveChanges: 'Enregistrer les modifications',
        preferredLang: 'Langue préférée',
        schoolType: "Type d'établissement",
        directorName: 'Nom du directeur',
        secondaryPhone: 'Téléphone secondaire',
        address: 'Adresse',
        statusCompleted: 'Terminé',
        statusProgress: 'En cours',
        statusReview: 'En examen',
        statusNew: 'Nouveau',
        statusCancelled: 'Annulé',
        paid: 'Payé',
        pending: 'En attente',
        overdue: 'En retard'
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
        user: 'المستخدم',
        myAccount: 'حسابي',
        myProfile: 'ملفي الشخصي',
        myRequests: 'طلباتي',
        invoices: 'الفواتير'
      },
      hero: {
        subtitle: 'SMARTSERVICES Schools',
        indexTitle: 'جميع خدمات مؤسستكم... <span class="orange">في مكان واحد.</span>',
        indexDesc: 'منصة B2B مخصصة للمدارس العمومية والخاصة ومؤسسات التعليم في المغرب. ركزوا جميع طلبات الخدمات التشغيلية وابسطوا إدارتكم.',
        createAccount: 'إنشاء حساب',
        signIn: 'تسجيل الدخول',
        quickRequest: 'طلب سريع',
        contactTitle: 'اتصل <span class="orange">بنا</span>',
        contactDesc: 'لديك سؤال؟ تحتاج معلومات؟ فريقنا في خدمتكم لمساعدتكم.',
        faqTitle: 'الأسئلة <span class="orange">الشائعة</span>',
        faqDesc: 'اعثروا بسرعة على إجابات للأسئلة الأكثر شيوعاً حول خدماتنا.',
        howTitle: 'كيف <span class="orange">يعمل؟</span>',
        howDesc: 'منصتنا تبسط إدارة الخدمات التشغيلية لمؤسستكم في 3 خطوات بسيطة.',
        servicesTitle: '<span class="orange">خدماتنا</span>',
        servicesDesc: 'اكتشفوا جميع خدماتنا التشغيلية للمؤسسات التعليمية.'
      },
      services: {
        sectionTitle: '<span class="orange">خدماتنا</span>',
        sectionSubtitle: 'جميع الخدمات التشغيلية التي تحتاجها مؤسستكم، مجمعة في منصة واحدة.',
        requestBtn: 'طلب هذه الخدمة',
        customRequestBtn: 'تقديم طلب',
        supplies: { title: 'لوازم مكتبية', desc: 'قرطاسية، خراطيش حبر، ملفات، لوازم إدارية، أثاث مكتبي.' },
        printing: { title: 'خدمات الطباعة', desc: 'شهادات، لافتات، لافتات إرشادية، منشورات، بطاقات عمل، كتب، طباعة مخصصة.' },
        events: { title: 'تنظيم الفعاليات', desc: 'حفلات، أيام مفتوحة، مؤتمرات، رحلات مدرسية، حفلات نهاية السنة.' },
        gifts: { title: 'هدايا ومكافآت مدرسية', desc: 'كؤوس، ميداليات، جوائز، شهادات، هدايا نهاية السنة، حزم توزيع الجوائز.' },
        giveaways: { title: 'هدايا ترويجية مدرسية', desc: 'منتجات مخصصة: دفاتر، أقلام، حقائب، زي موحد، ملابس بألوان المؤسسة.' },
        repair: { title: 'إصلاح الحاسوب وكاميرات المراقبة', desc: 'إصلاح الحواسيب، تركيب كاميرات المراقبة، صيانة المعدات.' },
        wifi: { title: 'إصلاح شبكة الواي فاي', desc: 'تركيب، إصلاح وتحسين شبكة الواي فاي في جميع أنحاء المؤسسة.' },
        photo: { title: 'التصوير والتوثيق', desc: 'صور مدرسية، تغطية الفعاليات، فيديوهات مؤسسية، توثيق تربوي.' },
        printer: { title: 'صيانة الطابعات', desc: 'إصلاح، صيانة، توفير قطع الغيار والخراطيش لجميع أنواع الطابعات.' },
        consulting: { title: 'الاستشارات', desc: 'استشارات في الإدارة المدرسية، تدقيق العمليات، التحول الرقمي.' },
        programming: { title: 'البرمجة والتطوير', desc: 'تطوير مواقع الويب، تطبيقات الجوال، برامج الإدارة، حلول التعلم الإلكتروني ومنصات مخصصة.' },
        custom: { title: 'طلب خدمة مخصصة', desc: 'لم تجدوا ما تبحثون عنه؟ صفوا احتياجكم وسنجد لكم الحل.' }
      },
      steps: {
        sectionTitle: 'كيف <span class="orange">يعمل؟</span>',
        step1Title: 'تقدمون طلباً',
        step1Desc: 'اختاروا الخدمة التي تحتاجونها واملأوا نموذجاً بسيطاً وسريعاً.',
        step2Title: 'نحن ندير التنفيذ',
        step2Desc: 'فريقنا يتولى طلبكم وينسق مع أفضل مقدمي الخدمات.',
        step3Title: 'تستلمون خدمتكم',
        step3Desc: 'تابعوا تقدم طلبكم واستلموا خدمتكم في المواعيد المحددة.'
      },
      benefits: {
        sectionTitle: 'لماذا <span class="orange">SMARTSERVICES Schools؟</span>',
        timeTitle: 'توفير الوقت',
        timeDesc: 'لا حاجة للاتصال بعدة موردين. منصة واحدة لجميع احتياجاتكم.',
        costTitle: 'تحسين التكاليف',
        costDesc: 'أسعار تفاوضية بفضل شبكة شركائنا وحجم مشترياتنا المجمعة.',
        trackingTitle: 'متابعة شفافة',
        trackingDesc: 'تابعوا حالة جميع طلباتكم في الوقت الفعلي من لوحة التحكم.',
        supportTitle: 'مرافقة مخصصة',
        supportDesc: 'مسؤول حساب مخصص لمرافقتكم في كل خطوة.'
      },
      process: {
        sectionTitle: '<span class="orange">عمليتنا</span>',
        sectionSubtitle: 'عملية شفافة وفعالة لكل خدمة',
        submitTitle: 'تقديم الطلب',
        submitDesc: 'اختاروا خدمتكم، املأوا النموذج بالتفاصيل اللازمة وقدموا طلبكم ببضع نقرات.',
        reviewTitle: 'الفحص والتحقق',
        reviewDesc: 'فريقنا يفحص طلبكم، يتحقق من التفاصيل ويبدأ المعالجة خلال 24 ساعة.',
        executeTitle: 'التنسيق والتنفيذ',
        executeDesc: 'نختار أفضل مقدمي الخدمات وننسق تنفيذ طلبكم مع متابعة في الوقت الفعلي.',
        deliverTitle: 'التسليم والمتابعة',
        deliverDesc: 'استلموا خدمتكم في المواعيد المتفق عليها واطلعوا على جميع وثائق المتابعة من لوحة التحكم.'
      },
      cta: {
        title: 'مستعدون لتبسيط إدارة مؤسستكم؟',
        subtitle: 'انضموا إلى المدارس التي تثق بنا بالفعل في المغرب.',
        btn: 'إنشاء حساب مجاناً',
        faqTitle: 'لم تجدوا إجابتكم؟',
        faqSubtitle: 'اتصلوا بنا مباشرة وسيرد فريقنا في أقرب وقت.',
        faqBtn: 'اتصل بنا'
      },
      contact: {
        phone: 'الهاتف',
        email: 'البريد الإلكتروني'
      },
      faq: {
        q1Title: 'كيف أنشئ حساباً؟',
        q1Desc: 'انقروا على "إنشاء حساب"، املأوا النموذج بمعلوماتكم وتحققوا. ستتلقون بريداً إلكترونياً للتأكيد.',
        q2Title: 'ما هي مواعيد المعالجة؟',
        q2Desc: 'تُعالج الطلبات عادةً خلال 24 إلى 48 ساعة عمل حسب نوع الخدمة المطلوبة.',
        q3Title: 'كيف أتابع طلبي؟',
        q3Desc: 'سجلوا الدخول إلى حسابكم واذهبوا إلى "طلباتي" لمتابعة التقدم في الوقت الفعلي.',
        q4Title: 'ما طرق الدفع المقبولة؟',
        q4Desc: 'نقبل التحويلات البنكية والشيكات والدفع الإلكتروني عبر منصتنا الآمنة.',
        q5Title: 'هل بياناتي آمنة؟',
        q5Desc: 'نعم، جميع بياناتكم مشفرة ومخزنة على خوادم آمنة وفق المعايير الدولية.',
        q6Title: 'هل يمكنني إلغاء طلب؟',
        q6Desc: 'نعم، يمكنكم إلغاء طلب ما دام لم يتم معالجته من قبل فرقنا. اتصلوا بنا في أسرع وقت.'
      },
      footer: {
        desc: 'منصة B2B التي تركز جميع الخدمات التشغيلية للمؤسسات التعليمية في المغرب.',
        services: 'الخدمات',
        company: 'الشركة',
        about: 'من نحن',
        howItWorks: 'كيف يعمل',
        contact: 'اتصل بنا',
        faq: 'الأسئلة الشائعة',
        location: 'طنجة، المغرب',
        copyright: 'تطوير واستضافة الويب بواسطة أكرم زكري'
      },
      auth: {
        loginTitle: 'تسجيل الدخول',
        signupTitle: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        fullName: 'الاسم الكامل',
        school: 'المؤسسة',
        phone: 'الهاتف',
        loginBtn: 'تسجيل الدخول',
        signupBtn: 'إنشاء حسابي',
        noAccount: 'ليس لديك حساب؟',
        hasAccount: 'لديك حساب بالفعل؟',
        emailPlaceholder: 'votre@email.com',
        passwordPlaceholder: 'كلمة المرور',
        namePlaceholder: 'اسمك',
        schoolPlaceholder: 'اسم المدرسة',
        phonePlaceholder: '+212 6XX XX XX XX',
        passwordMinPlaceholder: '6 أحرف على الأقل',
        confirmPlaceholder: 'أعد كلمة المرور'
      },
      form: {
        newRequest: 'طلب جديد',
        requestPrefix: 'طلب: ',
        schoolName: 'اسم المؤسسة',
        city: 'المدينة',
        contactName: 'اسم جهة الاتصال',
        description: 'وصف مفصل للحاجة',
        attachFiles: 'إرفاق مستندات (PDF، صور)',
        desiredDate: 'التاريخ المطلوب',
        submit: 'إرسال الطلب',
        backToServices: 'العودة إلى الخدمات',
        uploadText: 'اسحبوا ملفاتكم هنا أو انقروا للتصفح',
        uploadHint: 'PDF، PNG، JPG، JPEG، GIF، WEBP (10 ميغابايت كحد أقصى لكل ملف)',
        schoolPlaceholder: 'مثال: مجموعة المدرسة العالم',
        cityPlaceholder: 'مثال: الدار البيضاء',
        emailPlaceholder: 'contact@etablissement.ma',
        descPlaceholder: 'صفوا بدقة ما تحتاجونه...',
        successMsg: 'تم إرسال طلبكم بنجاح! سيتصل بكم مسؤول SMARTSERVICES في أقرب وقت.'
      },
      app: {
        ourServices: 'خدماتنا',
        myRequests: 'طلباتي',
        invoices: 'الفواتير',
        profile: 'ملف المؤسسة',
        archives: 'الأرشيف',
        sidebarServices: 'الخدمات',
        sidebarRequests: 'طلباتي',
        sidebarInvoices: 'الفواتير',
        sidebarArchives: 'الأرشيف',
        sidebarProfile: 'الملف الشخصي',
        sidebarLogout: 'تسجيل الخروج',
        requestNum: 'رقم الطلب',
        service: 'الخدمة',
        submitDate: 'تاريخ التقديم',
        status: 'الحالة',
        action: 'إجراء',
        viewDetails: 'عرض التفاصيل',
        invoiceNum: 'رقم الفاتورة',
        date: 'التاريخ',
        amount: 'المبلغ',
        paymentStatus: 'حالة الدفع',
        saveChanges: 'حفظ التعديلات',
        preferredLang: 'اللغة المفضلة',
        schoolType: 'نوع المؤسسة',
        directorName: 'اسم المدير',
        secondaryPhone: 'هاتف ثانوي',
        address: 'العنوان',
        statusCompleted: 'مكتمل',
        statusProgress: 'قيد التنفيذ',
        statusReview: 'قيد المراجعة',
        statusNew: 'جديد',
        statusCancelled: 'ملغى',
        paid: 'مدفوع',
        pending: 'قيد الانتظار',
        overdue: 'متأخر'
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
        user: 'User',
        myAccount: 'My account',
        myProfile: 'My profile',
        myRequests: 'My requests',
        invoices: 'Invoices'
      },
      hero: {
        subtitle: 'SMARTSERVICES Schools',
        indexTitle: 'All your institution services... <span class="orange">in one place.</span>',
        indexDesc: 'A B2B platform dedicated to public and private schools and educational institutions in Morocco. Centralize all your operational service requests and simplify your management.',
        createAccount: 'Create account',
        signIn: 'Sign in',
        quickRequest: 'Quick request',
        contactTitle: 'Contact <span class="orange">us</span>',
        contactDesc: 'Have a question? Need information? Our team is here to help you.',
        faqTitle: 'Frequently Asked <span class="orange">Questions</span>',
        faqDesc: 'Quickly find answers to the most common questions about our services.',
        howTitle: 'How does it <span class="orange">work?</span>',
        howDesc: 'Our platform simplifies the management of your institution\'s operational services in 3 simple steps.',
        servicesTitle: 'Our <span class="orange">Services</span>',
        servicesDesc: 'Discover all our operational services for educational institutions.'
      },
      services: {
        sectionTitle: 'Our <span class="orange">Services</span>',
        sectionSubtitle: 'All the operational services your institution needs, gathered on a single platform.',
        requestBtn: 'Request this service',
        customRequestBtn: 'Make a request',
        supplies: { title: 'Office supplies', desc: 'Stationery, ink cartridges, binders, administrative supplies, office furniture.' },
        printing: { title: 'Printing services', desc: 'Certificates, banners, signage, flyers, business cards, books, custom prints.' },
        events: { title: 'Event organization', desc: 'Ceremonies, open days, conferences, school trips, end-of-year parties.' },
        gifts: { title: 'School gifts & awards', desc: 'Trophies, medals, cups, certificates, end-of-year gifts, prize packages.' },
        giveaways: { title: 'School goodies', desc: 'Custom items: notebooks, pens, bags, uniforms, clothing in institution colors.' },
        repair: { title: 'IT & CCTV repair', desc: 'Computer repair, surveillance camera installation, equipment maintenance.' },
        wifi: { title: 'Wi-Fi network repair', desc: 'Installation, troubleshooting and optimization of the Wi-Fi network throughout the institution.' },
        photo: { title: 'Photography & documentation', desc: 'School photos, event coverage, institutional videos, educational documentation.' },
        printer: { title: 'Printer maintenance', desc: 'Repair, maintenance, spare parts and cartridges for all types of printers.' },
        consulting: { title: 'Consulting', desc: 'School management consulting, process audit, digital transformation support.' },
        programming: { title: 'Programming & Development', desc: 'Website development, mobile applications, management software, e-learning solutions and custom platforms.' },
        custom: { title: 'Request a custom service', desc: "Can't find what you're looking for? Describe your need and we'll find the solution." }
      },
      steps: {
        sectionTitle: 'How does it <span class="orange">work?</span>',
        step1Title: 'You submit a request',
        step1Desc: 'Choose the service you need and fill out a simple, quick form.',
        step2Title: 'We manage execution',
        step2Desc: 'Our team handles your request and coordinates the best providers.',
        step3Title: 'You receive your service',
        step3Desc: 'Track your request progress and receive your service on time.'
      },
      benefits: {
        sectionTitle: 'Why <span class="orange">SMARTSERVICES Schools?</span>',
        timeTitle: 'Time savings',
        timeDesc: 'No need to contact multiple suppliers. One platform for all your needs.',
        costTitle: 'Cost optimization',
        costDesc: 'Negotiated rates through our partner network and group purchasing volume.',
        trackingTitle: 'Transparent tracking',
        trackingDesc: 'Track all your requests in real time from your dashboard.',
        supportTitle: 'Dedicated support',
        supportDesc: 'A dedicated account manager to support you at every step.'
      },
      process: {
        sectionTitle: 'Our <span class="orange">Process</span>',
        sectionSubtitle: 'A transparent and efficient process for every service',
        submitTitle: 'Request submission',
        submitDesc: 'Select your service, fill out the form with necessary details and submit your request in a few clicks.',
        reviewTitle: 'Review and validation',
        reviewDesc: 'Our team reviews your request, validates details and starts processing within 24h.',
        executeTitle: 'Coordination and execution',
        executeDesc: 'We select the best providers and coordinate execution of your request with real-time tracking.',
        deliverTitle: 'Delivery and follow-up',
        deliverDesc: 'Receive your service on agreed deadlines and access all tracking documents from your dashboard.'
      },
      cta: {
        title: 'Ready to simplify your institution management?',
        subtitle: 'Join the schools that already trust us in Morocco.',
        btn: 'Create a free account',
        faqTitle: "Didn't find your answer?",
        faqSubtitle: 'Contact us directly and our team will respond as soon as possible.',
        faqBtn: 'Contact us'
      },
      contact: {
        phone: 'Phone',
        email: 'Email'
      },
      faq: {
        q1Title: 'How do I create an account?',
        q1Desc: 'Click "Create account", fill out the form with your information and confirm. You will receive a confirmation email.',
        q2Title: 'What are the processing times?',
        q2Desc: 'Requests are generally processed within 24 to 48 business hours depending on the type of service requested.',
        q3Title: 'How do I track my request?',
        q3Desc: 'Log in to your account and go to "My requests" to track progress in real time.',
        q4Title: 'What payment methods do you accept?',
        q4Desc: 'We accept bank transfers, checks and online payments through our secure platform.',
        q5Title: 'Is my data secure?',
        q5Desc: 'Yes, all your data is encrypted and stored on secure servers compliant with international standards.',
        q6Title: 'Can I cancel a request?',
        q6Desc: 'Yes, you can cancel a request as long as it has not been taken over by our teams. Contact us as soon as possible.'
      },
      footer: {
        desc: 'The B2B platform that centralizes all operational services for educational institutions in Morocco.',
        services: 'Services',
        company: 'Company',
        about: 'About',
        howItWorks: 'How it works',
        contact: 'Contact',
        faq: 'FAQ',
        location: 'Tangier, Morocco',
        copyright: 'WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri'
      },
      auth: {
        loginTitle: 'Login',
        signupTitle: 'Create account',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        fullName: 'Full name',
        school: 'Institution',
        phone: 'Phone',
        loginBtn: 'Sign in',
        signupBtn: 'Create my account',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        emailPlaceholder: 'your@email.com',
        passwordPlaceholder: 'Your password',
        namePlaceholder: 'Your name',
        schoolPlaceholder: 'School name',
        phonePlaceholder: '+212 6XX XX XX XX',
        passwordMinPlaceholder: 'Min. 6 characters',
        confirmPlaceholder: 'Repeat password'
      },
      form: {
        newRequest: 'New request',
        requestPrefix: 'Request: ',
        schoolName: 'Institution name',
        city: 'City',
        contactName: 'Contact name',
        description: 'Detailed description of need',
        attachFiles: 'Attach documents (PDF, Images)',
        desiredDate: 'Desired date',
        submit: 'Submit request',
        backToServices: 'Back to services',
        uploadText: 'Drag your files here or click to browse',
        uploadHint: 'PDF, PNG, JPG, JPEG, GIF, WEBP (max 10MB per file)',
        schoolPlaceholder: 'Ex: Groupe Scolaire L\'Univers',
        cityPlaceholder: 'Ex: Casablanca',
        emailPlaceholder: 'contact@institution.ma',
        descPlaceholder: 'Describe precisely what you need...',
        successMsg: 'Your request has been submitted successfully! A SMARTSERVICES representative will contact you shortly.'
      },
      app: {
        ourServices: 'Our Services',
        myRequests: 'My requests',
        invoices: 'Invoices',
        profile: 'Institution profile',
        archives: 'Archives',
        sidebarServices: 'Services',
        sidebarRequests: 'My requests',
        sidebarInvoices: 'Invoices',
        sidebarArchives: 'Archives',
        sidebarProfile: 'Profile',
        sidebarLogout: 'Logout',
        requestNum: 'Request #',
        service: 'Service',
        submitDate: 'Submission date',
        status: 'Status',
        action: 'Action',
        viewDetails: 'View details',
        invoiceNum: 'Invoice #',
        date: 'Date',
        amount: 'Amount',
        paymentStatus: 'Payment status',
        saveChanges: 'Save changes',
        preferredLang: 'Preferred language',
        schoolType: 'Institution type',
        directorName: 'Director name',
        secondaryPhone: 'Secondary phone',
        address: 'Address',
        statusCompleted: 'Completed',
        statusProgress: 'In progress',
        statusReview: 'Under review',
        statusNew: 'New',
        statusCancelled: 'Cancelled',
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue'
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

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = t(key);
      if (text) document.title = text;
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
    if (!translations[lang]) lang = 'fr';
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
  }

  return { t, setLanguage, init, applyTranslations, getLang: () => currentLang, translations };
})();

window.I18n = I18n;


// Extra translation keys added by add_i18n_attrs.py.
Object.assign(window.I18n.translations.fr, { formFields: { rewardType:'Type de récompense souhaitée',suppliesType:'Type de fournitures',articleType:"Type d'article",printType:"Type d'impression",eventType:"Type d'événement",equipmentType:"Type d'équipement",interventionType:"Type d'intervention",prestationType:'Type de prestation',consultingDomain:'Domaine de consulting',serviceCategory:'Catégorie du service',estimatedQuantity:'Quantité estimée',estimatedBudget:'Budget estimé (MAD)',estimatedParticipants:'Nombre de participants estimé',equipmentCount:"Nombre d'équipements",coverageSurface:'Surface à couvrir (m²)',estimatedHours:'Durée estimée (heures)',printerCount:"Nombre d'imprimantes",estimatedDays:'Durée estimée (jours)' }, options: { trophies:'Trophées',medals:'Médailles',cups:'Coupes',certificates:'Certificats',prizePacks:'Lots de remise des prix',other:'Autre',stationery:'Papeterie',inkCartridges:"Cartouches d'encre",bindersStorage:'Classeurs et rangement',officeFurniture:'Mobilier de bureau',adminSupplies:'Fournitures administratives',customNotebooks:'Cahiers personnalisés',customPens:'Stylos personnalisés',customBags:'Sacs personnalisés',uniforms:'Uniformes',brandedClothes:"Vêtements aux couleurs de l'établissement",banners:'Bannières',signage:'Signalétique',flyers:'Flyers',businessCards:'Cartes de visite',books:'Livres',customPrints:'Impressions personnalisées',awardCeremony:'Cérémonie de remise des prix',openDay:'Journée portes ouvertes',conference:'Conférence',schoolTrip:'Sortie scolaire',yearEndParty:"Fête de fin d'année",desktopComputer:'Ordinateur fixe',laptop:'Ordinateur portable',securityCamera:'Caméra de surveillance',networkEquipment:'Équipement réseau',newInstallation:'Nouvelle installation',troubleshooting:'Dépannage',networkOptimization:'Optimisation du réseau',coverageExtension:'Extension de couverture',schoolPhotos:'Photos scolaires',eventCoverage:"Couverture d'événement",institutionalVideo:'Vidéo institutionnelle',educationalDocumentation:'Documentation pédagogique',repair:'Réparation',preventiveMaintenance:'Entretien préventif',spareParts:'Fourniture de pièces',schoolManagement:'Gestion scolaire',processAudit:'Audit des processus',digitalTransformation:'Transformation numérique',staffTraining:'Formation du personnel',generalServices:'Services généraux',equipment:'Équipement',training:'Formation',maintenance:'Maintenance',privateSchool:'École privée',publicSchool:'École publique',trainingInstitute:'Institut de formation',french:'Français',arabic:'العربية',english:'English' } });
Object.assign(window.I18n.translations.ar, { formFields: { rewardType:'نوع المكافأة المطلوبة',suppliesType:'نوع اللوازم',articleType:'نوع المنتج',printType:'نوع الطباعة',eventType:'نوع الفعالية',equipmentType:'نوع المعدات',interventionType:'نوع التدخل',prestationType:'نوع الخدمة',consultingDomain:'مجال الاستشارة',serviceCategory:'فئة الخدمة',estimatedQuantity:'الكمية المقدرة',estimatedBudget:'الميزانية المقدرة (درهم)',estimatedParticipants:'عدد المشاركين المقدر',equipmentCount:'عدد المعدات',coverageSurface:'المساحة المطلوب تغطيتها (م²)',estimatedHours:'المدة المقدرة (ساعات)',printerCount:'عدد الطابعات',estimatedDays:'المدة المقدرة (أيام)' }, options: { trophies:'كؤوس',medals:'ميداليات',cups:'جوائز',certificates:'شهادات',prizePacks:'حزم توزيع الجوائز',other:'أخرى',stationery:'قرطاسية',inkCartridges:'خراطيش حبر',bindersStorage:'ملفات وتخزين',officeFurniture:'أثاث مكتبي',adminSupplies:'لوازم إدارية',customNotebooks:'دفاتر مخصصة',customPens:'أقلام مخصصة',customBags:'حقائب مخصصة',uniforms:'زي موحد',brandedClothes:'ملابس بألوان المؤسسة',banners:'لافتات',signage:'لافتات إرشادية',flyers:'منشورات',businessCards:'بطاقات عمل',books:'كتب',customPrints:'طباعات مخصصة',awardCeremony:'حفل توزيع الجوائز',openDay:'يوم الأبواب المفتوحة',conference:'ندوة',schoolTrip:'رحلة مدرسية',yearEndParty:'حفل نهاية السنة',desktopComputer:'حاسوب مكتبي',laptop:'حاسوب محمول',securityCamera:'كاميرا مراقبة',networkEquipment:'معدات الشبكة',newInstallation:'تركيب جديد',troubleshooting:'إصلاح الأعطال',networkOptimization:'تحسين الشبكة',coverageExtension:'توسيع التغطية',schoolPhotos:'صور مدرسية',eventCoverage:'تغطية فعالية',institutionalVideo:'فيديو مؤسسي',educationalDocumentation:'توثيق تربوي',repair:'إصلاح',preventiveMaintenance:'صيانة وقائية',spareParts:'توفير قطع الغيار',schoolManagement:'إدارة مدرسية',processAudit:'تدقيق العمليات',digitalTransformation:'التحول الرقمي',staffTraining:'تكوين الموظفين',generalServices:'خدمات عامة',equipment:'معدات',training:'تكوين',maintenance:'صيانة',privateSchool:'مدرسة خاصة',publicSchool:'مدرسة عمومية',trainingInstitute:'معهد تكوين',french:'Français',arabic:'العربية',english:'English' } });
Object.assign(window.I18n.translations.en, { formFields: { rewardType:'Desired award type',suppliesType:'Supply type',articleType:'Item type',printType:'Print type',eventType:'Event type',equipmentType:'Equipment type',interventionType:'Intervention type',prestationType:'Service type',consultingDomain:'Consulting area',serviceCategory:'Service category',estimatedQuantity:'Estimated quantity',estimatedBudget:'Estimated budget (MAD)',estimatedParticipants:'Estimated participants',equipmentCount:'Number of devices',coverageSurface:'Area to cover (m²)',estimatedHours:'Estimated duration (hours)',printerCount:'Number of printers',estimatedDays:'Estimated duration (days)' }, options: { trophies:'Trophies',medals:'Medals',cups:'Cups',certificates:'Certificates',prizePacks:'Prize packages',other:'Other',stationery:'Stationery',inkCartridges:'Ink cartridges',bindersStorage:'Binders and storage',officeFurniture:'Office furniture',adminSupplies:'Administrative supplies',customNotebooks:'Custom notebooks',customPens:'Custom pens',customBags:'Custom bags',uniforms:'Uniforms',brandedClothes:'Clothing in institution colors',banners:'Banners',signage:'Signage',flyers:'Flyers',businessCards:'Business cards',books:'Books',customPrints:'Custom prints',awardCeremony:'Awards ceremony',openDay:'Open day',conference:'Conference',schoolTrip:'School trip',yearEndParty:'End-of-year party',desktopComputer:'Desktop computer',laptop:'Laptop',securityCamera:'Security camera',networkEquipment:'Network equipment',newInstallation:'New installation',troubleshooting:'Troubleshooting',networkOptimization:'Network optimization',coverageExtension:'Coverage extension',schoolPhotos:'School photos',eventCoverage:'Event coverage',institutionalVideo:'Institutional video',educationalDocumentation:'Educational documentation',repair:'Repair',preventiveMaintenance:'Preventive maintenance',spareParts:'Spare parts supply',schoolManagement:'School management',processAudit:'Process audit',digitalTransformation:'Digital transformation',staffTraining:'Staff training',generalServices:'General services',equipment:'Equipment',training:'Training',maintenance:'Maintenance',privateSchool:'Private school',publicSchool:'Public school',trainingInstitute:'Training institute',french:'Français',arabic:'العربية',english:'English' } });
