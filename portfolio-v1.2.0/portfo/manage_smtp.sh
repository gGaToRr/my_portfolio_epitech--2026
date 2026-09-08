#!/usr/bin/env bash
# ==============================================================================
# Script de Gestion et de Configuration SMTP - Portfolio Pierre Untersinger
# ==============================================================================
# Usage :
#   ./manage_smtp.sh               -> Menu interactif complet
#   ./manage_smtp.sh --test        -> Envoi direct d'un email de test
#   ./manage_smtp.sh --status      -> Afficher la configuration actuelle
#   ./manage_smtp.sh --check       -> Tester la connexion réseau vers l'hôte SMTP
#   ./manage_smtp.sh --restart     -> Redémarrer le conteneur Docker Portfolio
#   ./manage_smtp.sh --help        -> Afficher l'aide
# ==============================================================================

set -e

# Couleurs et formatage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Chemins
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTFO_DIR="${SCRIPT_DIR}/portfolio-v1.2.0/portfo"
if [ ! -d "$PORTFO_DIR" ]; then
    PORTFO_DIR="$SCRIPT_DIR"
fi

ENV_FILE="${PORTFO_DIR}/.env.local"
if [ ! -f "$ENV_FILE" ] && [ -f "${PORTFO_DIR}/.env" ]; then
    ENV_FILE="${PORTFO_DIR}/.env"
fi

