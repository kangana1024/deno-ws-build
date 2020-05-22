FROM hayd/alpine-deno:1.0.0

EXPOSE 3000

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY server.js .
COPY chat.js .
RUN deno cache server.js

CMD ["run", "--allow-net", "server.js"]