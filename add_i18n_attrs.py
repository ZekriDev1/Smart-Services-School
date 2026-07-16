"""Add/repair i18n attributes for the SMARTSERVICES Schools website.

Run manually from the project root:
  python add_i18n_attrs.py

Safe to run more than once.
"""
from pathlib import Path
import re

PAGES = ["index.html", "services.html", "contact.html", "faq.html", "fonctionnement.html", "app.html"]

EXACT = {
    # Top nav / header
    '<a href="index.html" class="active">Accueil</a>': '<a href="index.html" class="active" data-i18n="nav.home">Accueil</a>',
    '<a href="index.html">Accueil</a>': '<a href="index.html" data-i18n="nav.home">Accueil</a>',
    '<a href="services.html" class="active">Services</a>': '<a href="services.html" class="active" data-i18n="nav.services">Services</a>',
    '<a href="services.html">Services</a>': '<a href="services.html" data-i18n="nav.services">Services</a>',
    '<a href="fonctionnement.html" class="active">Fonctionnement</a>': '<a href="fonctionnement.html" class="active" data-i18n="nav.howItWorks">Fonctionnement</a>',
    '<a href="fonctionnement.html">Fonctionnement</a>': '<a href="fonctionnement.html" data-i18n="nav.howItWorks">Fonctionnement</a>',
    '<a href="contact.html" class="active">Contact</a>': '<a href="contact.html" class="active" data-i18n="nav.contact">Contact</a>',
    '<a href="contact.html">Contact</a>': '<a href="contact.html" data-i18n="nav.contact">Contact</a>',
    'auth-login-btn" onclick="event.preventDefault(); openLoginModal()">Connexion</a>': 'auth-login-btn" onclick="event.preventDefault(); openLoginModal()" data-i18n="nav.login">Connexion</a>',
    'auth-signup-btn" onclick="event.preventDefault(); openSignupModal()">Créer un compte</a>': 'auth-signup-btn" onclick="event.preventDefault(); openSignupModal()" data-i18n="nav.signup">Créer un compte</a>',
    'auth-logout-btn" onclick="event.preventDefault(); handleLogout()" style="display:none;"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>': 'auth-logout-btn" onclick="event.preventDefault(); handleLogout()" style="display:none;"><i class="fas fa-sign-out-alt"></i> <span data-i18n="nav.logout">Déconnexion</span></a>',
    '<span class="auth-user-name">Utilisateur</span>': '<span class="auth-user-name" data-i18n="nav.user">Utilisateur</span>',

    # Hero titles / section titles
    '<span class="hero-subtitle">SMARTSERVICES Schools</span>': '<span class="hero-subtitle" data-i18n="hero.subtitle">SMARTSERVICES Schools</span>',
    '<h1>Tous les services de votre établissement... <span class="orange">en un seul endroit.</span></h1>': '<h1 data-i18n-html="hero.indexTitle">Tous les services de votre établissement... <span class="orange">en un seul endroit.</span></h1>',
    '<h1>Nos <span class="orange">Services</span></h1>': '<h1 data-i18n-html="hero.servicesTitle">Nos <span class="orange">Services</span></h1>',
    '<h1>Contactez-<span class="orange">nous</span></h1>': '<h1 data-i18n-html="hero.contactTitle">Contactez-<span class="orange">nous</span></h1>',
    '<h1>Questions <span class="orange">Fréquentes</span></h1>': '<h1 data-i18n-html="hero.faqTitle">Questions <span class="orange">Fréquentes</span></h1>',
    '<h1>Comment ça <span class="orange">marche ?</span></h1>': '<h1 data-i18n-html="hero.howTitle">Comment ça <span class="orange">marche ?</span></h1>',
    '<h2 class="section-title">Nos <span class="orange">Services</span></h2>': '<h2 class="section-title" data-i18n-html="services.sectionTitle">Nos <span class="orange">Services</span></h2>',
    '<h2 class="section-title">Comment ça <span class="orange">marche ?</span></h2>': '<h2 class="section-title" data-i18n-html="steps.sectionTitle">Comment ça <span class="orange">marche ?</span></h2>',
    '<h2 class="section-title">Pourquoi <span class="orange">SMARTSERVICES Schools ?</span></h2>': '<h2 class="section-title" data-i18n-html="benefits.sectionTitle">Pourquoi <span class="orange">SMARTSERVICES Schools ?</span></h2>',
    '<h2>Prêt à simplifier la gestion de votre établissement ?</h2>': '<h2 data-i18n="cta.title">Prêt à simplifier la gestion de votre établissement ?</h2>',
    '<h2>Vous n\'avez pas trouvé votre réponse ?</h2>': '<h2 data-i18n="cta.faqTitle">Vous n\'avez pas trouvé votre réponse ?</h2>',

    # Buttons / CTA
    '<a href="#" class="btn btn-outline" onclick="event.preventDefault(); openLoginModal()">Se connecter</a>': '<a href="#" class="btn btn-outline" onclick="event.preventDefault(); openLoginModal()" data-i18n="hero.signIn">Se connecter</a>',
    '<i class="fas fa-bolt"></i> Demande rapide</a>': '<i class="fas fa-bolt"></i> <span data-i18n="hero.quickRequest">Demande rapide</span></a>',
    '<i class="fas fa-plus"></i> Demande rapide': '<i class="fas fa-plus"></i> <span data-i18n="hero.quickRequest">Demande rapide</span>',
    'Créer un compte gratuitement <i class="fas fa-arrow-right"></i>': '<span data-i18n="cta.btn">Créer un compte gratuitement</span> <i class="fas fa-arrow-right"></i>',
    'Nous contacter <i class="fas fa-arrow-right"></i>': '<span data-i18n="cta.faqBtn">Nous contacter</span> <i class="fas fa-arrow-right"></i>',
    '<i class="fas fa-arrow-left"></i> Retour aux services': '<i class="fas fa-arrow-left"></i> <span data-i18n="form.backToServices">Retour aux services</span>',
    '<i class="fas fa-paper-plane"></i> Soumettre la demande': '<i class="fas fa-paper-plane"></i> <span data-i18n="form.submit">Soumettre la demande</span>',
    '<i class="fas fa-save"></i> Enregistrer les modifications': '<i class="fas fa-save"></i> <span data-i18n="app.saveChanges">Enregistrer les modifications</span>',

    # Service cards
    '<h3>Fournitures de bureau</h3>': '<h3 data-i18n="services.supplies.title">Fournitures de bureau</h3>',
    '<h3>Services d\'impression</h3>': '<h3 data-i18n="services.printing.title">Services d\'impression</h3>',
    '<h3>Organisation d\'événements</h3>': '<h3 data-i18n="services.events.title">Organisation d\'événements</h3>',
    '<h3>Cadeaux & Récompenses scolaires</h3>': '<h3 data-i18n="services.gifts.title">Cadeaux & Récompenses scolaires</h3>',
    '<h3>Goodies scolaires</h3>': '<h3 data-i18n="services.giveaways.title">Goodies scolaires</h3>',
    '<h3>Réparation informatique & CCTV</h3>': '<h3 data-i18n="services.repair.title">Réparation informatique & CCTV</h3>',
    '<h3>Réparation réseau Wi-Fi</h3>': '<h3 data-i18n="services.wifi.title">Réparation réseau Wi-Fi</h3>',
    '<h3>Photographie & Documentation</h3>': '<h3 data-i18n="services.photo.title">Photographie & Documentation</h3>',
    '<h3>Maintenance d\'imprimantes</h3>': '<h3 data-i18n="services.printer.title">Maintenance d\'imprimantes</h3>',
    '<h3>Consulting</h3>': '<h3 data-i18n="services.consulting.title">Consulting</h3>',
    '<h3>Demander un service personnalisé</h3>': '<h3 data-i18n="services.custom.title">Demander un service personnalisé</h3>',
    '>Demander ce service</button>': ' data-i18n="services.requestBtn">Demander ce service</button>',
    '>Faire une demande</button>': ' data-i18n="services.customRequestBtn">Faire une demande</button>',

    # Steps / benefits / FAQ / contact
    '<h3>Vous soumettez une demande</h3>': '<h3 data-i18n="steps.step1Title">Vous soumettez une demande</h3>',
    '<h3>Nous gérons l\'exécution</h3>': '<h3 data-i18n="steps.step2Title">Nous gérons l\'exécution</h3>',
    '<h3>Vous recevez votre service</h3>': '<h3 data-i18n="steps.step3Title">Vous recevez votre service</h3>',
    '<h3>Gain de temps</h3>': '<h3 data-i18n="benefits.timeTitle">Gain de temps</h3>',
    '<h3>Optimisation des coûts</h3>': '<h3 data-i18n="benefits.costTitle">Optimisation des coûts</h3>',
    '<h3>Suivi transparent</h3>': '<h3 data-i18n="benefits.trackingTitle">Suivi transparent</h3>',
    '<h3>Accompagnement dédié</h3>': '<h3 data-i18n="benefits.supportTitle">Accompagnement dédié</h3>',
    '<h3>Comment créer un compte ?</h3>': '<h3 data-i18n="faq.q1Title">Comment créer un compte ?</h3>',
    '<h3>Quels sont les délais de traitement ?</h3>': '<h3 data-i18n="faq.q2Title">Quels sont les délais de traitement ?</h3>',
    '<h3>Comment suivre ma demande ?</h3>': '<h3 data-i18n="faq.q3Title">Comment suivre ma demande ?</h3>',
    '<h3>Quels modes de paiement acceptez-vous ?</h3>': '<h3 data-i18n="faq.q4Title">Quels modes de paiement acceptez-vous ?</h3>',
    '<h3>Mes données sont-elles sécurisées ?</h3>': '<h3 data-i18n="faq.q5Title">Mes données sont-elles sécurisées ?</h3>',
    '<h3>Puis-je annuler une demande ?</h3>': '<h3 data-i18n="faq.q6Title">Puis-je annuler une demande ?</h3>',
    '<h3>Téléphone</h3>': '<h3 data-i18n="contact.phone">Téléphone</h3>',
    '<h3>Email</h3>': '<h3 data-i18n="contact.email">Email</h3>',

    # Footer
    '<h4>Services</h4>': '<h4 data-i18n="footer.services">Services</h4>',
    '<h4>Entreprise</h4>': '<h4 data-i18n="footer.company">Entreprise</h4>',
    '<h4>Contact</h4>': '<h4 data-i18n="footer.contact">Contact</h4>',
    '<a href="index.html">À propos</a>': '<a href="index.html" data-i18n="footer.about">À propos</a>',
    '<a href="fonctionnement.html">Comment ça marche</a>': '<a href="fonctionnement.html" data-i18n="footer.howItWorks">Comment ça marche</a>',
    '<a href="faq.html">FAQ</a>': '<a href="faq.html" data-i18n="footer.faq">FAQ</a>',
    '<a href="#"><i class="fas fa-map-marker-alt"></i> Tanger, Maroc</a>': '<a href="#"><i class="fas fa-map-marker-alt"></i> <span data-i18n="footer.location">Tanger, Maroc</span></a>',
    '<p>WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri</p>': '<p data-i18n="footer.copyright">WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri</p>',
    '<a href="services.html">Fournitures de bureau</a>': '<a href="services.html" data-i18n="services.supplies.title">Fournitures de bureau</a>',
    '<a href="services.html">Services d\'impression</a>': '<a href="services.html" data-i18n="services.printing.title">Services d\'impression</a>',
    '<a href="services.html">Événements</a>': '<a href="services.html" data-i18n="services.events.title">Événements</a>',
    '<a href="services.html">Cadeaux & Récompenses</a>': '<a href="services.html" data-i18n="services.gifts.title">Cadeaux & Récompenses</a>',
    '<a href="services.html">Goodies</a>': '<a href="services.html" data-i18n="services.giveaways.title">Goodies</a>',

    # Auth and request forms
    '<h2>Connexion</h2>': '<h2 data-i18n="auth.loginTitle">Connexion</h2>',
    '<h2>Créer un compte</h2>': '<h2 data-i18n="auth.signupTitle">Créer un compte</h2>',
    '<h2 id="modalTitle">Nouvelle demande</h2>': '<h2 id="modalTitle" data-i18n="form.newRequest">Nouvelle demande</h2>',
    '<h1 id="formTitle">Nouvelle demande</h1>': '<h1 id="formTitle" data-i18n="form.newRequest">Nouvelle demande</h1>',
    '<label>Email</label>': '<label data-i18n="auth.email">Email</label>',
    '<label>Mot de passe</label>': '<label data-i18n="auth.password">Mot de passe</label>',
    '<label>Confirmer le mot de passe</label>': '<label data-i18n="auth.confirmPassword">Confirmer le mot de passe</label>',
    '<label>Nom complet</label>': '<label data-i18n="auth.fullName">Nom complet</label>',
    '<label>Établissement</label>': '<label data-i18n="auth.school">Établissement</label>',
    '<label>Téléphone</label>': '<label data-i18n="auth.phone">Téléphone</label>',
    '<label>Nom de l\'établissement</label>': '<label data-i18n="form.schoolName">Nom de l\'établissement</label>',
    '<label>Ville</label>': '<label data-i18n="form.city">Ville</label>',
    '<label>Nom du contact</label>': '<label data-i18n="form.contactName">Nom du contact</label>',
    '<label>Description détaillée du besoin</label>': '<label data-i18n="form.description">Description détaillée du besoin</label>',
    '<label>Joindre des documents (PDF, Images)</label>': '<label data-i18n="form.attachFiles">Joindre des documents (PDF, Images)</label>',
    '<label>Date souhaitée</label>': '<label data-i18n="form.desiredDate">Date souhaitée</label>',
    'placeholder="votre@email.com"': 'placeholder="votre@email.com" data-i18n-placeholder="auth.emailPlaceholder"',
    'placeholder="Votre mot de passe"': 'placeholder="Votre mot de passe" data-i18n-placeholder="auth.passwordPlaceholder"',
    'placeholder="Votre nom"': 'placeholder="Votre nom" data-i18n-placeholder="auth.namePlaceholder"',
    'placeholder="Nom de l\'école"': 'placeholder="Nom de l\'école" data-i18n-placeholder="auth.schoolPlaceholder"',
    'placeholder="+212 6XX XX XX XX"': 'placeholder="+212 6XX XX XX XX" data-i18n-placeholder="auth.phonePlaceholder"',
    'placeholder="Min. 6 caractères"': 'placeholder="Min. 6 caractères" data-i18n-placeholder="auth.passwordMinPlaceholder"',
    'placeholder="Répétez le mot de passe"': 'placeholder="Répétez le mot de passe" data-i18n-placeholder="auth.confirmPlaceholder"',
    'placeholder="Ex: Groupe Scolaire........................"': 'placeholder="Ex: Groupe Scolaire........................" data-i18n-placeholder="form.schoolPlaceholder"',
    'placeholder="Ex: Casablanca"': 'placeholder="Ex: Casablanca" data-i18n-placeholder="form.cityPlaceholder"',
    'placeholder="contact@etablissement.ma"': 'placeholder="contact@etablissement.ma" data-i18n-placeholder="form.emailPlaceholder"',
    'placeholder="Décrivez précisément ce dont vous avez besoin..."': 'placeholder="Décrivez précisément ce dont vous avez besoin..." data-i18n-placeholder="form.descPlaceholder"',
    '<p class="upload-text">Glissez vos fichiers ici ou cliquez pour parcourir</p>': '<p class="upload-text" data-i18n="form.uploadText">Glissez vos fichiers ici ou cliquez pour parcourir</p>',
    '<p class="upload-hint">PDF, PNG, JPG, JPEG, GIF, WEBP (max 10MB par fichier)</p>': '<p class="upload-hint" data-i18n="form.uploadHint">PDF, PNG, JPG, JPEG, GIF, WEBP (max 10MB par fichier)</p>',
    '<i class="fas fa-sign-in-alt"></i> Se connecter': '<i class="fas fa-sign-in-alt"></i> <span data-i18n="auth.loginBtn">Se connecter</span>',
    '<i class="fas fa-user-plus"></i> Créer mon compte': '<i class="fas fa-user-plus"></i> <span data-i18n="auth.signupBtn">Créer mon compte</span>',
    'Pas encore de compte ?': '<span data-i18n="auth.noAccount">Pas encore de compte ?</span>',
    'Déjà un compte ?': '<span data-i18n="auth.hasAccount">Déjà un compte ?</span>',
    'switchToSignup()">Créer un compte</a>': 'switchToSignup()" data-i18n="nav.signup">Créer un compte</a>',
    'switchToLogin()">Se connecter</a>': 'switchToLogin()" data-i18n="auth.loginBtn">Se connecter</a>',
}

