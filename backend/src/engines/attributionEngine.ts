import { getDemoAttribution, DEMO_CASES } from '../data/demoData';

export const runAttributionEngine = (caseId: string) => {
  return getDemoAttribution(caseId);
};
