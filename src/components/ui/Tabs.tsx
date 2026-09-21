"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
}

export function Tabs({ items, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div>
      <div className={styles.list} role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={item.id === activeId}
            aria-controls={`panel-${item.id}`}
            className={cn(styles.tab, item.id === activeId && styles.active)}
            onClick={() => setActiveId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {active && (
        <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className={styles.panel}>
          {active.content}
        </div>
      )}
    </div>
  );
}
