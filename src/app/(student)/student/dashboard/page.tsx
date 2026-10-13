"use client";

import Link from "next/link";
import { StudentExamList } from "@/components/exam/StudentExamList";
import { DashboardSubscriptionCard } from "@/components/subscription/DashboardSubscriptionCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const t = useTranslation();

  return (
    <>
      {user && (
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>{t.dashboard.welcome.replace("{name}", user.firstName)}</h1>
        </div>
      )}
      <DashboardSubscriptionCard />
      <section className={styles.exams} aria-labelledby="dashboard-exams-title">
        <div className={styles.examsHeader}>
          <h2 id="dashboard-exams-title" className={styles.examsTitle}>
            {t.exam.student.listTitle}
          </h2>
          <Link href="/student/exams" className={styles.examsLink}>
            {t.dashboard.viewAllExams}
          </Link>
        </div>
        <StudentExamList pageSize={3} showPagination={false} />
      </section>
    </>
  );
}
