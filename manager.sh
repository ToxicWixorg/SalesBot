#!/bin/bash

R='\033[31m'; G='\033[32m'; Y='\033[33m'; C='\033[36m'; B='\033[1m'; W='\033[97m'; N='\033[0m'

PROJECT_DIR="/root/proj/bot"
PM2_NAME="sales-bot-demo"
REPO_URL="https://github.com/ToxicWixorg/SalesBot.git" 
REPO_SUBDIR=""
DOCKER_COMPOSE_FILE="docker-compose.yml"

header() {
  clear
  echo -e "${C}+------------------------------------------------------------------------------+${N}"
  echo -e "${C}|${N}          ${W}${B} GramIO - TypeScript Bot Manager ${N}                        ${C}|${N}"
  echo -e "${C}+------------------------------------------------------------------------------+${N}"
  echo -e "${C}|${N}   ${B}${G}Project Path:${N}  $PROJECT_DIR                                          ${C}|${N}"
  echo -e "${C}|${N}   ${B}${G}Bot Status:${N}    $(get_status)                                         ${C}|${N}"
  echo -e "${C}|${N}   $(get_docker_status)                                                        ${C}|${N}"
  echo -e "${C}+------------------------------------------------------------------------------+${N}"
  echo ""
}
get_status() {
    if pm2 jlist | grep -q "\"name\":\"$PM2_NAME\"" && pm2 jlist | grep -q "\"status\":\"online\""; then
        echo -e "${G}ONLINE${N}"
    else
        echo -e "${R}OFFLINE${N}"
    fi
}

get_docker_status() {
    cd "$PROJECT_DIR" 2>/dev/null || return
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps 2>/dev/null | grep -q "Up"; then
        echo -e "${G}Docker: Running${N}"
    else
        echo -e "${Y}Docker: Stopped${N}"
    fi
}

info() { echo -e "${Y}> $*${N}"; }
ok()   { echo -e "${G}OK: $*${N}"; }
err()  { echo -e "${R}ERROR: $*${N}"; }
 
install_prereqs() {
    header
    info "Installing Bun, Git, PM2 and Docker..."
     
    apt-get update
    apt-get install -y git curl unzip
     
    if ! command -v bun &> /dev/null; then
        info "Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
        echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    else
        ok "Bun already installed: $(bun --version)"
    fi
     
    if ! command -v pm2 &> /dev/null; then
        info "Installing PM2..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        npm install pm2 -g
    else
        ok "PM2 already installed"
    fi
     
    if ! command -v docker &> /dev/null; then
        info "Installing Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    else
        ok "Docker already installed: $(docker --version)"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        info "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    else
        ok "Docker Compose already installed: $(docker-compose --version)"
    fi

    # pg_dump is required by the in-bot database backup feature (BackupService).
    # It runs on the HOST (bot runs via PM2/Bun), so the client must be on the
    # host — not inside the Postgres container. The DB is Postgres 16, and
    # pg_dump refuses to dump a newer server, so we need client >= 16 from PGDG.
    need_pgclient=1
    if command -v pg_dump &> /dev/null; then
        pg_major=$(pg_dump --version | grep -oE '[0-9]+' | head -1)
        if [[ -n "$pg_major" && "$pg_major" -ge 16 ]]; then
            need_pgclient=0
            ok "pg_dump already installed: $(pg_dump --version)"
        else
            info "pg_dump found but too old (v$pg_major); backups need v16+."
        fi
    fi
    if [[ "$need_pgclient" -eq 1 ]]; then
        info "Installing PostgreSQL 16 client (pg_dump) for database backups..."
        apt-get install -y curl ca-certificates gnupg
        install -d /usr/share/postgresql-common/pgdg
        curl -fsSL -o /etc/apt/trusted.gpg.d/pgdg.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc
        echo "deb http://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo "$VERSION_CODENAME")-pgdg main" \
            > /etc/apt/sources.list.d/pgdg.list
        apt-get update
        apt-get install -y postgresql-client-16
        if command -v pg_dump &> /dev/null; then
            ok "pg_dump installed: $(pg_dump --version)"
        else
            err "Failed to install pg_dump — database backups will not work."
        fi
    fi

    ok "Prerequisites installed successfully."
    sleep 2
}
 
