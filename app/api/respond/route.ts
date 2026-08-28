const answerLabels = {
  yes: 'Yes, let us talk',
  no: 'Not yet',
  over: 'I do not want this to work. I am over you.',
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      answer?: keyof typeof answerLabels;
      needs?: string;
      website?: string;
    };

    if (body.website) return Response.json({ ok: true });
    if (!body.answer || !(body.answer in answerLabels)) {
      return Response.json({ error: 'Choose an answer first.' }, { status: 400 });
    }
    if (body.needs && body.needs.length > 5000) {
      return Response.json({ error: 'The written response is too long.' }, { status: 400 });
    }

    const recipient = process.env.RESPONSE_EMAIL;
    if (!recipient) {
      return Response.json({ error: 'Email delivery is not configured.' }, { status: 503 });
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
      return Response.json({ error: 'Email delivery failed.' }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Invalid response.' }, { status: 400 });
  }
}
