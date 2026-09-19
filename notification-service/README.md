# Notification Service

This is the Python/FastAPI notification service for the Cloud Native Chat Platform.

## Architecture

This service is designed as an independent microservice that processes notifications triggered by events in the Node.js backend.

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL
- **Persistence**: SQLAlchemy / asyncpg

### Purpose
To offload notification processing from the primary real-time chat backend, demonstrating a polyglot microservice architecture.
