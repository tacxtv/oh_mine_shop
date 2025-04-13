#!make

PROJECT_NAME := oms
OMS_MINECRAFT_VERSION := 1.20.1
OMS_MINECRAFT_GAME_PORT := 25565
OMS_MINECRAFT_RCON_PORT := 25575
OMS_MINECRAFT_RCON_PASSWORD := ohmineshop

CERT_DIR = ./certificates
COMMON_NAME = localhost
DAYS_VALID = 365

PLATFORM = "linux/arm64/v8"

ifneq (,$(wildcard ./.env))
	include .env
	export
endif

.PHONY: help
.DEFAULT_GOAL := help
help:
	@printf "\033[33mUsage:\033[0m\n  make [target] [arg=\"val\"...]\n\n\033[33mTargets:\033[0m\n"
	@awk 'BEGIN { FS = ":.*##"; } /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

build: ## Build the project
	@docker buildx build \
		--platform linux/arm64 \
		-t $(PROJECT_NAME) .

dev-docker: ## Start the project in development mode
	@docker run -it --rm \
		--name $(PROJECT_NAME) \
		-v $(CURDIR):/app \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-p 3000:3000 \
		-p 4000:4000 \
		--platform $(PLATFORM) \
		--network dev \
		$(PROJECT_NAME)

dev-minecraft: ## Start the Minecraft server in development mode
	@docker run -it --rm \
		--name $(PROJECT_NAME)-minecraft \
		-p $(OMS_MINECRAFT_GAME_PORT):25565 \
		-p $(OMS_MINECRAFT_RCON_PORT):25575 \
		-v $(CURDIR)/minecraft/data:/data \
		-e EULA=TRUE \
		-e TYPE=FORGE \
		-e RCON_PASSWORD=$(OMS_MINECRAFT_RCON_PASSWORD) \
		-e VERSION=$(OMS_MINECRAFT_VERSION) \
		itzg/minecraft-server

dev-minecraft-console: ## Start remote console for the Minecraft server in development mode
	@docker exec -it $(PROJECT_NAME)-minecraft rcon-cli

dev: ## Start the project in development mode
	@yarn start:dev

dev-api: ## Start the API in development mode
	@cd apps/api; yarn start:dev

dev-web: ## Start the frontend in development mode
	@cd apps/web; yarn start:dev

generate-ssl-cert: ## Générer les certificats HTTPS auto-signés
	@echo "Génération des certificats HTTPS auto-signés..."
	@openssl req -x509 \
		-newkey rsa:4096 \
		-keyout $(CERT_DIR)/server.key \
		-out $(CERT_DIR)/server.crt \
		-days $(DAYS_VALID) \
		-nodes \
		-subj "/CN=$(COMMON_NAME)"
	@chmod 600 $(CERT_DIR)/server.key
	@chmod 644 $(CERT_DIR)/server.crt
	@echo "Certificats générés avec succès dans $(CERT_DIR)"

dbs: ## Start databases
	@docker volume create $(PROJECT_NAME)-mongodb
	@docker run -d --rm \
		--name $(PROJECT_NAME)-mongodb \
		-v $(PROJECT_NAME)-mongodb:/data/db \
		-p 27017:27017 \
		-e ALLOW_EMPTY_PASSWORD=yes \
		--platform $(PLATFORM) \
		--network dev \
		mongo:7.0 --wiredTigerCacheSizeGB 1.5 || true

	@docker volume create $(PROJECT_NAME)-redis
	@docker run -d --rm \
		--name $(PROJECT_NAME)-redis \
		-v $(PROJECT_NAME)-redis:/data \
		--platform $(PLATFORM) \
		--network dev \
		-p 6379:6379 \
		redis || true

stop-dbs: ## Stop databases
	@docker stop $(PROJECT_NAME)-mongodb || true
	@docker stop $(PROJECT_NAME)-redis || true

ncu: ## Check latest versions of all project dependencies
	@npx npm-check-updates

ncu-upgrade: ## Upgrade all project dependencies to the latest versions
	@npx npm-check-updates -u
