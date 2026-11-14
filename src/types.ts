export interface RawIssue {
  number: number;
  title: string;
  labels?: Array<string | { name?: string }>;
  created_at: string;
  html_url: string;
  pull_request?: unknown;
  [key: string]: unknown;
}

export interface Issue {
  number: number;
  title: string;
  labels: string[];
  createdAt: string;
  url: string;
}

export type MonsterKind = "bug" | "enhancement" | "other";

export interface Monster {
  issue: Issue;
  kind: MonsterKind;
  size: 1 | 2 | 3 | 4 | 5;
  beginnerFriendly: boolean;
}
