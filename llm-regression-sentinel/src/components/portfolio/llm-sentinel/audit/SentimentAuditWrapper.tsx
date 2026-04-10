"use client";

import { useState } from 'react';
import SentimentForm from './SentimentForm';
import AuditDashboard from './AuditDashboard';

export default function SentimentAuditWrapper() {
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleResult = (result: any) => {
    setAuditResult(result);
  };

  const handleNewAudit = () => {
    setAuditResult(null);
  };

  if (auditResult) {
    return <AuditDashboard auditResult={auditResult} onNewAudit={handleNewAudit} />;
  }

  return <SentimentForm onResult={handleResult} />;
}
