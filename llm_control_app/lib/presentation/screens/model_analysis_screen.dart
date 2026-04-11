import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../data/models/forensic_audit.dart';
import '../../logic/analysis/analysis_bloc.dart';

class ModelAnalysisScreen extends StatelessWidget {
  final String modelId;
  final String input;
  final String output;

  const ModelAnalysisScreen({
    super.key,
    required this.modelId,
    required this.input,
    required this.output,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AnalysisBloc(context.read())
        ..add(RunForensicAuditRequested(input: input, output: output, modelId: modelId)),
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
          leading: IconButton(
            icon: const Icon(LucideIcons.chevronLeft, color: Colors.black),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text('FORENSIC ANALYSIS', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFF1A1A1A), letterSpacing: 2)),
        ),
        body: BlocBuilder<AnalysisBloc, AnalysisState>(
          builder: (context, state) {
            if (state.status == AnalysisStatus.loading) {
              return _buildLoadingState();
            }
            if (state.status == AnalysisStatus.failure) {
              return _buildErrorState(state.error);
            }
            if (state.audit == null) return const SizedBox.shrink();

            return _buildAnalysisContent(context, state.audit!);
          },
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: Color(0xFF6366F1), strokeWidth: 2),
          const SizedBox(height: 24),
          Text('SENTINEL JUDGE IS AUDITING...', style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF6366F1))),
          const SizedBox(height: 8),
          Text('Performing 11-dimension cognitive trace', style: GoogleFonts.inter(fontSize: 12, color: Colors.black38)),
        ],
      ),
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

  Widget _buildAnalysisContent(BuildContext context, ForensicAudit audit) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildScoreboard(audit),
          const SizedBox(height: 32),
          Text('SPECIALIZED EXPERTISE', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 1.5)),
          const SizedBox(height: 20),
          Center(child: ForensicRadarPlot(scores: audit.specializedExpertise)),
          const SizedBox(height: 40),
          Text('FORENSIC TRACE', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 1.5)),
          const SizedBox(height: 20),
          ...audit.forensicTrace.entries.map((e) => _buildForensicBar(e.key, e.value)).toList(),
          const SizedBox(height: 40),
          _buildTechnicalTips(audit.technicalTips),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildScoreboard(ForensicAudit audit) {
    final avg = (audit.forensicTrace.values.map((v) => v.score).reduce((a, b) => a + b) / audit.forensicTrace.length).toInt();
    final isHealthy = avg >= 70;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('COMPLIANCE SCORE', style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white30, letterSpacing: 1.5)),
              const SizedBox(height: 4),
              Text(isHealthy ? 'AUTHORIZED' : 'REGRESSION', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w900, color: isHealthy ? const Color(0xFF10B981) : const Color(0xFFFF4500))),
            ],
          ),
          const Spacer(),
          Text('$avg%', style: GoogleFonts.jetBrainsMono(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildForensicBar(String label, AuditScore data) {
    final color = data.score >= 80 ? const Color(0xFF6366F1) : data.score >= 50 ? Colors.amber : const Color(0xFFFF4500);
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label.replaceAll('_', ' ').toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF1A1A1A))),
              Text('${data.score.toInt()}%', style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(value: data.score / 100, backgroundColor: Colors.black.withOpacity(0.03), color: color, minHeight: 4),
          const SizedBox(height: 8),
          Text(data.reason, style: GoogleFonts.inter(fontSize: 11, color: Colors.black45, height: 1.4)),
        ],
      ),
    );
  }

  Widget _buildTechnicalTips(String tips) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: const Color(0xFF6366F1).withOpacity(0.05), border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.1)), borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.cpu, size: 14, color: Color(0xFF6366F1)),
              const SizedBox(width: 8),
              Text('ARCHITECT OPTIMIZATION', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1))),
            ],
          ),
          const SizedBox(height: 12),
          Text(tips, style: GoogleFonts.inter(fontSize: 12, color: Colors.black87, height: 1.5, fontStyle: FontStyle.italic)),
        ],
      ),
    );
  }
}

class ForensicRadarPlot extends StatelessWidget {
  final Map<String, AuditScore> scores;
  const ForensicRadarPlot({super.key, required this.scores});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(200, 200),
      painter: RadarPainter(scores),
    );
  }
}

class RadarPainter extends CustomPainter {
  final Map<String, AuditScore> scores;
  RadarPainter(this.scores);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final keys = scores.keys.toList();
    final angleStep = (2 * math.pi) / keys.length;

    final axisPaint = Paint()..color = Colors.black.withOpacity(0.05)..style = PaintingStyle.stroke..strokeWidth = 1;
    final gridPaint = Paint()..color = Colors.black.withOpacity(0.02)..style = PaintingStyle.stroke..strokeWidth = 1;

    // Draw grid rings
    for (var i = 1; i <= 4; i++) {
       canvas.drawCircle(center, radius * (i / 4), gridPaint);
    }

    // Draw axes and score points
    final scorePoints = <Offset>[];
    for (var i = 0; i < keys.length; i++) {
      final angle = i * angleStep - math.pi / 2;
      final axisEnd = Offset(center.dx + radius * math.cos(angle), center.dy + radius * math.sin(angle));
      canvas.drawLine(center, axisEnd, axisPaint);

      // Score point
      final score = scores[keys[i]]?.score ?? 0;
      final pointRadius = radius * (score / 100);
      scorePoints.add(Offset(center.dx + pointRadius * math.cos(angle), center.dy + pointRadius * math.sin(angle)));
      
      // Labels
      final labelPos = Offset(center.dx + (radius + 15) * math.cos(angle), center.dy + (radius + 15) * math.sin(angle));
      _drawText(canvas, keys[i].toUpperCase(), labelPos);
    }

    // Draw score polygon
    final polyPath = Path()..moveTo(scorePoints[0].dx, scorePoints[0].dy);
    for (var i = 1; i < scorePoints.length; i++) {
      polyPath.lineTo(scorePoints[i].dx, scorePoints[i].dy);
    }
    polyPath.close();

    canvas.drawPath(polyPath, Paint()..color = const Color(0xFF6366F1).withOpacity(0.2)..style = PaintingStyle.fill);
    canvas.drawPath(polyPath, Paint()..color = const Color(0xFF6366F1)..style = PaintingStyle.stroke..strokeWidth = 2);
  }

  void _drawText(Canvas canvas, String text, Offset center) {
    final tp = TextPainter(
      text: TextSpan(text: text, style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w800, color: Colors.black26)),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(center.dx - tp.width / 2, center.dy - tp.height / 2));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