APP = {
    '<a href="app.html" class="active">Services</a>': '<a href="app.html" class="active" data-i18n="app.sidebarServices">Services</a>',
    '<a href="app.html">Mes demandes</a>': '<a href="app.html" data-i18n="app.sidebarRequests">Mes demandes</a>',
    '<a href="app.html">Factures</a>': '<a href="app.html" data-i18n="app.sidebarInvoices">Factures</a>',
    '<i class="fas fa-user-circle"></i> Mon compte': '<i class="fas fa-user-circle"></i> <span data-i18n="nav.myAccount">Mon compte</span>',
    '<i class="fas fa-user"></i> Mon profil': '<i class="fas fa-user"></i> <span data-i18n="nav.myProfile">Mon profil</span>',
    '<a href="#" class="active"><i class="fas fa-th-large"></i> Services</a>': '<a href="#" class="active" data-view="services"><i class="fas fa-th-large"></i> <span data-i18n="app.sidebarServices">Services</span></a>',
    '<a href="#"><i class="fas fa-file-alt"></i> Mes demandes</a>': '<a href="#" data-view="requests"><i class="fas fa-file-alt"></i> <span data-i18n="app.sidebarRequests">Mes demandes</span></a>',
    '<a href="#"><i class="fas fa-file-invoice"></i> Factures</a>': '<a href="#" data-view="invoices"><i class="fas fa-file-invoice"></i> <span data-i18n="app.sidebarInvoices">Factures</span></a>',
    '<a href="app.html"><i class="fas fa-archive"></i> Archives</a>': '<a href="app.html" data-view="archives"><i class="fas fa-archive"></i> <span data-i18n="app.sidebarArchives">Archives</span></a>',
    '<a href="app.html"><i class="fas fa-user-cog"></i> Profil</a>': '<a href="app.html" data-view="profile"><i class="fas fa-user-cog"></i> <span data-i18n="app.sidebarProfile">Profil</span></a>',
    '<a href="index.html"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>': '<a href="index.html"><i class="fas fa-sign-out-alt"></i> <span data-i18n="app.sidebarLogout">Déconnexion</span></a>',
    '<h1>Nos Services</h1>': '<h1 data-i18n="app.ourServices">Nos Services</h1>',
    '<h1>Mes demandes</h1>': '<h1 data-i18n="app.myRequests">Mes demandes</h1>',
    '<h1>Factures</h1>': '<h1 data-i18n="app.invoices">Factures</h1>',
    '<h1>Profil de l\'établissement</h1>': '<h1 data-i18n="app.profile">Profil de l\'établissement</h1>',
    '<th>N° Demande</th>': '<th data-i18n="app.requestNum">N° Demande</th>',
    '<th>NÂ° Demande</th>': '<th data-i18n="app.requestNum">NÂ° Demande</th>',
    '<th>Service</th>': '<th data-i18n="app.service">Service</th>',
    '<th>Date de soumission</th>': '<th data-i18n="app.submitDate">Date de soumission</th>',
    '<th>Statut</th>': '<th data-i18n="app.status">Statut</th>',
    '<th>Action</th>': '<th data-i18n="app.action">Action</th>',
    '<th>N° Facture</th>': '<th data-i18n="app.invoiceNum">N° Facture</th>',
    '<th>NÂ° Facture</th>': '<th data-i18n="app.invoiceNum">NÂ° Facture</th>',
    '<th>Date</th>': '<th data-i18n="app.date">Date</th>',
    '<th>Montant</th>': '<th data-i18n="app.amount">Montant</th>',
    '<th>Statut paiement</th>': '<th data-i18n="app.paymentStatus">Statut paiement</th>',
    '<button class="btn-view">Voir détails</button>': '<button class="btn-view" data-i18n="app.viewDetails">Voir détails</button>',
    '<span class="status-badge status-completed">Terminé</span>': '<span class="status-badge status-completed" data-i18n="app.statusCompleted">Terminé</span>',
    '<span class="status-badge status-progress">En cours</span>': '<span class="status-badge status-progress" data-i18n="app.statusProgress">En cours</span>',
    '<span class="status-badge status-review">En examen</span>': '<span class="status-badge status-review" data-i18n="app.statusReview">En examen</span>',
    '<span class="status-badge status-new">Nouveau</span>': '<span class="status-badge status-new" data-i18n="app.statusNew">Nouveau</span>',
    '<span class="status-badge status-cancelled">Annulé</span>': '<span class="status-badge status-cancelled" data-i18n="app.statusCancelled">Annulé</span>',
    '<span class="payment-paid">Payé</span>': '<span class="payment-paid" data-i18n="app.paid">Payé</span>',
    '<span class="payment-pending">En attente</span>': '<span class="payment-pending" data-i18n="app.pending">En attente</span>',
    '<span class="payment-overdue">En retard</span>': '<span class="payment-overdue" data-i18n="app.overdue">En retard</span>',
    '<label>Type d\'établissement</label>': '<label data-i18n="app.schoolType">Type d\'établissement</label>',
    '<label>Nom du directeur</label>': '<label data-i18n="app.directorName">Nom du directeur</label>',
    '<label>Téléphone secondaire</label>': '<label data-i18n="app.secondaryPhone">Téléphone secondaire</label>',
    '<label>Adresse</label>': '<label data-i18n="app.address">Adresse</label>',
    '<label>Langue préférée</label>': '<label data-i18n="app.preferredLang">Langue préférée</label>',
}

