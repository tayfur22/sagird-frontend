import { Table, type TableColumn } from "@/components/ui/Table";
import { formatSubscriptionDate } from "@/lib/subscription/format";
import { t } from "@/lib/i18n/t";
import type { SubscriptionResponse } from "@/types/subscription";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";

export function SubscriptionHistoryTable({ items }: { items: SubscriptionResponse[] }) {
  const columns: TableColumn<SubscriptionResponse>[] = [
    {
      key: "plan",
      header: t.subscription.history.columns.plan,
      render: (row) => t.subscription.plans[row.plan],
    },
    {
      key: "status",
      header: t.subscription.history.columns.status,
      render: (row) => <SubscriptionStatusBadge subscription={row} />,
    },
    {
      key: "startAt",
      header: t.subscription.history.columns.startDate,
      render: (row) => formatSubscriptionDate(row.startAt),
    },
    {
      key: "endAt",
      header: t.subscription.history.columns.endDate,
      render: (row) => formatSubscriptionDate(row.endAt),
    },
  ];

  return (
    <Table
      columns={columns}
      rows={items}
      getRowKey={(row) => row.id}
      emptyMessage={t.subscription.history.empty}
    />
  );
}