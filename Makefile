COMPOSE_RUN = docker-compose run --rm -p 5000:5000 --name garden-of-eden-server server_api
COMPOSE_RUN_REDIS = docker-compose run -d --rm -p 6379:6379 --name garden-of-eden-redis redis
COMPOSE_AWSCLI = docker-compose run --rm awscli

envfile:
	@echo "Create .env with $(ENVFILE)"
	cp $(ENVFILE) .env

deps:
	make _deps

start:
	$(COMPOSE_RUN) make _start

redisStart:
	$(COMPOSE_RUN_REDIS) redis-server --appendonly yes

package:
	$(COMPOSE_AWSCLI) deploy push --application-name garden-of-eden-server --s3-location s3://cdbucket-garden-of-eden-server/webapp.zip --ignore-hidden-files

deployQa: package
	$(COMPOSE_AWSCLI) deploy create-deployment \
  --application-name garden-of-eden-server \
  --deployment-group-name garden-of-eden-deployment-group \
  --s3-location bucket=cdbucket-garden-of-eden-server,bundleType=zip,key=webapp.zip \
  --deployment-config-name CodeDeployDefault.AllAtOnce 


stop:
	docker stop garden-of-eden-server

_deps:
	yarn install

_start:
	yarn start