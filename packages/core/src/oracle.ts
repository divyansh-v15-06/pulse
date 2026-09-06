/**
 * Helper to construct official Somnia Production Oracle audit graph links.
 */
export function getOracleAuditUrl(oracleQuestionId?: string): string | undefined {
  if (!oracleQuestionId || oracleQuestionId.trim() === "") {
    return undefined;
  }
  return `https://prd.oracle.somnia.host/questions/${encodeURIComponent(oracleQuestionId)}?view=graph`;
}

