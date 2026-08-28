const answerLabels = {
  yes: 'Yes, let us talk',
  no: 'Not yet',
  over: 'I do not want this to work. I am over you.',
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
    if (!body.answer || !(body.answer in answerLabels)) {
      return json({ error: 'Choose an answer first.' }, 400);
    }
    if (body.needs && body.needs.length > 5000) {
      return json({ error: 'The written response is too long.' }, 400);
    }

    const recipient = process.env.RESPONSE_EMAIL;
    if (!recipient) {
      return json({ error: 'Email delivery is not configured.' }, 503);
    }

    const delivery = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: 'A response from More Than Flowers',
        Answer: answerLabels[body.answer],
        'What she needs': body.needs?.trim() || 'No written response',
        'Submitted at': new Date().toISOString(),
      }),
    });

    const result = await delivery.json().catch(() => null) as { success?: boolean | string } | null;
    if (!delivery.ok || (result?.success !== true && result?.success !== 'true')) {
      return json({ error: 'Email delivery failed.' }, 502);
    }

    return json({ ok: true });
  } catch {
    return json({ error: 'Invalid response.' }, 400);
  }
}