# Fonction pour charger les variables d'environnement de manière sécurisée
load_env() {
    if [ -f "$ENV_FILE" ]; then
        while IFS='=' read -r key value || [ -n "$key" ]; do
            # Ignorer commentaires et lignes vides
            [[ "$key" =~ ^[[:space:]]*# ]] && continue
            [[ -z "${key// }" ]] && continue
            
            # Nettoyer clé et valeur
            key="$(echo "$key" | xargs)"
            value="$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
            
            if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
                export "$key"="$value"
            fi
        done < "$ENV_FILE"
    fi
}

load_env

# Header ASCII
show_header() {
    echo -e "${CYAN}${BOLD}"
    echo "  ╔════════════════════════════════════════════════════════════╗"
    echo "  ║        PORTFOLIO PIERRE UNTERSINGER - GESTION SMTP        ║"
    echo "  ╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 1. Affichage du statut / config
show_status() {
    load_env
    echo -e "\n${BOLD}${BLUE}=== 📋 CONFIGURATION SMTP ACTUELLE ===${NC}\n"
    echo -e "  Fichier actif : ${CYAN}${ENV_FILE}${NC}"
    echo -e "  • Hôte SMTP (SMTP_HOST)        : ${BOLD}${SMTP_HOST:-${YELLOW}[Non défini]${NC}}"
    echo -e "  • Port (SMTP_PORT)             : ${BOLD}${SMTP_PORT:-587}${NC}"
    echo -e "  • SSL/TLS Sécurisé (SECURE)    : ${BOLD}${SMTP_SECURE:-false}${NC}"
    echo -e "  • Utilisateur (SMTP_USER)      : ${BOLD}${SMTP_USER:-${YELLOW}[Non défini]${NC}}"
    
    if [ -z "$SMTP_PASS" ] || [[ "$SMTP_PASS" == *"ton_mot_de_passe"* ]] || [[ "$SMTP_PASS" == *"your_password"* ]]; then
        echo -e "  • Mot de passe (SMTP_PASS)     : ${YELLOW}[⚠️ Non configuré / Placeholder]${NC}"
    else
        # Masquage partiel
        local pass_len=${#SMTP_PASS}
        local masked="****"
        if [ "$pass_len" -ge 4 ]; then
            masked="${SMTP_PASS:0:2}******${SMTP_PASS: -2}"
        fi
        echo -e "  • Mot de passe (SMTP_PASS)     : ${GREEN}Défini (${masked})${NC}"
    fi

    echo -e "  • Expéditeur (SMTP_FROM)       : ${BOLD}${SMTP_FROM:-Portfolio Pierre}${NC}"
    echo -e "  • Destinataire (RECEIVER)      : ${BOLD}${CONTACT_RECEIVER_EMAIL:-pierre.untersinger2@gmail.com}${NC}"
    echo -e "  • Port API Interne             : ${BOLD}${API_PORT:-5001}${NC}"
    echo ""
}

# 2. Test réseau TCP vers le serveur SMTP
check_connectivity() {
    load_env
    local host="${SMTP_HOST:-smtp.gmail.com}"
    local port="${SMTP_PORT:-587}"

    echo -e "\n${BOLD}${BLUE}=== 🔍 TEST DE CONNEXION RÉSEAU VERS ${host}:${port} ===${NC}\n"
    echo -e "Vérification de l'accessibilité TCP..."

    if command -v nc >/dev/null 2>&1; then
        if nc -z -v -w 5 "$host" "$port" 2>/dev/null; then
            echo -e "${GREEN}✅ Connexion TCP réussie sur ${host}:${port} !${NC}"
            return 0
        else
            echo -e "${RED}❌ Impossible de joindre ${host} sur le port ${port}.${NC}"
            echo -e "${YELLOW}👉 Vérifiez votre connexion internet, le pare-feu ou les règles de sortie du serveur.${NC}"
            return 1
        fi
    elif timeout 5 bash -c "</dev/tcp/${host}/${port}" 2>/dev/null; then
        echo -e "${GREEN}✅ Connexion TCP réussie sur ${host}:${port} !${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ Impossible de tester avec nc/bash. Le test sera effectué via Node.js.${NC}"
        return 0
    fi
}

# 3. Envoi d'un email de test
send_test_email() {
    load_env
    echo -e "\n${BOLD}${MAGENTA}=== ✉️ ENVOI D'UN EMAIL DE TEST SMTP ===${NC}\n"

    if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ] || [[ "$SMTP_PASS" == *"ton_mot_de_passe"* ]]; then
        echo -e "${RED}❌ Erreur : Vos identifiants SMTP ne sont pas encore configurés.${NC}"
        echo -e "${YELLOW}👉 Utilisez l'option 2 du menu pour renseigner votre serveur et mot de passe SMTP.${NC}\n"
        return 1
    fi

    echo -e "Tentative d'envoi d'un email de diagnostic via ${CYAN}${SMTP_USER}${NC} vers ${CYAN}${CONTACT_RECEIVER_EMAIL:-pierre.untersinger2@gmail.com}${NC}..."

    # Script Node de test inline
    cd "$PORTFO_DIR"
    node -e "
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '${ENV_FILE}' });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        console.log('⏳ Vérification des identifiants (transporter.verify)...');
        await transporter.verify();
        console.log('✅ Connexion et authentification SMTP réussies !');

        console.log('⏳ Envoi de l\'email de test...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '\"Portfolio Pierre\" <' + process.env.SMTP_USER + '>',
            to: process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER,
            subject: '🚀 [Test Portfolio] Vérification SMTP réussie (' + new Date().toLocaleString() + ')',
            text: 'Félicitations !\n\nLe serveur SMTP de votre portfolio fonctionne parfaitement.\n\nDate: ' + new Date().toISOString() + '\nHost: ' + process.env.SMTP_HOST + '\nExpéditeur: ' + process.env.SMTP_USER,
            html: '<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #61dafb; border-radius: 8px;\"><h2 style=\"color: #0284c7;\">🚀 Test SMTP réussi !</h2><p>Le serveur SMTP de votre portfolio est <strong>opérationnel et prêt pour la production</strong>.</p><p><strong>Hôte :</strong> ' + process.env.SMTP_HOST + ' (Port ' + process.env.SMTP_PORT + ')</p><p><strong>Compte :</strong> ' + process.env.SMTP_USER + '</p><hr/><small style=\"color: #888;\">Envoyé depuis le script manage_smtp.sh</small></div>'
        });

        console.log('🎉 Email envoyé avec succès ! MessageId : ' + info.messageId);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur lors de l\'envoi : ', err.message);
        if (err.message.includes('Username and Password not accepted') || err.message.includes('Invalid login')) {
            console.error('\n💡 ASTUCE GMAIL / OUTLOOK : Si vous utilisez Gmail ou Outlook avec la double authentification, vous DEVEZ générer un \"Mot de passe d\'application\" (16 caractères) dans la sécurité de votre compte Google, et non votre mot de passe habituel.');
        }
        process.exit(1);
    }
}
run();
"
    # shellcheck disable=SC2181
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✨ Super ! L'email de test est bien parti. Vérifiez votre boîte de réception (${CONTACT_RECEIVER_EMAIL:-pierre.untersinger2@gmail.com}).${NC}\n"
    else
        echo -e "\n${RED}⚠️ L'envoi a échoué. Corrigez vos identifiants ou le mot de passe d'application.${NC}\n"
    fi
}

