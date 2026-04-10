import { NextResponse } from "next/server";
import { PrometheusEvaluator } from "@/src/lib/prometheus-scorer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseResponses = {}, fineTunedResponses = {} } = body;

    const evaluator = new PrometheusEvaluator();
    const results = evaluator.runSuite(baseResponses, fineTunedResponses);

    // Calculate overall summary
    const regressions = results.filter(r => r.status === "regression").length;
    const improvements = results.filter(r => r.status === "improved").length;
    
    let status = "Stable";
    if (regressions > 0) status = "Warning";
    if (regressions > 3) status = "Critical";

    return NextResponse.json({
      summary: {
        total: results.length,
        regressions,
        improvements,
        status
      },
      cases: results
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to run evaluation" }, { status: 500 });
  }
}

// Support GET for testing
export async function GET() {
  const evaluator = new PrometheusEvaluator();
  const results = evaluator.runSuite({}, {});
  return NextResponse.json(results);
}
