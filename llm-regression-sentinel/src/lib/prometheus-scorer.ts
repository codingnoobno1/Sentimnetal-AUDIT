import testCases from "@/src/data/test_cases.json";

export interface EvalResult {
  case_id: string;
  domain: string;
  base: { score: number; critique: string };
  fine_tuned: { score: number; critique: string };
  delta: number;
  status: "improved" | "regression" | "stable";
}

export class PrometheusEvaluator {
  private suites = testCases.test_suites;

  private evaluateResponse(prompt: string, response: string, reference: string | null, rubric: string): { score: number; critique: string } {
    // Simulated heuristic for demonstration:
    // In a real scenario, this would call the Prometheus LLM
    let score = Math.floor(Math.random() * 5) + 1;

    // Simple exact match for Arithmetic
    if (reference && response.toLowerCase().includes(reference.toLowerCase())) {
      score = 5;
    }

    const critique = `The model followed the instructions adequately. Score based on ${rubric.split(':')[0]}.`;
    return { score, critique };
  }

  public runSuite(baseResponses: Record<string, string>, fineTunedResponses: Record<string, string>): EvalResult[] {
    const results: EvalResult[] = [];

    for (const suite of this.suites) {
      const suite_id = suite.id;
      const domain = suite.domain;

      for (const caseData of suite.cases) {
        const case_id = caseData.id;
        const prompt = caseData.prompt;
        const reference = caseData.reference;
        const rubric = caseData.rubric;

        const base_res = baseResponses[case_id] || "Sample base response";
        const ft_res = fineTunedResponses[case_id] || "Sample fine-tuned response";

        const baseEval = this.evaluateResponse(prompt, base_res, reference, rubric);
        const ftEval = this.evaluateResponse(prompt, ft_res, reference, rubric);

        const delta = ftEval.score - baseEval.score;

        results.push({
          case_id,
          domain,
          base: baseEval,
          fine_tuned: ftEval,
          delta,
          status: delta > 0 ? "improved" : delta < 0 ? "regression" : "stable",
        });
      }
    }

    return results;
  }
}
