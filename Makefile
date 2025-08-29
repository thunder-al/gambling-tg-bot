MAKEFLAGS += -j3
DOCKER := docker
GIT_REV := $(shell git rev-parse --short HEAD)

container-build-bot:
	$(DOCKER) build \
		-f Containerfile \
		-t thunderal/project:gambling-tg-bot-$(GIT_REV) \
		.

container-push-bot:
	$(DOCKER) push thunderal/project:gambling-tg-bot-$(GIT_REV)
