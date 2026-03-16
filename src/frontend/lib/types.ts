export type PollType = 'SingleChoice' | 'MultipleChoice' | 'Ranked';

export type PollStatus = 'Draft' | 'Active' | 'Closed' | 'Archived';

export type PollOption = {
  id: string;
  text: string;
  sortOrder: number;
  voteCount: number;
};

export type Poll = {
  id: string;
  title: string;
  description: string | null;
  status: PollStatus;
  type: PollType;
  isActive: boolean;
  allowCustomAnswers: boolean;
  expiresAt: string | null;
  createdAt: string;
  options: PollOption[];
  totalVotes: number;
};

export type PollResultOption = {
  id: string;
  text: string;
  sortOrder: number;
  voteCount: number;
  percentage: number;
  voters?: string[];
  averageRank?: number | null;
};

export type CustomAnswer = {
  text: string;
  voterName: string;
  votedAt: string;
};

export type GeoVoteData = {
  countryCode: string;
  region: string | null;
  voteCount: number;
};

export type PollResults = {
  pollId: string;
  totalVoters: number;
  options: PollResultOption[];
  customAnswers: CustomAnswer[];
  geoData: GeoVoteData[];
};
