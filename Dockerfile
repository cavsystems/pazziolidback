FROM mysql:8
COPY ./backup/bdpazzioli.sql /docker-entrypoint-initdb.d/backup.sql

EXPOSE 3306