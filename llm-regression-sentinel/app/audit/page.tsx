import SentimentAuditWrapper from "@/src/components/portfolio/llm-sentinel/audit/SentimentAuditWrapper";
import Navbar from "@/src/components/portfolio/llm-sentinel/Navbar";

export default function AuditPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="pt-16">
        <SentimentAuditWrapper />
      </main>
    </div>
  );
}
