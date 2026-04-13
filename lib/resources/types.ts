export type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  location: string;
  verified: boolean;
  link?: string;
  communityTopics?: string[];
};