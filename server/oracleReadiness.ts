export const ORACLE_MINIMUM_RECENT_RECORDS = 3;

export function hasSufficientOracleEvidence(input: { checkInCount: number; journalEntryCount: number }) {
  return input.checkInCount >= ORACLE_MINIMUM_RECENT_RECORDS || input.journalEntryCount >= ORACLE_MINIMUM_RECENT_RECORDS;
}

export function buildOracleReadiness(input: { checkInCount: number; journalEntryCount: number }) {
  const totalRecords = input.checkInCount + input.journalEntryCount;
  return {
    ...input,
    totalRecords,
    hasSufficientData: hasSufficientOracleEvidence(input),
    minimumRecords: ORACLE_MINIMUM_RECENT_RECORDS,
  };
}
