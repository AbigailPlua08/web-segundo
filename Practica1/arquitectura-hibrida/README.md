# Arquitectura Híbrida Tour ↔ Reserva

Implementación de referencia para el taller **Arquitectura Híbrida y Estrategias de Resiliencia Avanzada**. El escenario separa la lógica de Tours (maestro) y Reservas (transaccional) en microservicios independientes que se coordinan vía RabbitMQ. La resiliencia se logra con un **Consumidor Idempotente** respaldado por Redis, evitando efectos secundarios al reprocesar mensajes duplicados.

## Componentes

- **API Gateway (`api-gateway/`)**: expone endpoints REST para clientes externos y enruta comandos a los microservicios mediante RabbitMQ.
- **Microservicio Tour (`micro-tour/`)**: administra la disponibilidad de tours y procesa eventos provenientes de reservas confirmadas.
- **Microservicio Reserva (`micro-reserva/`)**: gestiona el ciclo de vida de las reservas y publica eventos de actualización de cupos. Incluye el consumidor idempotente.
- **Shared (`shared/`)**: contratos reutilizables (DTOs, interfaces y utilidades de logging).

Infraestructura adicional incluida en `docker-compose.yml`:

- RabbitMQ (3.13 + management UI)
- Redis 7 (deduplicación de mensajes)
- Postgres 16 por microservicio (aislamiento de datos)

## Requisitos previos

- Node.js 20+
- Docker y Docker Compose
- NPM 10+

## Puesta en marcha

```bash
cd SegundoParcial/Practica1/arquitectura-hibrida
npm install
npm run build --workspaces
npm run start:dev --workspace api-gateway
```

Para ejecutar todo el entorno:

```bash
cd SegundoParcial/Practica1/arquitectura-hibrida
docker compose up --build
```

UI de RabbitMQ disponible en `http://localhost:15672` (usuario y contraseña: `guest`).

> Nota: los archivos `.env` de cada microservicio están preconfigurados para uso dentro de Docker Compose (`rabbitmq`, `tour-db`, `reserva-db`, `redis`). Si deseas ejecutar los servicios de forma local sin Docker, duplica cada `.env` y ajusta los hosts a `localhost`.

## Flujos Clave

1. **Creación de Reserva**

   - El cliente invoca `POST /reservas` en el gateway.
   - El gateway envía `reserva.crear` a RabbitMQ.
   - `micro-reserva` valida idempotencia, persiste la reserva y publica `tour.actualizar`.
   - `micro-tour` actualiza la disponibilidad y responde al gateway.

2. **Consulta de Tours**
   - `GET /tours` en el gateway → comando `tour.listar` → `micro-tour` entrega la vista actual.

## Estrategia de Resiliencia: Consumidor Idempotente

El archivo `micro-reserva/src/reserva/reserva.consumer.ts` implementa un interceptor que verifica claves de idempotencia en Redis antes de procesar un mensaje. Las claves se almacenan con TTL configurable, garantizando que mensajes duplicados no ejecuten efectos secundarios.

## Pruebas de Resiliencia recomendadas

1. Generar una reserva con un encabezado `Idempotency-Key` y reenviar la misma petición. Validar que la segunda petición retorna un estado _idempotent replay_.
2. Simular un fallo en la respuesta del consumidor (apagar `micro-tour`) y dejar que RabbitMQ reprograme el mensaje. Verificar que, al restaurar el servicio, la lógica de idempotencia evita dobles descuentos de cupos.

## Estructura del repositorio

```
arquitectura-hibrida/
├── api-gateway/
├── micro-tour/
├── micro-reserva/
├── shared/
├── docker-compose.yml
└── README.md
```

Cada paquete incluye su propio `package.json`, `tsconfig.json` y scripts de desarrollo.
