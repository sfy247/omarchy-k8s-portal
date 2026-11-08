# Backend image (serves the frontend too). Build context: the repo root.
#
# Uses Backstage's host-build pattern: CI runs these first, on the same Node
# major as the FROM image (native modules must match):
#   yarn install --immutable && yarn tsc && yarn build:backend
# then builds this file. See .github/workflows/build-image.yaml.

FROM node:24-trixie-slim

# TechDocs builds docs in-process with mkdocs, kept in its own virtualenv
ARG MKDOCS_TECHDOCS_CORE_VERSION=1.7.1
# Renders Obsidian callouts (> [!note]) as admonitions, so the handbook stays
# one source for Obsidian and the portal
ARG MKDOCS_CALLOUTS_VERSION=1.17.1
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv && \
    python3 -m venv /opt/mkdocs && \
    /opt/mkdocs/bin/pip install --no-cache-dir \
      "mkdocs-techdocs-core==${MKDOCS_TECHDOCS_CORE_VERSION}" \
      "mkdocs-callouts==${MKDOCS_CALLOUTS_VERSION}" && \
    rm -rf /var/lib/apt/lists/*
ENV PATH="/opt/mkdocs/bin:${PATH}"

# Run as the image's unprivileged `node` user (UID 1000)
USER 1000:1000
WORKDIR /app

COPY --chown=node:node .yarn ./.yarn
COPY --chown=node:node .yarnrc.yml backstage.json ./

ENV NODE_ENV=production

# Package skeleton first, so dependency layers cache across code changes
COPY --chown=node:node yarn.lock package.json packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN --mount=type=cache,target=/home/node/.cache/yarn,sharing=locked,uid=1000,gid=1000 \
    yarn workspaces focus --all --production && rm -rf "$(yarn cache clean)"

COPY --chown=node:node packages/backend/dist/bundle.tar.gz app-config.yaml app-config.production.yaml ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

EXPOSE 7007
# The deployment appends --config app-config.lab.yaml (generated per lab)
CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
