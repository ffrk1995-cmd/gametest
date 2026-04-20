import { Resend } from "resend"

const FROM = "IndiePort <noreply@indieport-games.com>"

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM,
    to,
    subject: "【IndiePort】ご登録ありがとうございます",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#7c3aed">🎮 IndiePortへようこそ！</h1>
        <p>${name} さん、ご登録ありがとうございます。</p>
        <p>インディーゲームのテストプレイヤー募集プラットフォーム <strong>IndiePort</strong> をご利用いただけます。</p>
        <a href="${process.env.NEXTAUTH_URL}/recruitments"
           style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          募集一覧を見る
        </a>
      </div>
    `,
  })
}

export async function sendApplicationEmail(to: string, recruiterName: string, gameTitle: string, recruitmentId: string) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【IndiePort】「${gameTitle}」に新しい応募がありました`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#7c3aed">新しい応募通知</h2>
        <p>${recruiterName} さん、「<strong>${gameTitle}</strong>」に新しい応募が届きました。</p>
        <a href="${process.env.NEXTAUTH_URL}/recruitments/${recruitmentId}"
           style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          応募を確認する
        </a>
      </div>
    `,
  })
}

export async function sendApplicationResultEmail(to: string, playerName: string, gameTitle: string, approved: boolean) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【IndiePort】「${gameTitle}」の応募結果をお知らせします`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#7c3aed">応募結果のお知らせ</h2>
        <p>${playerName} さん</p>
        <p>「<strong>${gameTitle}</strong>」への応募結果をお知らせします。</p>
        <p style="font-size:20px;font-weight:bold;color:${approved ? "#16a34a" : "#dc2626"}">
          ${approved ? "✅ 承認されました" : "❌ 今回は見送りとなりました"}
        </p>
        ${approved ? `<p>おめでとうございます！テストプレイの詳細はプラットフォームでご確認ください。</p>` : ""}
      </div>
    `,
  })
}
