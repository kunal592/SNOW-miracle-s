.PHONY: dev build run migrate migrate-down docker-up docker-down test lint

# ---- Dev ---------------------------------------------------------------
dev:
	@echo "Starting dev server..."
	cd backend && go run ./cmd/server

build:
	@echo "Building backend..."
	cd backend && go build -o bin/snow ./cmd/server

run:
	@echo "Running binary..."
	cd backend && ./bin/snow

# ---- Database ----------------------------------------------------------
docker-up:
	docker compose up -d postgres redis
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker compose exec postgres pg_isready -U snow -d snow_dev > /dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL ready!"

docker-down:
	docker compose down

migrate:
	@echo "Running migrations..."
	cd backend && go run ./cmd/server migrate

migrate-down:
	@echo "Rolling back last migration..."
	cd backend && goose -dir db/migrations postgres "$$DATABASE_URL" down

# ---- Dev (full stack) --------------------------------------------------
start: docker-up
	@echo "Starting API..."
	$(MAKE) dev

# ---- Quality -----------------------------------------------------------
test:
	cd backend && go test ./... -v

lint:
	cd backend && go vet ./...

tidy:
	cd backend && go mod tidy

# ---- Frontend ----------------------------------------------------------
frontend-dev:
	npm run dev

frontend-build:
	npm run build
