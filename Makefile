COMPOSE_RUN = docker-compose run --rm -p 5000:5000 --name garden-of-eden-server server_api
COMPOSE_RUN_REDIS = docker-compose run -d --rm -p 6379:6379 --name garden-of-eden-redis redis

envfile:
	@echo "Create .env with $(ENVFILE)"
	cp $(ENVFILE) .env

deps:
	make _deps

start:
	$(COMPOSE_RUN) make _start

redisStart:
	$(COMPOSE_RUN_REDIS) redis-server --appendonly yes

stop:
	docker stop garden-of-eden-server

_deps:
	yarn install

_start:
	yarn start