# 4. Assistant interactif de configuration SMTP
configure_smtp_wizard() {
    echo -e "\n${BOLD}${CYAN}=== ⚙️ ASSISTANT DE CONFIGURATION SMTP ===${NC}\n"
    echo "Choisissez votre fournisseur SMTP :"
    echo "  1) 🔴 Gmail (smtp.gmail.com - Port 587)"
    echo "  2) 🔵 Outlook / Office 365 (smtp.office365.com - Port 587)"
    echo "  3) 🌐 OVH Cloud (ssl0.ovh.net - Port 465 ou 587)"
    echo "  4) 🇨🇭 Infomaniak (mail.infomaniak.com - Port 587)"
    echo "  5) 📬 Brevo / Sendinblue (smtp-relay.brevo.com - Port 587)"
    echo "  6) ⚡ Mailgun (smtp.mailgun.org - Port 587)"
    echo "  7) 🛠️  Autre serveur SMTP personnalisé"
    echo ""
    read -rp "Votre choix (1-7) [1] : " provider_choice
    provider_choice=${provider_choice:-1}

    local host="smtp.gmail.com"
    local port="587"
    local secure="false"

    case $provider_choice in
        1)
            host="smtp.gmail.com"
            port="587"
            secure="false"
            echo -e "\n${YELLOW}ℹ️  NOTE GMAIL : Utilisez une adresse Gmail et un \"Mot de passe d'application\" 16 lettres généré depuis votre compte Google (Sécurité > Validation en 2 étapes > Mots de passe des applications).${NC}\n"
            ;;
        2)
            host="smtp.office365.com"
            port="587"
            secure="false"
            ;;
        3)
            host="ssl0.ovh.net"
            port="465"
            secure="true"
            ;;
        4)
            host="mail.infomaniak.com"
            port="587"
            secure="false"
            ;;
        5)
            host="smtp-relay.brevo.com"
            port="587"
            secure="false"
            ;;
        6)
            host="smtp.mailgun.org"
            port="587"
            secure="false"
            ;;
        7)
            read -rp "Hôte SMTP (ex: mail.mondomaine.com) : " host
            read -rp "Port SMTP (ex: 587 ou 465) [587] : " port
            port=${port:-587}
            if [ "$port" == "465" ]; then
                secure="true"
            else
                read -rp "Connexion SSL directe (true/false) [false] : " secure
                secure=${secure:-false}
            fi
            ;;
    esac

    read -rp "Adresse email d'authentification (SMTP_USER) [${SMTP_USER:-pierre.untersinger2@gmail.com}] : " input_user
    local user=${input_user:-${SMTP_USER:-pierre.untersinger2@gmail.com}}

    echo -n "Mot de passe SMTP / Mot de passe d'application (saisie masquée) : "
    read -rs input_pass
    echo ""
    local pass=${input_pass:-${SMTP_PASS}}

    read -rp "Adresse email de réception des messages [${CONTACT_RECEIVER_EMAIL:-pierre.untersinger2@gmail.com}] : " input_receiver
    local receiver=${input_receiver:-${CONTACT_RECEIVER_EMAIL:-pierre.untersinger2@gmail.com}}

    read -rp "Nom d'expéditeur visible [Portfolio Pierre Untersinger] : " input_from_name
    local from_name=${input_from_name:-"Portfolio Pierre Untersinger"}

    # Sauvegarde
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d_%H%M%S)"
        echo -e "${CYAN}💾 Sauvegarde de l'ancien fichier effectuée (.bak).${NC}"
    fi

    cat <<EOF > "$ENV_FILE"
# --- Configuration Serveur SMTP Dédié (Généré par manage_smtp.sh) ---
SMTP_HOST=${host}
SMTP_PORT=${port}
SMTP_SECURE=${secure}
SMTP_USER=${user}
SMTP_PASS=${pass}
SMTP_FROM="${from_name}" <${user}>
CONTACT_RECEIVER_EMAIL=${receiver}
API_PORT=5001

# --- Fallback Web3Forms (optionnel) ---
REACT_APP_WEB3FORMS_KEY=${REACT_APP_WEB3FORMS_KEY:-02eff335-7fcc-452c-bca9-ee88b7f9378d}
EOF

    echo -e "\n${GREEN}✅ Configuration SMTP enregistrée avec succès dans ${ENV_FILE} !${NC}\n"
    load_env

    read -rp "Voulez-vous envoyer un email de test maintenant ? (o/n) [o] : " run_test
    run_test=${run_test:-o}
    if [[ "$run_test" =~ ^[oOyY]$ ]]; then
        send_test_email
    fi
}

