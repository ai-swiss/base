# BASE MCP Server - Makefile
#
# make install   Install dependencies
# make build     Compile TypeScript
# make test      Run tests
# make check     Build + test
# make dev       Start dev server (stdio, auto-reload)
# make start     Start production server (stdio)
# make http      Start HTTP server on localhost:3100
# make clean     Remove build artifacts

ROOT := $(shell cd .. && pwd)

.PHONY: install build test check dev start http clean

install:
	npm install

build:
	npm run build

test:
	npm test

check: build test

dev:
	npm run dev -- --root "$(ROOT)"

start: build
	npm start -- --root "$(ROOT)"

http: build
	npm start -- --transport http --root "$(ROOT)"

clean:
	rm -rf dist/
