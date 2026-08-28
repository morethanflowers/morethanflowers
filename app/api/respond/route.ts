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

    const delivery = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://morethanflowers.github.io',
        Referer: 'https://morethanflowers.github.io/morethanflowers/',
      },
      body: JSON.stringify({
        _subject: 'A response from More Than Flowers',
        _url: 'https://morethanflowers.github.io/morethanflowers/',
        Answer: hasValidAnswer ? answerLabels[body.answer as keyof typeof answerLabels] : 'No answer selected',
        'What she needs': needs || 'No written response',
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
