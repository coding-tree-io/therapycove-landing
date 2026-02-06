export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!url.pathname.endsWith("/auth") && !url.pathname.endsWith("/callback")) {
      return new Response("Not Found", { status: 404 });
    }

    const email = request.headers.get("cf-access-authenticated-user-email");
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const allowedEmails = (env.CMS_ALLOWED_EMAILS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    const allowedDomains = (env.CMS_ALLOWED_DOMAINS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    const normalizedEmail = email.trim().toLowerCase();
    const emailDomain = normalizedEmail.split("@")[1] || "";

    if (allowedEmails.length && !allowedEmails.includes(normalizedEmail)) {
      return new Response("Forbidden", { status: 403 });
    }
    if (allowedDomains.length && !allowedDomains.includes(emailDomain)) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!env.GITHUB_TOKEN) {
      return new Response("Server misconfigured", { status: 500 });
    }

    const targetOrigin = env.CMS_ORIGIN || "*";
    const startMessage = "authorizing:github";
    const successMessage = `authorization:github:success:${JSON.stringify({
      token: env.GITHUB_TOKEN,
    })}`;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Authentication complete</title>
  </head>
  <body>
    <script>
      (function () {
        var targetOrigin = ${JSON.stringify(targetOrigin)};
        var startMessage = ${JSON.stringify(startMessage)};
        var successMessage = ${JSON.stringify(successMessage)};

        function finalize() {
          try {
            if (window.opener) {
              window.opener.postMessage(successMessage, targetOrigin);
            }
          } finally {
            window.close();
          }
        }

        function receiveMessage() {
          window.removeEventListener("message", receiveMessage, false);
          finalize();
        }

        if (!window.opener) {
          return;
        }

        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage(startMessage, targetOrigin);

        // Fallback for browsers/extensions that block the opener handshake event.
        setTimeout(function () {
          receiveMessage();
        }, 1000);
      })();
    </script>
  </body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  },
};
