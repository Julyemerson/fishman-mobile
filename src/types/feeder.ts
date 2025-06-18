export interface IFeeder {
  id: string;
  name: string;
  isActive: number;
  description: string;
  url: string;
  port: number;
  pondId: number;
  startFeedTime: string;
  stopFeedTime: string;
  feedInterval: number;
  initialDistributedWeight: number;
  createdAt: string;
  updatedAt: string;
}
