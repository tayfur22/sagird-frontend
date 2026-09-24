export interface NavItem {
  label: string;
  href: string;
  /** Future-phase items are rendered but disabled until their module ships. */
  disabled?: boolean;
  /** Optional key into the i18n `nav` dictionary; when set, the translated text replaces `label`. */
  labelKey?: string;
}
