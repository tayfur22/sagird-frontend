import { Spinner } from "@/components/ui/Spinner";

export default function RootLoading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <Spinner size={32} />
    </div>
  );
}