# 5. Redémarrage du conteneur Docker
restart_docker() {
    echo -e "\n${BOLD}${BLUE}=== 🐳 REDÉMARRAGE DU CONTENEUR DOCKER ===${NC}\n"
    cd "$SCRIPT_DIR"
    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        echo "Exécution de : docker compose up -d --build --force-recreate"
        docker compose up -d --build
        echo -e "\n${GREEN}✅ Conteneur portfolio redémarré avec succès !${NC}"
    elif command -v docker-compose >/dev/null 2>&1; then
        docker-compose up -d --build
        echo -e "\n${GREEN}✅ Conteneur portfolio redémarré avec succès !${NC}"
    else
        echo -e "${RED}❌ Docker ou Docker Compose n'est pas disponible dans le PATH.${NC}"
    fi
}

# 6. Affichage des logs
show_docker_logs() {
    echo -e "\n${BOLD}${BLUE}=== 📊 LOGS DU CONTENEUR PORTFOLIO (Ctrl+C pour quitter) ===${NC}\n"
    cd "$SCRIPT_DIR"
    if command -v docker >/dev/null 2>&1; then
        docker logs -f --tail=50 pierre_portfolio 2>/dev/null || docker compose logs -f --tail=50
    fi
}

# Menu interactif
interactive_menu() {
    while true; do
        show_header
        echo -e "${BOLD}Que souhaitez-vous faire ?${NC}"
        echo -e "  ${CYAN}1)${NC} 📋 Afficher la configuration SMTP actuelle"
        echo -e "  ${CYAN}2)${NC} ⚙️  Configurer / Modifier les identifiants SMTP (Assistant)"
        echo -e "  ${CYAN}3)${NC} ✉️  Envoyer un email de test en direct"
        echo -e "  ${CYAN}4)${NC} 🔍 Tester la connectivité TCP vers le serveur SMTP"
        echo -e "  ${CYAN}5)${NC} 🐳 Redémarrer le conteneur Docker (appliquer les changements)"
        echo -e "  ${CYAN}6)${NC} 📊 Consulter les logs du conteneur"
        echo -e "  ${CYAN}0)${NC} 🚪 Quitter"
        echo ""
        read -rp "Votre sélection (0-6) : " choice

        case $choice in
            1) show_status ;;
            2) configure_smtp_wizard ;;
            3) send_test_email ;;
            4) check_connectivity ;;
            5) restart_docker ;;
            6) show_docker_logs ;;
            0) echo -e "\n${GREEN}À bientôt !${NC}\n"; exit 0 ;;
            *) echo -e "\n${RED}Option invalide.${NC}\n" ;;
        esac

        echo ""
        read -rp "Appuyez sur [Entrée] pour revenir au menu principal..." _
        clear 2>/dev/null || true
    done
}

# Traitement des arguments CLI
case "$1" in
    --test|-t)
        show_header
        send_test_email
        ;;
    --status|-s|--info)
        show_header
        show_status
        ;;
    --check|-c|--ping)
        show_header
        check_connectivity
        ;;
    --config|-cfg)
        show_header
        configure_smtp_wizard
        ;;
    --restart|-r)
        show_header
        restart_docker
        ;;
    --logs|-l)
        show_docker_logs
        ;;
    --help|-h)
        show_header
        echo "Utilisation : $0 [OPTION]"
        echo ""
        echo "Options disponibles :"
        echo "  (sans option)     Ouvre le menu interactif complet"
        echo "  --test, -t        Envoie immédiatement un email de test SMTP"
        echo "  --status, -s      Affiche la configuration SMTP actuelle"
        echo "  --check, -c       Vérifie l'accès réseau et le port TCP SMTP"
        echo "  --config, -cfg    Lance l'assistant de configuration pas-à-pas"
        echo "  --restart, -r     Redémarre le conteneur Docker pour recharger la config"
        echo "  --logs, -l        Affiche les logs en direct du conteneur"
        echo "  --help, -h        Affiche ce message d'aide"
        echo ""
        ;;
    "")
        interactive_menu
        ;;
    *)
        echo -e "${RED}Option inconnue : $1${NC}"
        echo "Utilisez '$0 --help' pour voir les options disponibles."
        exit 1
        ;;
esac
