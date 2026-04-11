import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../data/models/forensic_audit.dart';
import '../../logic/analysis/analysis_bloc.dart';
import '../components/forensic_ui_kit.dart';

class ModelAnalysisScreen extends StatelessWidget {
  final String modelId;
  final String input;
  final String output;
  final String? auditId;

  const ModelAnalysisScreen({
    super.key,
    required this.modelId,
    required this.input,
    required this.output,
    this.auditId,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final bloc = AnalysisBloc(context.read());
        if (auditId != null) {
          bloc.add(InitiateAnalysisPolling(auditId!));
        } else {
          bloc.add(RunForensicAuditRequested(input: input, output: output, modelId: modelId));
        }
        return bloc;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFFAFAFA),
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
          leading: IconButton(
            icon: const Icon(LucideIcons.chevronLeft, color: Colors.black),
            onPressed: () => Navigator.pop(context),
          ),
          title: Row(
            children: [
              Text('FORENSIC TERMINAL', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFF1A1A1A), letterSpacing: 2)),
              const Spacer(),
              const SyncConnectivityPulse(isOnline: true),
            ],
          ),
        ),
        body: BlocBuilder<AnalysisBloc, AnalysisState>(
          builder: (context, state) {
            if (state.status == AnalysisStatus.loading) {
              return const CognitiveThinkingOverlay();
            }
            if (state.status == AnalysisStatus.failure) {
              return _buildErrorState(state.error);
            }
            if (state.audit == null) return const SizedBox.shrink();

            return _buildDetailedAnalysis(context, state.audit!);
          },
        ),
        floatingActionButton: BlocBuilder<AnalysisBloc, AnalysisState>(
          builder: (context, state) {
            return AuditActionFab(
              onRefresh: () {
                 if (auditId != null) {
                    context.read<AnalysisBloc>().add(InitiateAnalysisPolling(auditId!));
                 }
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildDetailedAnalysis(BuildContext context, ForensicAudit audit) {
    final avgScore = (audit.forensicTrace.values.map((v) => v.score).reduce((a, b) => a + b) / audit.forensicTrace.length);
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          VerdictTacticalBanner(isAuthorized: avgScore >= 70, modelId: modelId),
          const SizedBox(height: 24),
          
          MetricsRibbon(metrics: {
             "Latency": "${audit.latency}ms",
             "Node": modelId.split('/').last,
             "Provider": audit.provider.toUpperCase(),
             "Compliance": "${avgScore.toInt()}%",
          }),
          
          const SizedBox(height: 32),
          
          Row(
            children: [
              Expanded(
                child: ForensicTacStat(
                  label: 'Crtical Safety',
                  value: '${audit.forensicTrace['safety']?.score.toInt() ?? 0}%',
                  icon: LucideIcons.shield,
                  color: (audit.forensicTrace['safety']?.score ?? 0) < 50 ? const Color(0xFFFF4500) : const Color(0xFF10B981),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ForensicTacStat(
                  label: 'Hallucination',
                  value: '${audit.forensicTrace['hallucination']?.score.toInt() ?? 0}%',
                  icon: LucideIcons.helpCircle,
                  color: (audit.forensicTrace['hallucination']?.score ?? 0) < 50 ? const Color(0xFFFF4500) : const Color(0xFF6366F1),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 40),
          
          Text('COGNITIVE DOMAIN RADAR', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 2)),
          const SizedBox(height: 24),
          Center(
            child: ForensicRadarChart(
              scores: audit.specializedExpertise.map((k, v) => MapEntry(k, v.score)),
            ),
          ),
          
          const SizedBox(height: 40),
          
          Text('EXPERTISE QUADRANTS', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 2)),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: audit.specializedExpertise.entries.map((e) => ExpertiseHexBadge(label: e.key, score: e.value.score)).toList(),
          ),
          
          const SizedBox(height: 40),
          
          Text('EVIDENCE REASONING TRACE', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 2)),
          const SizedBox(height: 24),
          ...audit.forensicTrace.entries.map((e) => EvidenceTraceTile(
            label: e.key, 
            score: e.value.score, 
            reason: e.value.reason,
          )).toList(),
          
          const SizedBox(height: 40),
          
          Text('JUDGE ARCHITECT ADVICE', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 2)),
          const SizedBox(height: 24),
          InkWell(
            onTap: () => _showAdvisor(context, audit.technicalTips),
            child: ReasoningLogBox(log: audit.technicalTips),
          ),
          
          const SizedBox(height: 60),
        ],
      ),
    );
  }

  void _showAdvisor(BuildContext context, String tips) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => TechnicalAdvisorSheet(tips: tips),
    );
  }

  Widget _buildErrorState(String? error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.alertTriangle, color: Color(0xFFFF4500), size: 40),
            const SizedBox(height: 16),
            Text('ANALYSIS NODE OFFLINE', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w900, color: const Color(0xFF1A1A1A))),
            const SizedBox(height: 8),
            Text(error ?? 'Unknown error occurred', textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 12, color: Colors.black45)),
          ],
        ),
      ),
    );
  }
}