TEXT_KEYS = {
    "Une plateforme B2B dédiée aux écoles publiques, privées et établissements d'enseignement au Maroc. Centralisez toutes vos demandes de services opérationnels et simplifiez votre gestion.": "hero.indexDesc",
    "Découvrez tous nos services opérationnels pour établissements scolaires.": "hero.servicesDesc",
    "Tous les services opérationnels dont votre établissement a besoin, réunis sur une seule plateforme.": "services.sectionSubtitle",
    "Une question ? Besoin d'informations ? Notre équipe est à votre disposition pour vous accompagner.": "hero.contactDesc",
    "Trouvez rapidement des réponses aux questions les plus courantes sur nos services.": "hero.faqDesc",
    "Notre plateforme simplifie la gestion des services opérationnels de votre établissement en 3 étapes simples.": "hero.howDesc",
    "Choisissez le service dont vous avez besoin et remplissez un formulaire simple et rapide.": "steps.step1Desc",
    "Notre équipe prend en charge votre demande et coordonne les meilleurs prestataires.": "steps.step2Desc",
    "Suivez l'avancement de votre demande et recevez votre service dans les délais impartis.": "steps.step3Desc",
    "Plus besoin de contacter plusieurs fournisseurs. Une seule plateforme pour tous vos besoins.": "benefits.timeDesc",
    "Des tarifs négociés grâce à notre réseau de partenaires et notre volume d'achats groupés.": "benefits.costDesc",
    "Suivez l'état de toutes vos demandes en temps réel depuis votre tableau de bord.": "benefits.trackingDesc",
    "Un responsable de compte dédié pour vous accompagner à chaque étape.": "benefits.supportDesc",
    "La plateforme B2B qui centralise tous les services opérationnels pour les établissements scolaires au Maroc.": "footer.desc",
    'Cliquez sur "Créer un compte", remplissez le formulaire avec vos informations et validez. Vous recevrez un email de confirmation.': "faq.q1Desc",
    "Les demandes sont généralement traitées sous 24 à 48 heures ouvrables selon le type de service demandé.": "faq.q2Desc",
    'Connectez-vous à votre compte et accédez à "Mes demandes" pour suivre l\'état d\'avancement en temps réel.': "faq.q3Desc",
    "Nous acceptons les virements bancaires, chèques et paiements en ligne via notre plateforme sécurisée.": "faq.q4Desc",
    "Oui, toutes vos données sont chiffrées et stockées sur des serveurs sécurisés conformes aux normes internationales.": "faq.q5Desc",
    "Oui, vous pouvez annuler une demande tant qu'elle n'a pas été prise en charge par nos équipes. Contactez-nous au plus vite.": "faq.q6Desc",
    "Contactez-nous directement et notre équipe vous répondra dans les plus brefs délais.": "cta.faqSubtitle",
    "Papeterie, cartouches d'encre, classeurs, fournitures administratives, mobilier de bureau.": "services.supplies.desc",
    "Certificats, bannières, signalétique, flyers, cartes de visite, livres, impressions personnalisées.": "services.printing.desc",
    "Cérémonies, journées portes ouvertes, conférences, sorties scolaires, fêtes de fin d'année.": "services.events.desc",
    "Trophées, médailles, coupes, certificats, cadeaux de fin d'année, lots de remise des prix.": "services.gifts.desc",
    "Articles personnalisés : cahiers, stylos, sacs, uniformes, vêtements aux couleurs de l'établissement.": "services.giveaways.desc",
    "Réparation d'ordinateurs, installation de caméras de surveillance, maintenance des équipements.": "services.repair.desc",
    "Installation, dépannage et optimisation du réseau Wi-Fi dans l'ensemble de l'établissement.": "services.wifi.desc",
    "Photos scolaires, couverture d'événements, vidéos institutionnelles, documentation pédagogique.": "services.photo.desc",
    "Réparation, entretien, fourniture de pièces détachées et cartouches pour tous types d'imprimantes.": "services.printer.desc",
    "Conseil en gestion scolaire, audit des processus, accompagnement à la transformation numérique.": "services.consulting.desc",
    "Vous ne trouvez pas ce que vous cherchez ? Décrivez-nous votre besoin et nous vous trouverons la solution.": "services.custom.desc",
}

