// Shared by the server logger (activity.ts) and the client logs page — no Node imports here.

export const ACTIONS = ["LOGIN", "LOGIN_FAILED", "LOGOUT", "STATUS", "ASSIGN", "NOTES", "DELIVERY"] as const;
export type ActivityAction = (typeof ACTIONS)[number];

/** A row in the `admin_logs` table. */
export type Activity = {
  id: string;
  created_at: string;
  actor: string;
  action: ActivityAction;
  request_id: string | null;
  request_ref: number | null;
  detail: string;
  ip: string | null;
};
