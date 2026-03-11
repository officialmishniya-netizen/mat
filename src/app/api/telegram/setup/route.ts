import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.ADMIN_SETUP_SECRET) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!botToken || !appUrl) {
        return NextResponse.json({
            error: 'missing_config',
            details: { botToken: !!botToken, appUrl: !!appUrl }
        }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/setWebhook`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: `${appUrl}/api/telegram/webhook`,
                    allowed_updates: ['message', 'callback_query'],
                }),
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
