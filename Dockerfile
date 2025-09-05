# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
RUN deno task compile

# Production stage
FROM denoland/deno:latest
WORKDIR /app
COPY --from=builder /app/lilly-discord .
CMD ["/app/lilly-discord"]
