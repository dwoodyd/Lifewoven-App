import { describe, expect, it } from "vitest";
import { buildOracleChatRequest } from "../shared/oracleConversation";

describe("buildOracleChatRequest", () => {
  it("starts the first turn without a conversation identifier", () => {
    expect(buildOracleChatRequest("I feel stuck.", null)).toEqual({ message: "I feel stuck." });
  });

  it("sends the existing conversation identifier on a follow-up turn", () => {
    expect(buildOracleChatRequest("What should I try first?", 42)).toEqual({
      message: "What should I try first?",
      conversationId: 42,
    });
  });
});