install_bot() {
    header
    info "Cloning repository..."

    TMPDIR=$(mktemp -d)
    git clone "$REPO_URL" "$TMPDIR/repo"
 
    if [[ -n "$REPO_SUBDIR" && -d "$TMPDIR/repo/$REPO_SUBDIR" ]]; then
        rm -rf "$PROJECT_DIR"
        mv "$TMPDIR/repo/$REPO_SUBDIR" "$PROJECT_DIR"
    else
        rm -rf "$PROJECT_DIR"
        mv "$TMPDIR/repo" "$PROJECT_DIR"
    fi
    rm -rf "$TMPDIR"

    cd "$PROJECT_DIR"
    info "Installing dependencies (bun install)..."
    bun install
    
    if [[ ! -f ".env" ]]; then
        info "Creating .env file..."
        cat > .env << 'EOF'
BOT_TOKEN=
DATABASE_URL="postgresql://bot:991fa522db6ddb9935c7d9b1@localhost:5432/bot"
REDIS_HOST=localhost
REDIS_PORT=6379

# Support Forum Group (Telegram Forum/Supergroup ID)
SUPPORT_GROUP_ID=

# Forum Topic IDs -- use /Topics command in each topic to find its ID
SUPPORT_TOPIC_ID=
ORDERS_TOPIC_ID=
REPORTS_TOPIC_ID=
NEWUSERS_TOPIC_ID=
NEWS_TOPIC_ID=
NEWREFERRAL_TOPIC_ID=
EOF
        err "Please edit .env (Option 3) and fill in BOT_TOKEN and all TOPIC IDs."
    fi
    
    info "Starting Docker containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    sleep 5
    
    info "Running database migrations..."
    bun x drizzle-kit migrate || info "Migration failed or already applied"
    
    ok "Installation complete!"
    sleep 2
}
 
update_bot() {
    header
    info "Stopping bot..."
    pm2 stop "$PM2_NAME" 2>/dev/null || true
 
    [[ -f "$PROJECT_DIR/.env" ]] && cp "$PROJECT_DIR/.env" /tmp/bot.env.bak

    info "Fetching latest code from GitHub..."
    TMPDIR=$(mktemp -d)
    git clone "$REPO_URL" "$TMPDIR/repo"

    if [[ -n "$REPO_SUBDIR" && -d "$TMPDIR/repo/$REPO_SUBDIR" ]]; then
        rm -rf "$PROJECT_DIR"
        mv "$TMPDIR/repo/$REPO_SUBDIR" "$PROJECT_DIR"
    else
        rm -rf "$PROJECT_DIR"
        mv "$TMPDIR/repo" "$PROJECT_DIR"
    fi
    rm -rf "$TMPDIR"
 
    [[ -f /tmp/bot.env.bak ]] && mv /tmp/bot.env.bak "$PROJECT_DIR/.env"

    cd "$PROJECT_DIR"
    info "Updating dependencies..."
    bun install
    
    info "Running migrations..."
    bun x drizzle-kit migrate || true
    
    info "Restarting Docker containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" restart
    
    info "Starting bot..."
    start_bot
    
    ok "Update successful!"
    sleep 2
}
 
