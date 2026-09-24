"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Dropdown.module.css";

export interface DropdownItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Marks the currently selected item: exposed via aria-current and a visible check mark (not colour alone). */
  current?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  /** Accessible name for the trigger button when its visible content is not descriptive (e.g. "AZ"). */
  triggerLabel?: string;
}

export function Dropdown({ trigger, items, triggerLabel }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {open && (
        <ul className={styles.menu} role="menu">
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                role="menuitem"
                className={styles.item}
                disabled={item.disabled}
                aria-current={item.current ? "true" : undefined}
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
              >
                <span className={styles.check} aria-hidden="true">
                  {item.current ? "✓" : ""}
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
