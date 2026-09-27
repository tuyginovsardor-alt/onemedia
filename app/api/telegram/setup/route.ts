import { NextResponse } from "next/server"
import {
  configureTelegramWebhook,
  getTelegramWebhookInfo,
  getTelegramBotDetails,
  resolveCurrentSiteUrl,
} from "@/app/actions/telegram"
import { isTelegramConfigured, getTelegramBotToken, PRODUCTION_DOMAIN, normalizeWebhookUrl } from "@/lib/telegram"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const action = url.searchParams.get("action")
  const format = url.searchParams.get("format")
  const customUrl = url.searchParams.get("url")

  const siteUrl = await resolveCurrentSiteUrl()
  const configured = isTelegramConfigured()
  const rawTarget = customUrl || (url.searchParams.get("domain") ? `https://${url.searchParams.get("domain")}` : PRODUCTION_DOMAIN)
  const webhookUrl = normalizeWebhookUrl(rawTarget)

  let actionResult: { ok: boolean; message: string; data?: unknown } | null = null

  if (action === "set") {
    try {
      const result = await configureTelegramWebhook(webhookUrl, true)
      actionResult = {
        ok: true,
        message: `Webhook muvaffaqiyatli ulandi: ${webhookUrl}`,
        data: result,
      }
    } catch (error) {
      actionResult = {
        ok: false,
        message: `Xatolik: ${(error as Error).message}`,
      }
    }
  }

  const [info, bot] = await Promise.all([
    getTelegramWebhookInfo().catch(() => null),
    getTelegramBotDetails().catch(() => null),
  ])

  // If format=json or request explicitly accepts JSON, return JSON
  if (format === "json" || request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({
      ok: true,
      service: "onemedia-telegram-webhook-setup",
      configured,
      botUsername: bot?.username ? `@${bot.username}` : null,
      botName: bot?.first_name || null,
      productionDomain: PRODUCTION_DOMAIN,
      currentWebhook: info,
      actionResult,
      setupUrls: {
        setProductionWebhook: `${siteUrl}/api/telegram/setup?action=set&url=${encodeURIComponent("https://onemedia-mocha.vercel.app/api/telegram/webhook")}`,
        setCurrentHostWebhook: `${siteUrl}/api/telegram/setup?action=set&url=${encodeURIComponent(`${siteUrl}/api/telegram/webhook`)}`,
      },
    })
  }

  // Otherwise, return a standalone HTML Setup Page
  const token = getTelegramBotToken()
  const maskedToken = token ? `${token.slice(0, 5)}...${token.slice(-5)}` : "Mavjud emas"
  const isTargetActive = info?.url === `https://onemedia-mocha.vercel.app/api/telegram/webhook`

  const html = `<!DOCTYPE html>
<html lang="uz" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OneMedia — Telegram Webhook Sozlash</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #070913;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      max-width: 680px;
      width: 100%;
      padding: 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(6, 182, 212, 0.15);
      color: #38bdf8;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
    }
    p.subtitle {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .alert {
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 24px;
      font-size: 14px;
      line-height: 1.4;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .info-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 14px;
    }
    .info-box span.label {
      display: block;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .info-box span.val {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      word-break: break-all;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      margin-bottom: 12px;
    }
    .btn-primary {
      background: #06b6d4;
      color: #020617;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
    }
    .btn-primary:hover {
      background: #22d3ee;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .custom-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .input-group {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    input[type="text"] {
      flex: 1;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: #06b6d4;
    }
    .btn-small {
      padding: 10px 18px;
      font-size: 13px;
      margin-bottom: 0;
      width: auto;
    }
    .direct-link {
      margin-top: 20px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    code {
      background: rgba(0, 0, 0, 0.4);
      padding: 2px 6px;
      border-radius: 4px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">OneMedia Tizimi</div>
    <h1>Telegram Webhook Sozlash</h1>
    <p class="subtitle">
      Ushbu sahifa orqali Telegram botingizni <b>onemedia-mocha.vercel.app</b> domeniga avtomatik bog'lashingiz mumkin.
    </p>

    ${
      actionResult
        ? `<div class="alert ${actionResult.ok ? "alert-success" : "alert-error"}">
            ${actionResult.ok ? "✅" : "⚠️"} ${actionResult.message}
          </div>`
        : ""
    }

    <div class="info-grid">
      <div class="info-box">
        <span class="label">Bot nomi & Username</span>
        <span class="val">${bot?.first_name || "OneMedia Bot"} ${bot?.username ? `(@${bot.username})` : ""}</span>
      </div>
      <div class="info-box">
        <span class="label">Webhook holati</span>
        <span class="val" style="color: ${info?.url ? "#34d399" : "#fbbf24"}">
          ${info?.url ? "🟢 Ulangan" : "🟡 Ulanmagan"}
        </span>
      </div>
      <div class="info-box" style="grid-column: span 2;">
        <span class="label">Telegramdagi joriy Webhook URL</span>
        <span class="val" style="font-family: monospace; font-size: 12px;">
          ${info?.url || "O'rnatilmagan"}
        </span>
      </div>
    </div>

    <!-- Main action button for onemedia-mocha.vercel.app -->
    <a href="/api/telegram/setup?action=set&url=${encodeURIComponent("https://onemedia-mocha.vercel.app/api/telegram/webhook")}" class="btn btn-primary">
      ⚡ onemedia-mocha.vercel.app uchun Webhookni o'rnatish
    </a>

    <!-- Current host button -->
    <a href="/api/telegram/setup?action=set&url=${encodeURIComponent(`${siteUrl}/api/telegram/webhook`)}" class="btn btn-secondary">
      🔄 Hozirgi server domeni orqali ulash (${new URL(siteUrl).host})
    </a>

    <!-- Custom URL Form -->
    <form action="/api/telegram/setup" method="GET" class="custom-form">
      <input type="hidden" name="action" value="set">
      <label style="font-size: 12px; color: #94a3b8; font-weight: 600;">Boshqa maxsus URL bilan o'rnatish:</label>
      <div class="input-group">
        <input type="text" name="url" placeholder="https://onemedia-mocha.vercel.app/api/telegram/webhook" value="https://onemedia-mocha.vercel.app/api/telegram/webhook">
        <button type="submit" class="btn btn-secondary btn-small">O'rnatish</button>
      </div>
    </form>

    <div class="direct-link">
      <b>Tavsiya etilgan Webhook manzili:</b><br>
      <code>https://onemedia-mocha.vercel.app/api/telegram/webhook</code>
      <br><br>
      <a href="/admin/telegram" style="color: #38bdf8; text-decoration: none;">← To'liq Admin Panelga o'tish</a>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}

export async function POST(request: Request) {
  // Support POST request as well
  const body = await request.json().catch(() => ({}))
  const targetUrl = normalizeWebhookUrl(body.url || "https://onemedia-mocha.vercel.app")

  try {
    const result = await configureTelegramWebhook(targetUrl, true)
    return NextResponse.json({
      ok: true,
      message: "Webhook muvaffaqiyatli o'rnatildi",
      webhookUrl: targetUrl,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
