import { getDemoRisk, DEMO_CASES } from '../data/demoData';

export const runRiskEngine = (caseId: string) => {
  return getDemoRisk(caseId);
};