FIELD_KEYS = {
    "Type de récompense souhaitée": "formFields.rewardType", "Type de fournitures": "formFields.suppliesType",
    "Type d'article": "formFields.articleType", "Type d'impression": "formFields.printType",
    "Type d'événement": "formFields.eventType", "Type d'équipement": "formFields.equipmentType",
    "Type d'intervention": "formFields.interventionType", "Type de prestation": "formFields.prestationType",
    "Domaine de consulting": "formFields.consultingDomain", "Catégorie du service": "formFields.serviceCategory",
    "Quantité estimée": "formFields.estimatedQuantity", "Budget estimé (MAD)": "formFields.estimatedBudget",
    "Nombre de participants estimé": "formFields.estimatedParticipants", "Nombre d'équipements": "formFields.equipmentCount",
    "Surface à couvrir (m²)": "formFields.coverageSurface", "Durée estimée (heures)": "formFields.estimatedHours",
    "Nombre d'imprimantes": "formFields.printerCount", "Durée estimée (jours)": "formFields.estimatedDays",
}

OPTION_KEYS = {
    "Trophées": "trophies", "Médailles": "medals", "Coupes": "cups", "Certificats": "certificates",
    "Lots de remise des prix": "prizePacks", "Autre": "other", "Papeterie": "stationery",
    "Cartouches d'encre": "inkCartridges", "Classeurs et rangement": "bindersStorage",
    "Mobilier de bureau": "officeFurniture", "Fournitures administratives": "adminSupplies",
    "Cahiers personnalisés": "customNotebooks", "Stylos personnalisés": "customPens",
    "Sacs personnalisés": "customBags", "Uniformes": "uniforms",
    "Vêtements aux couleurs de l'établissement": "brandedClothes", "Bannières": "banners",
    "Signalétique": "signage", "Flyers": "flyers", "Cartes de visite": "businessCards",
    "Livres": "books", "Impressions personnalisées": "customPrints",
    "Cérémonie de remise des prix": "awardCeremony", "Journée portes ouvertes": "openDay",
    "Conférence": "conference", "Sortie scolaire": "schoolTrip", "Fête de fin d'année": "yearEndParty",
    "Ordinateur fixe": "desktopComputer", "Ordinateur portable": "laptop",
    "Caméra de surveillance": "securityCamera", "Équipement réseau": "networkEquipment",
    "Nouvelle installation": "newInstallation", "Dépannage": "troubleshooting",
    "Optimisation du réseau": "networkOptimization", "Extension de couverture": "coverageExtension",
    "Photos scolaires": "schoolPhotos", "Couverture d'événement": "eventCoverage",
    "Vidéo institutionnelle": "institutionalVideo", "Documentation pédagogique": "educationalDocumentation",
    "Réparation": "repair", "Entretien préventif": "preventiveMaintenance", "Fourniture de pièces": "spareParts",
    "Gestion scolaire": "schoolManagement", "Audit des processus": "processAudit",
    "Transformation numérique": "digitalTransformation", "Formation du personnel": "staffTraining",
    "Services généraux": "generalServices", "Équipement": "equipment", "Formation": "training",
    "Maintenance": "maintenance", "École privée": "privateSchool", "École publique": "publicSchool",
    "Institut de formation": "trainingInstitute", "Français": "french", "العربية": "arabic", "English": "english",
}

