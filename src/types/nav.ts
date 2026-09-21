export interface NavItem {
  label: string;
  href: string;
  /** Future-phase items are rendered but disabled until their module ships. */
  disabled?: boolean;
}
