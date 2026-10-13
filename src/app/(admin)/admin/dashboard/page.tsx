"use client";

import Link from "next/link";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export default function AdminDashboardPage() {
  const t = useTranslation();
  const links = t.admin.dashboard.quickLinks;

  const quickLinks = [
    { href: "/admin/students", ...links.students },
    { href: "/admin/exams", ...links.exams },
    { href: "/admin/payments", ...links.payments },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner with New Exam Button */}
      <div className="bg-slate-900 border border-solid border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-solid border-blue-500/20 text-blue-400 text-xs font-semibold">
            🛡️ {t.admin.dashboard.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{t.admin.dashboard.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{t.admin.dashboard.subtitle}</p>
        </div>
        <Link
          href="/admin/exams/new"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white no-underline font-semibold text-sm transition-all shadow-md shadow-blue-600/20 inline-flex items-center gap-2"
        >
          <span>+ {t.admin.dashboard.newExam}</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <AdminDashboardOverview />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-slate-900 hover:bg-slate-850 border border-solid border-slate-800 rounded-2xl p-6 transition-all group no-underline block"
          >
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{link.title} →</h3>
            <p className="text-sm text-slate-400 mt-2">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