EXTRA_JS = r"""

// Extra translation keys added by add_i18n_attrs.py.
Object.assign(window.I18n.translations.fr, { formFields: { rewardType:'Type de récompense souhaitée',suppliesType:'Type de fournitures',articleType:"Type d'article",printType:"Type d'impression",eventType:"Type d'événement",equipmentType:"Type d'équipement",interventionType:"Type d'intervention",prestationType:'Type de prestation',consultingDomain:'Domaine de consulting',serviceCategory:'Catégorie du service',estimatedQuantity:'Quantité estimée',estimatedBudget:'Budget estimé (MAD)',estimatedParticipants:'Nombre de participants estimé',equipmentCount:"Nombre d'équipements",coverageSurface:'Surface à couvrir (m²)',estimatedHours:'Durée estimée (heures)',printerCount:"Nombre d'imprimantes",estimatedDays:'Durée estimée (jours)' }, options: { trophies:'Trophées',medals:'Médailles',cups:'Coupes',certificates:'Certificats',prizePacks:'Lots de remise des prix',other:'Autre',stationery:'Papeterie',inkCartridges:"Cartouches d'encre",bindersStorage:'Classeurs et rangement',officeFurniture:'Mobilier de bureau',adminSupplies:'Fournitures administratives',customNotebooks:'Cahiers personnalisés',customPens:'Stylos personnalisés',customBags:'Sacs personnalisés',uniforms:'Uniformes',brandedClothes:"Vêtements aux couleurs de l'établissement",banners:'Bannières',signage:'Signalétique',flyers:'Flyers',businessCards:'Cartes de visite',books:'Livres',customPrints:'Impressions personnalisées',awardCeremony:'Cérémonie de remise des prix',openDay:'Journée portes ouvertes',conference:'Conférence',schoolTrip:'Sortie scolaire',yearEndParty:"Fête de fin d'année",desktopComputer:'Ordinateur fixe',laptop:'Ordinateur portable',securityCamera:'Caméra de surveillance',networkEquipment:'Équipement réseau',newInstallation:'Nouvelle installation',troubleshooting:'Dépannage',networkOptimization:'Optimisation du réseau',coverageExtension:'Extension de couverture',schoolPhotos:'Photos scolaires',eventCoverage:"Couverture d'événement",institutionalVideo:'Vidéo institutionnelle',educationalDocumentation:'Documentation pédagogique',repair:'Réparation',preventiveMaintenance:'Entretien préventif',spareParts:'Fourniture de pièces',schoolManagement:'Gestion scolaire',processAudit:'Audit des processus',digitalTransformation:'Transformation numérique',staffTraining:'Formation du personnel',generalServices:'Services généraux',equipment:'Équipement',training:'Formation',maintenance:'Maintenance',privateSchool:'École privée',publicSchool:'École publique',trainingInstitute:'Institut de formation',french:'Français',arabic:'العربية',english:'English' } });
Object.assign(window.I18n.translations.ar, { formFields: { rewardType:'نوع المكافأة المطلوبة',suppliesType:'نوع اللوازم',articleType:'نوع المنتج',printType:'نوع الطباعة',eventType:'نوع الفعالية',equipmentType:'نوع المعدات',interventionType:'نوع التدخل',prestationType:'نوع الخدمة',consultingDomain:'مجال الاستشارة',serviceCategory:'فئة الخدمة',estimatedQuantity:'الكمية المقدرة',estimatedBudget:'الميزانية المقدرة (درهم)',estimatedParticipants:'عدد المشاركين المقدر',equipmentCount:'عدد المعدات',coverageSurface:'المساحة المطلوب تغطيتها (م²)',estimatedHours:'المدة المقدرة (ساعات)',printerCount:'عدد الطابعات',estimatedDays:'المدة المقدرة (أيام)' }, options: { trophies:'كؤوس',medals:'ميداليات',cups:'جوائز',certificates:'شهادات',prizePacks:'حزم توزيع الجوائز',other:'أخرى',stationery:'قرطاسية',inkCartridges:'خراطيش حبر',bindersStorage:'ملفات وتخزين',officeFurniture:'أثاث مكتبي',adminSupplies:'لوازم إدارية',customNotebooks:'دفاتر مخصصة',customPens:'أقلام مخصصة',customBags:'حقائب مخصصة',uniforms:'زي موحد',brandedClothes:'ملابس بألوان المؤسسة',banners:'لافتات',signage:'لافتات إرشادية',flyers:'منشورات',businessCards:'بطاقات عمل',books:'كتب',customPrints:'طباعات مخصصة',awardCeremony:'حفل توزيع الجوائز',openDay:'يوم الأبواب المفتوحة',conference:'ندوة',schoolTrip:'رحلة مدرسية',yearEndParty:'حفل نهاية السنة',desktopComputer:'حاسوب مكتبي',laptop:'حاسوب محمول',securityCamera:'كاميرا مراقبة',networkEquipment:'معدات الشبكة',newInstallation:'تركيب جديد',troubleshooting:'إصلاح الأعطال',networkOptimization:'تحسين الشبكة',coverageExtension:'توسيع التغطية',schoolPhotos:'صور مدرسية',eventCoverage:'تغطية فعالية',institutionalVideo:'فيديو مؤسسي',educationalDocumentation:'توثيق تربوي',repair:'إصلاح',preventiveMaintenance:'صيانة وقائية',spareParts:'توفير قطع الغيار',schoolManagement:'إدارة مدرسية',processAudit:'تدقيق العمليات',digitalTransformation:'التحول الرقمي',staffTraining:'تكوين الموظفين',generalServices:'خدمات عامة',equipment:'معدات',training:'تكوين',maintenance:'صيانة',privateSchool:'مدرسة خاصة',publicSchool:'مدرسة عمومية',trainingInstitute:'معهد تكوين',french:'Français',arabic:'العربية',english:'English' } });
Object.assign(window.I18n.translations.en, { formFields: { rewardType:'Desired award type',suppliesType:'Supply type',articleType:'Item type',printType:'Print type',eventType:'Event type',equipmentType:'Equipment type',interventionType:'Intervention type',prestationType:'Service type',consultingDomain:'Consulting area',serviceCategory:'Service category',estimatedQuantity:'Estimated quantity',estimatedBudget:'Estimated budget (MAD)',estimatedParticipants:'Estimated participants',equipmentCount:'Number of devices',coverageSurface:'Area to cover (m²)',estimatedHours:'Estimated duration (hours)',printerCount:'Number of printers',estimatedDays:'Estimated duration (days)' }, options: { trophies:'Trophies',medals:'Medals',cups:'Cups',certificates:'Certificates',prizePacks:'Prize packages',other:'Other',stationery:'Stationery',inkCartridges:'Ink cartridges',bindersStorage:'Binders and storage',officeFurniture:'Office furniture',adminSupplies:'Administrative supplies',customNotebooks:'Custom notebooks',customPens:'Custom pens',customBags:'Custom bags',uniforms:'Uniforms',brandedClothes:'Clothing in institution colors',banners:'Banners',signage:'Signage',flyers:'Flyers',businessCards:'Business cards',books:'Books',customPrints:'Custom prints',awardCeremony:'Awards ceremony',openDay:'Open day',conference:'Conference',schoolTrip:'School trip',yearEndParty:'End-of-year party',desktopComputer:'Desktop computer',laptop:'Laptop',securityCamera:'Security camera',networkEquipment:'Network equipment',newInstallation:'New installation',troubleshooting:'Troubleshooting',networkOptimization:'Network optimization',coverageExtension:'Coverage extension',schoolPhotos:'School photos',eventCoverage:'Event coverage',institutionalVideo:'Institutional video',educationalDocumentation:'Educational documentation',repair:'Repair',preventiveMaintenance:'Preventive maintenance',spareParts:'Spare parts supply',schoolManagement:'School management',processAudit:'Process audit',digitalTransformation:'Digital transformation',staffTraining:'Staff training',generalServices:'General services',equipment:'Equipment',training:'Training',maintenance:'Maintenance',privateSchool:'Private school',publicSchool:'Public school',trainingInstitute:'Training institute',french:'Français',arabic:'العربية',english:'English' } });
"""


