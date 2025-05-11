export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  sources: string[];
  url: string;
}

export interface Politician {
  id: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  rating: number;
  mentionCount: number;
}

export interface TopicWithColor {
  name: string;
  color: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: string;
}

export interface RatingData {
  politicianId: number;
  userId?: number;
  rating: number;
}

export interface PoliticianMention {
  politicianId: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  rating?: number;
}
