export class SignalRGroup implements ISignalRGroup {
    constructor(connectionId?: string, conversationId?: number) {
        this.connectionId = connectionId!;
        this.conversationId = conversationId!;
    }
    connectionId: string;
    conversationId: number;
}
export interface ISignalRGroup {
    connectionId: string;
    conversationId: number
}