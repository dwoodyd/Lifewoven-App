export type OracleChatRequest = {
  message: string;
  conversationId?: number;
};

/**
 * Retains the server-issued conversation identifier for every follow-up turn.
 * Omitting it intentionally starts a new, isolated Oracle conversation.
 */
export function buildOracleChatRequest(message: string, conversationId: number | null): OracleChatRequest {
  return typeof conversationId === "number"
    ? { message, conversationId }
    : { message };
}