def repair(content: str) -> str:
    content = re.sub(r'(<p data-i18n="([^"]+)">)([^<"]*)" data-i18n="\2</p>', r"\1\3</p>", content)
    content = re.sub(r'(<p data-i18n="footer\.copyright">WEB DEVELOPMENT & WEB HOSTING BY Akram Zekri</p>)" data-i18n="footer\.copyright', r"\1", content)
    content = content.replace('placeholder="Ex: Groupe Scolaire" data-i18n-placeholder="form.schoolPlaceholder" data-temp="........................"', 'placeholder="Ex: Groupe Scolaire........................" data-i18n-placeholder="form.schoolPlaceholder"')
    content = content.replace('placeholder="Décrivez précisément" data-i18n-placeholder="form.descPlaceholder" data-temp=" ce dont vous avez besoin..."', 'placeholder="Décrivez précisément ce dont vous avez besoin..." data-i18n-placeholder="form.descPlaceholder"')
    content = re.sub(r'(\sdata-i18n="([^"]+)")(\sdata-i18n="\2")+', r"\1", content)
    content = re.sub(r'(\sdata-i18n-html="([^"]+)")(\sdata-i18n-html="\2")+', r"\1", content)
    content = re.sub(r'(\sdata-i18n-placeholder="([^"]+)")(\sdata-i18n-placeholder="\2")+', r"\1", content)
    content = re.sub(r'<span data-i18n="([^"]+)"><span data-i18n="\1">([^<]+)</span></span>', r'<span data-i18n="\1">\2</span>', content)
    return content


