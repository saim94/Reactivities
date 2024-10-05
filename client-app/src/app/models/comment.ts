export interface ChatComment {
    id: number;
    createdAt: Date;
    body: string;
    activityId: string;
    username: string;
    displayName: string;
    image: string;
    value: unknown;
}