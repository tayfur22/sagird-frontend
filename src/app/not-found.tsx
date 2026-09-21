import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 480, margin: "4rem auto" }}>
      <EmptyState title="Səhifə tapılmadı" description="Axtardığınız səhifə mövcud deyil." />
    </div>
  );
}