def add_meta_title(content: str, page: str) -> str:
    key = {"index.html": "meta.indexTitle", "services.html": "meta.servicesTitle", "contact.html": "meta.contactTitle", "faq.html": "meta.faqTitle", "fonctionnement.html": "meta.fonctionnementTitle", "app.html": "meta.appTitle"}[page]
    if "data-i18n-page-title" not in content:
        content = content.replace("</title>", f"</title>\n  <meta data-i18n-page-title=\"{key}\">", 1)
    return content


def apply_map(content: str, mapping: dict[str, str]) -> str:
    for old, new in mapping.items():
        content = content.replace(old, new)
    return content


def add_text_keys(content: str) -> str:
    for text, key in TEXT_KEYS.items():
        content = content.replace(f"<p>{text}</p>", f'<p data-i18n="{key}">{text}</p>')
        content = content.replace(f'<p class="section-subtitle">{text}</p>', f'<p class="section-subtitle" data-i18n="{key}">{text}</p>')
        content = content.replace(f'<p class="hero-description">\n          {text}\n        </p>', f'<p class="hero-description" data-i18n="{key}">\n          {text}\n        </p>')
    return content


def add_field_and_option_keys(content: str) -> str:
    for text, key in FIELD_KEYS.items():
        content = content.replace(f"<label>{text}</label>", f'<label data-i18n="{key}">{text}</label>')
        content = content.replace(f'<label style="margin-top:12px;display:block;">{text}</label>', f'<label style="margin-top:12px;display:block;" data-i18n="{key}">{text}</label>')
    for text, key in OPTION_KEYS.items():
        content = content.replace(f"<option>{text}</option>", f'<option data-i18n="options.{key}">{text}</option>')
    return content