start_bot() {
    header
    cd "$PROJECT_DIR"
     
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" ps 2>/dev/null | grep -q "Up"; then
        info "Starting Docker containers..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        sleep 3
    fi
    
    info "Starting bot with Bun..."
     
    if [[ -f ".env" ]]; then
        missing_vars=()
        for var in BOT_TOKEN SUPPORT_TOPIC_ID ORDERS_TOPIC_ID REPORTS_TOPIC_ID NEWUSERS_TOPIC_ID NEWS_TOPIC_ID NEWREFERRAL_TOPIC_ID; do
            val=$(grep -E "^${var}=" .env | cut -d'=' -f2- | tr -d '"' | xargs)
            if [[ -z "$val" ]]; then
                missing_vars+=("$var")
            fi
        done
        if [[ ${#missing_vars[@]} -gt 0 ]]; then
            err "Missing required .env variables: ${missing_vars[*]}"
            err "Edit .env (Option 3) and fill in all required values, then try again."
            sleep 4
            return 1
        fi
    fi
 
    pm2 delete "$PM2_NAME" 2>/dev/null || true
    pm2 start /root/proj/bot/ecosystem.config.cjs --update-env
    pm2 save
    pm2 logs "$PM2_NAME" --lines 20 --nostream
    ok "Bot started with PM2 ecosystem config."
    sleep 2
}

 
stop_bot() {
    header
    pm2 stop "$PM2_NAME" 2>/dev/null || info "Bot not running"
    ok "Bot stopped."
    sleep 2
}
 
manage_docker() {
    header
    cd "$PROJECT_DIR"
    echo -e "${C}+------------------------------------------------------------+${N}"
    echo -e "${C}|${N}  ${B}${G}1)${N} Start Docker                    ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}2)${N} Restart Docker                  ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}3)${N} Stop Docker                     ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}4)${N} Docker Status                   ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}5)${N} Docker Logs                     ${C}|${N}"
    echo -e "${C}|${N}  ${B}${R}6)${N} Remove Docker Volumes          ${C}|${N}"
    echo -e "${C}|${N}  ${B}${W}b)${N} Back                            ${C}|${N}"
    echo -e "${C}+------------------------------------------------------------+${N}"
    echo ""
    read -r -p "Select: " docker_choice
    
    case $docker_choice in
        1) docker-compose -f "$DOCKER_COMPOSE_FILE" up -d; ok "Docker started"; sleep 2 ;;
        2) docker-compose -f "$DOCKER_COMPOSE_FILE" restart; ok "Docker restarted"; sleep 2 ;;
        3) docker-compose -f "$DOCKER_COMPOSE_FILE" stop; ok "Docker stopped"; sleep 2 ;;
        4) docker-compose -f "$DOCKER_COMPOSE_FILE" ps; read -p "Press Enter..." ;;
        5) docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f ;;
        6) 
            read -p "Remove all volumes? (y/n): " confirm
            if [[ $confirm == "y" ]]; then
                docker-compose -f "$DOCKER_COMPOSE_FILE" down -v
                ok "Volumes removed"
            fi
            sleep 2
            ;;
        b) return ;;
    esac
}
 
while true; do
    header
    echo -e "${C}+------------------------------------------------------------+${N}"
    echo -e "${C}|${N}  ${B}${G}0)${N} Install Prerequisites           ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}1)${N} Install / Reinstall Bot         ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}2)${N} Update from GitHub              ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}3)${N} Edit settings (.env)            ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}4)${N} Start / Restart Bot             ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}5)${N} Stop Bot                       ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}6)${N} Manage Docker                   ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}7)${N} Live Logs (Real-time)          ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}8)${N} Previous Logs (Last 100)      ${C}|${N}"
    echo -e "${C}|${N}  ${B}${G}9)${N} PM2 Status                     ${C}|${N}"
    echo -e "${C}|${N}  ${B}${R}d)${N} Remove Project                 ${C}|${N}"
    echo -e "${C}|${N}  ${B}${R}q)${N} Exit                           ${C}|${N}"
    echo -e "${C}+------------------------------------------------------------+${N}"
    echo ""
    read -r -p "Select an option: " choice

    case $choice in
        0) install_prereqs ;;
        1) install_bot ;;
        2) update_bot ;;
        3)
            nano "$PROJECT_DIR/.env"
            pm2 delete "$PM2_NAME" 2>/dev/null || true
            pm2 start /root/proj/bot/ecosystem.config.cjs --update-env
            pm2 save
            pm2 logs "$PM2_NAME" --lines 20 --nostream
            ;;
        4) start_bot ;;
        5) stop_bot ;;
        6) manage_docker ;;
        7) pm2 logs "$PM2_NAME" ;;
        8) pm2 logs "$PM2_NAME" --lines 100 --nostream ;;
        9) pm2 status; read -p "Press Enter to return..." ;;
        d) 
            read -p "Are you sure? (y/n): " confirm
            if [[ $confirm == "y" ]]; then
                pm2 delete "$PM2_NAME" 2>/dev/null
                cd "$PROJECT_DIR"
                docker-compose -f "$DOCKER_COMPOSE_FILE" down -v 2>/dev/null
                rm -rf "$PROJECT_DIR"
                ok "Removed."
            fi
            sleep 2
            ;;
        q) exit 0 ;;
        *) echo "Invalid option"; sleep 1 ;;
    esac
done



