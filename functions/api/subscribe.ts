interface Env {
  MAILERLITE_API_KEY: string;
  MAILERLITE_GROUP_ID: string;
}

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
}) => Response | Promise<Response>;

interface Body {
  email?: string;
  consent?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MAILERLITE_API_KEY || !env.MAILERLITE_GROUP_ID) {
    return json(500, { error: "Newsletter is not configured yet. Try again shortly." });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return json(400, { error: "That doesn't look like a valid email." });
  }
  if (body.consent !== true) {
    return json(400, { error: "Consent is required." });
  }

  const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      status: "unconfirmed",
      groups: [env.MAILERLITE_GROUP_ID],
    }),
  });

  if (res.ok) {
    return json(200, { ok: true });
  }

  // 422 from MailerLite = validation (e.g. already subscribed). Treat as success
  // for the user — DOI is idempotent and we don't want to leak member state.
  if (res.status === 422) {
    return json(200, { ok: true });
  }

  return json(502, { error: "We couldn't reach the mailing list. Try again in a moment." });
};

export const onRequest: PagesFunction = () =>
  new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