def patch_app_js(content: str) -> str:
    content = content.replace(
        "const text = this.textContent.trim();\n        if (text.includes('Services')) {\n          document.getElementById('servicesView').style.display = 'block';\n        } else if (text.includes('demandes')) {\n          document.getElementById('requestsView').style.display = 'block';\n        } else if (text.includes('Factures')) {\n          document.getElementById('invoicesView').style.display = 'block';\n        } else if (text.includes('Archives')) {\n          document.getElementById('requestsView').style.display = 'block';\n        } else if (text.includes('Profil')) {\n          document.getElementById('profileView').style.display = 'block';\n        }",
        "const view = this.dataset.view;\n        if (view === 'services') {\n          document.getElementById('servicesView').style.display = 'block';\n        } else if (view === 'requests' || view === 'archives') {\n          document.getElementById('requestsView').style.display = 'block';\n        } else if (view === 'invoices') {\n          document.getElementById('invoicesView').style.display = 'block';\n        } else if (view === 'profile') {\n          document.getElementById('profileView').style.display = 'block';\n        }",
    )
    content = content.replace("document.getElementById('formTitle').textContent = 'Demande : ' + serviceNames[service];", "document.getElementById('formTitle').textContent = (window.I18n ? I18n.t('form.requestPrefix') : 'Demande : ') + serviceNames[service];")
    content = content.replace("document.getElementById('serviceSpecificFields').innerHTML = serviceFields[service] || '';", "document.getElementById('serviceSpecificFields').innerHTML = serviceFields[service] || '';\n      if (window.I18n) I18n.applyTranslations();")
    content = content.replace("alert('Votre demande a été soumise avec succès ! Un responsable SMARTSERVICES vous contactera dans les plus brefs délais.');", "alert(window.I18n ? I18n.t('form.successMsg') : 'Votre demande a été soumise avec succès ! Un responsable SMARTSERVICES vous contactera dans les plus brefs délais.');")
    return content


def process_page(path: Path) -> None:
    content = repair(path.read_text(encoding="utf-8"))
    content = add_meta_title(content, path.name)
    content = apply_map(content, EXACT)
    content = apply_map(content, APP)
    content = add_text_keys(content)
    content = add_field_and_option_keys(content)
    if path.name == "app.html":
        content = patch_app_js(content)
    content = repair(content)
    path.write_text(content, encoding="utf-8")
    print(f"Processed {path}")


def process_i18n(path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    content = content.replace(
        "return { t, setLanguage, init, getLang: () => currentLang, translations };",
        "return { t, setLanguage, init, applyTranslations, getLang: () => currentLang, translations };",
    )
    if "Extra translation keys added by add_i18n_attrs.py" not in content:
        content = content.replace("window.I18n = I18n;\n", "window.I18n = I18n;\n" + EXTRA_JS)
    path.write_text(content, encoding="utf-8")
    print(f"Processed {path}")


for page in PAGES:
    process_page(Path(page))
process_i18n(Path("js/i18n.js"))
print("Done")
