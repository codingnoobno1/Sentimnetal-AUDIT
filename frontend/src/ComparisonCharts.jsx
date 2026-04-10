import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DOMAIN_LABELS = {
  arithmetic: 'Arithmetic',
  code_generation: 'Code Gen',
  logical_reasoning: 'Logic',
  general_knowledge: 'Knowledge',
  instruction_following: 'Instructions',
  safety_compliance: 'Safety',
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium mb-2">{DOMAIN_LABELS[label] || label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ComparisonCharts({ domains }) {
  if (!domains || domains.length === 0) {
    return (
      <div className="p-6 bg-slate-800 rounded-lg text-center">
        <p className="text-slate-400">No comparison data available.</p>
      </div>
    );
  }

  const chartData = domains.map((domain) => ({
    name: domain.domain,
    displayName: DOMAIN_LABELS[domain.domain] || domain.domain,
    base_score: domain.base_score,
    ft_score: domain.ft_score,
  }));

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Model Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="displayName"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />
          <Bar
            dataKey="base_score"
            name="Base Model"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
          <Bar
            dataKey="ft_score"
            name="Fine-Tuned"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
