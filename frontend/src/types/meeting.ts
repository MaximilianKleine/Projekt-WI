export interface Meeting {
  id: string;
  title: string;
  audioFileName: string;
  date: string;
  type: "online" | "praesenz";
  createdAt: string;
  keyPoints: string;
  transcript: string;
  summary: string;
  participants: string[];
}
