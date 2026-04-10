import { useState } from 'react';
import SentimentForm from './SentimentForm';
import AuditDashboard from './AuditDashboard';

function App() {
  const [auditResult, setAuditResult] = useState(null);

  const handleResult = (result) => {
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

export default App;
