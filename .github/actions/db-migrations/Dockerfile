# A service's migrations image: the platform migrator plus the service's
# db/migrations, tagged like the app (sha-<commit>). Built by the shared CI.
FROM postgres:18-alpine
COPY migrate.sh /usr/local/bin/migrate
COPY migrations/ /migrations/
USER 10001:10001
ENV MIGRATIONS_DIR=/migrations
ENTRYPOINT ["/usr/local/bin/migrate"]
