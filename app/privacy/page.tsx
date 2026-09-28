import Link from "next/link"
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, BellRing, HelpCircle, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16 text-white space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Bosh sahifaga qaytish
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40 p-6 md:p-10 backdrop-blur-2xl space-y-3 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-400/30">
          <ShieldCheck className="h-4 w-4" /> Rasmiy Hujjat
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-black text-white">
          Maxfiylik Siyosati (Privacy Policy)
        </h1>
        <p className="text-xs md:text-sm text-white/70 max-w-2xl leading-relaxed">
          OneMedia 4K kino va anime platformasining foydalanuvchilar shaxsiy ma&apos;lumotlarini to&apos;plash, saqlash, himoyalash va ulardan foydalanish tartibi bo&apos;yicha rasmiy qoidalari.
        </p>
        <p className="text-[11px] text-cyan-300 font-mono pt-2">
          Hujjat oxirgi marta yangilangan sana: 2026-yil 28-sentyabr
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 text-xs md:text-sm text-white/80 leading-relaxed">
        {/* Section 1 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <FileText className="h-5 w-5" /> 1. Umumiy Qoidalar va Maqsadi
          </h2>
          <p>
            Ushbu Maxfiylik Siyosati OneMedia (keyingi o&apos;rinlarda &quot;Platforma&quot; yoki &quot;Xizmat&quot;) veb-sayti va Telegram boti foydalanuvchilarining shaxsiy daxlsizligini ta&apos;minlash hamda ma&apos;lumotlar xavfsizligini kafolatlash maqsadida ishlab chiqilgan.
          </p>
          <p>
            Platformadan foydalanish yoki hisob yaratish orqali siz ushbu Maxfiylik siyosatida ko&apos;rsatilgan shartlarga to&apos;liq rozilik bildirasiz.
          </p>
        </section>

        {/* Section 2 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <Database className="h-5 w-5" /> 2. To&apos;planadigan Shaxsiy Ma&apos;lumotlar
          </h2>
          <p>Biz xizmat sifati va xavfsizligini oshirish uchun quyidagi ma&apos;lumotlarni to&apos;playmiz:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>
              <b>Hisob ma&apos;lumotlari:</b> Foydalanuvchi ismi, email manzili va paroli (parollar faqat bitta tomonlama xesh ko&apos;rinishida saqlanadi).
            </li>
            <li>
              <b>Telegram Autentifikatsiya Ma&apos;lumotlari:</b> Telegram ID raqami, Telegram username (@ism), ism-familiya va profil rasmi URL.
            </li>
            <li>
              <b>Obuna va To&apos;lov holati:</b> VIP 4K obuna muddati va to&apos;lov kvitansiyalari yozuvlari (Karta raqamlari platformamizda saqlanmaydi).
            </li>
            <li>
              <b>Texnik ma&apos;lumotlar:</b> Kirish vaqti, qurilma turi va sessiya identifikatorlari.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <UserCheck className="h-5 w-5" /> 3. Telegram Autentifikatsiyasi va Bot Integratsiyasi
          </h2>
          <p>
            OneMedia foydalanuvchilarga 1-bosishda tezkor va xavfsiz kirish imkoniyatini berish uchun Telegram Bot API bilan rasmiy integratsiyadan foydalanadi.
          </p>
          <p>
            Siz Telegram orqali tizimga kirganingizda, Telegram API orqali berilgan ruxsat bo&apos;yicha faqatgina ochiq profil ma&apos;lumotlaringiz (ID, username, ism) olinadi va Email hisobingiz bilan birlashtirilishi mumkin. Telegram parolingiz yoki shaxsiy yozishmalaringizga xizmatimiz hech qachon kirish huquqiga ega bo&apos;lmaydi.
          </p>
        </section>

        {/* Section 4 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <Lock className="h-5 w-5" /> 4. Ma&apos;lumotlar Xavfsizligi va Baza Himoyasi
          </h2>
          <p>
            Barcha ma&apos;lumotlar <b>Neon PostgreSQL</b> xavfsiz bulutli ma&apos;lumotlar bazasida shifrlangan SSL ulanishi orqali saqlanadi.
          </p>
          <p>
            Biz foydalanuvchi ma&apos;lumotlarini hech qachon uchinchi shaxslarga sotmaymiz, ijaraga bermaymiz va tijorat maqsadida tarqatmaymiz.
          </p>
        </section>

        {/* Section 5 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <Eye className="h-5 w-5" /> 5. Cookies va Mahalliy Xotira
          </h2>
          <p>
            Platforma sessiyangizni saqlab turish, qayta kirganda avtomatik tanish hamda bildirishnomalarni ko&apos;rsatish uchun xavfsiz HTTP-Only cookie va localStorage xotirasidan foydalanadi. Siz istalgan vaqtda brauzer sozlamalari orqali cookies fayllarini tozalashingiz mumkin.
          </p>
        </section>

        {/* Section 6 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <BellRing className="h-5 w-5" /> 6. Foydalanuvchilar Huquqlari
          </h2>
          <p>Siz quyidagi huquqlarga egasiz:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>O&apos;z shaxsiy profilingizdagi ma&apos;lumotlarni ko&apos;rish va tahrirlash.</li>
            <li>Telegram hisobingizni uzish yoki qayta ulash.</li>
            <li>Hisobni butunlay o&apos;chirish bo&apos;yicha texnik qo&apos;llab-quvvatlash xizmatiga murojaat qilish.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" /> 7. Bog&apos;lanish va Qo&apos;llab-quvvatlash
          </h2>
          <p>
            Maxfiylik siyosati yoki shaxsiy ma&apos;lumotlar bo&apos;yicha savollaringiz bo&apos;lsa, biz bilan quyidagi aloqa kanallari orqali bog&apos;lanishingiz mumkin:
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="https://t.me/onemediahd_bot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400/10 border border-cyan-400/30 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20 transition"
            >
              💬 Telegram Qo&apos;llab-quvvatlash Boti (@onemediahd_bot)
            </a>
            <a
              href="mailto:support@onemedia.uz"
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              ✉️ Email: support@onemedia.uz
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
