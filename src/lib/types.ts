export const STATUSES = ["NEW", "CONTACTED", "PAID", "IN_PROGRESS", "DELIVERED", "CLOSED"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  PAID: "PAID",
  IN_PROGRESS: "IN PROGRESS",
  DELIVERED: "DELIVERED",
  CLOSED: "CLOSED",
};

export const HELP_OPTIONS = ["idea", "code guidance", "report", "ppt", "viva prep"] as const;

/** What the public form sends. */
export type RequestInput = {
  name: string;
  email: string;
  phone: string;
  college: string;
  year: 1 | 2 | 3 | 4;
  branch: string;
  domain: string;
  title: string;
  no_idea: boolean;
  deadline: string; // YYYY-MM-DD
  help: string[];
  notes: string;
};

/** A row in the `requests` table. */
export type RequestRow = RequestInput & {
  id: string;
  ref: number;
  created_at: string;
  status: Status;
  assignee: string | null;
  admin_notes: string;
  delivery_links: string[];
  delivered_at: string | null;
};

export type RequestPatch = Partial<
  Pick<RequestRow, "status" | "assignee" | "admin_notes" | "delivery_links" | "delivered_at">
>;
