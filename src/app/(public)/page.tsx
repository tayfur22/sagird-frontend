import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={`container ${styles.hero}`}>
      <h1 className={styles.title}>Şagird.az</h1>
      <p className={styles.subtitle}>
        Tələbələr üçün onlayn imtahan platforması. Bu, layihənin Phase 1
        əsası: dizayn sistemi və tətbiq skeletidir.
      </p>
      <div className={styles.actions}>
        <Button size="lg" disabled>
          İmtahana başla
        </Button>
        <Button size="lg" variant="secondary" disabled>
          Daha ətraflı
        </Button>
      </div>

      <Card title="Bu fazada nə hazırdır" className={styles.card}>
        <p>
          Backend əsası, frontend əsası, dizayn sistemi, paylaşılan komponentlər
          və üç tətbiq düzəni (ictimai, tələbə, admin) quruldu. İmtahan,
          sual, giriş və abunəlik funksionallığı gələcək fazalarda əlavə
          olunacaq.
        </p>
      </Card>
    </div>
  );
}
