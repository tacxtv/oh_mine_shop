#!make

PROJECT_NAME := oms
OMS_MINECRAFT_VERSION := 1.20.1
OMS_MINECRAFT_PORT := 25565

ifneq (,$(wildcard ./.env))
	include .env
	export
endif

.PHONY: help
.DEFAULT_GOAL := help
help:
	@printf "\033[33mUsage:\033[0m\n  make [target] [arg=\"val\"...]\n\n\033[33mTargets:\033[0m\n"
	@awk 'BEGIN { FS = ":.*##"; } /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

dev-minecraft: ## Start the Minecraft server in development mode
	@docker run -it --rm \
		--name $(PROJECT_NAME)-minecraft \
		-p $(OMS_MINECRAFT_PORT):25565 \
		-v $(CURDIR)/minecraft/data:/data \
		-e EULA=TRUE \
		-e TYPE=VANILLA \
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

ncu: ## Check latest versions of all project dependencies
	@npx npm-check-updates

ncu-upgrade: ## Upgrade all project dependencies to the latest versions
	@npx npm-check-updates -u
