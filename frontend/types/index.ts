export interface Article {
  id: number;
  title: string;
  url: string;
  summary: string | null;
  source_domain: string;
  published_date: string | null;
  is_processed: boolean;
  entities: any;
  sentiment_score: number | null;
}

export interface Cascade {
  entity: string;
  type: string;
  mention_count: number;
  source_count: number;
  sources: string[];
  velocity: number;
  first_seen: string;
  last_seen: string;
  articles: CascadeArticle[];
}

export interface CascadeArticle {
  id: number;
  title: string;
  url: string;
  published_date: string;
  source: string;
}

export interface Synthesis {
  entity: string;
  type: string;
  mention_count: number;
  source_count: number;
  synthesis: string;
}

export interface Feed {
  id: number;
  url: string;
  title: string;
  category: string;
  is_active: boolean;
  last_fetched: string | null;
}