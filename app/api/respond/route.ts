const answerLabels = {
  yes: 'Yes, let us figure this out',
  no: 'Not yet',
  over: 'I do not think I want to continue this. I am choosing to move on.',
} as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://morethanflowers.github.io',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      answer?: keyof typeof answerLabels;
      needs?: string;
      website?: string;
    };

    if (body.website) return json({ ok: true });
    const needs = body.needs?.trim() || '';
    const hasValidAnswer = Boolean(body.answer && body.answer in answerLabels);

    if (body.answer && !hasValidAnswer) {
      return json({ error: 'Choose an answer first.' }, 400);
    }
    if (!hasValidAnswer && !needs) {
      return json({ error: 'Share an answer or write what you need first.' }, 400);
    }
    if (needs.length > 5000) {
      return json({ error: 'The written response is too long.' }, 400);
    }

    const recipient = process.env.RESPONSE_EMAIL;
    if (!recipient) {
      return json({ error: 'Email delivery is not configured.' }, 503);
    }

    return new Response(null, {
      status: 307,
      headers: {
        ...corsHeaders,
        Location: `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`,
      },
    });
  } catch {
    return json({ error: 'Invalid response.' }, 400);
  }
}
