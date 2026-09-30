"use client";

import { ButtonLink } from "@/components/ui/Button";
import { HomeLeaderboardPreview } from "@/components/home/HomeLeaderboardPreview";
import { HomePlatformStats } from "@/components/home/HomePlatformStats";
import { HomeRegions } from "@/components/home/HomeRegions";
import { HomeUpcomingExams } from "@/components/home/HomeUpcomingExams";
import { usePublicNav } from "@/components/layout/usePublicNav";
import { useStatisticsRequest } from "@/hooks/useStatisticsRequest";
import { statisticsApi } from "@/lib/statistics/statistics-api";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "@/components/home/Home.module.css";

/**
 * Public home: the reference page for the public site's design language.
 * One shared overview request feeds both the statistics and regions sections;
 * exams and the leaderboard are student-only endpoints (see StudentDataGate).
 * Every data section has its own loading/error/empty state, so one failing
 * request never blanks the page.
 */
export default function HomePage() {
  const t = useTranslation();
  const { href } = usePublicNav();
  const overview = useStatisticsRequest(statisticsApi.getOverview);
  const why = t.home.why;

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={`container ${styles.heroInner}`}>
          <h1 id="home-hero-title" className={styles.heroTitle}>
            {t.home.hero.title}
          </h1>
          <p className={styles.heroText}>{t.home.hero.description}</p>
          <div className={styles.heroActions}>
            <ButtonLink href={href.exams} size="lg">
              {t.home.hero.primary}
            </ButtonLink>
            <ButtonLink href={href.subscriptions} size="lg" variant="secondary">
              {t.home.hero.secondary}
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className={`container ${styles.sections}`}>
        <HomePlatformStats overview={overview} />
        <HomeUpcomingExams />
        <HomeRegions overview={overview} />
        <HomeLeaderboardPreview />

        <section aria-labelledby="home-why-title">
          <h2 id="home-why-title" className={styles.ctaTitle} style={{ marginBottom: "var(--space-4)" }}>
            {why.title}
          </h2>
          <ul className={styles.whyGrid}>
            {[why.regular, why.competition, why.progress].map((item) => (
              <li key={item.title}>
                <article className={styles.whyCard}>
                  <h3 className={styles.whyTitle}>{item.title}</h3>
                  <p className={styles.whyText}>{item.text}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.cta} aria-labelledby="home-cta-title">
          <h2 id="home-cta-title" className={styles.ctaTitle}>
            {t.home.cta.title}
          </h2>
          <p className={styles.ctaText}>{t.home.cta.description}</p>
          <ButtonLink href={href.subscriptions} size="lg">
            {t.home.cta.action}
          </ButtonLink>
        </section>
      </div>
    </>
  );
}
