import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

// --- 1. VerdictTacticalBanner ---
class VerdictTacticalBanner extends StatelessWidget {
  final bool isAuthorized;
  final String modelId;

  const VerdictTacticalBanner({super.key, required this.isAuthorized, required this.modelId});

  @override
  Widget build(BuildContext context) {
    final color = isAuthorized ? const Color(0xFF10B981) : const Color(0xFFFF4500);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        border: Border.all(color: color.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          Icon(isAuthorized ? LucideIcons.shieldCheck : LucideIcons.shieldAlert, color: color, size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(isAuthorized ? 'SYSTEM AUTHORIZED' : 'REGRESSION DETECTED', 
                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w900, color: color, letterSpacing: 1.5)),
                Text('NODE: ${modelId.toUpperCase()}', style: GoogleFonts.jetBrainsMono(fontSize: 9, color: color.withOpacity(0.6))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
            child: Text(isAuthorized ? 'STABLE' : 'CRITICAL', style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// --- 2. ForensicTacStat ---
class ForensicTacStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const ForensicTacStat({super.key, required this.label, required this.value, required this.icon, this.color = const Color(0xFF6366F1)});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.black.withOpacity(0.03))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(height: 12),
          Text(value, style: GoogleFonts.jetBrainsMono(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF1A1A1A))),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w700, color: Colors.black26, letterSpacing: 1)),
        ],
      ),
    );
  }
}

// --- 3. SyncConnectivityPulse ---
class SyncConnectivityPulse extends StatefulWidget {
  final bool isOnline;
  const SyncConnectivityPulse({super.key, required this.isOnline});

  @override
  State<SyncConnectivityPulse> createState() => _SyncConnectivityPulseState();
}

class _SyncConnectivityPulseState extends State<SyncConnectivityPulse> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.isOnline ? const Color(0xFF6366F1) : Colors.redAccent;
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
            boxShadow: [
              BoxShadow(color: color.withOpacity(0.3), blurRadius: 4 + (4 * _controller.value), spreadRadius: 2 * _controller.value),
            ],
          ),
        );
      },
    );
  }
}

// --- 4. ModelSpecBadge ---
class ModelSpecBadge extends StatelessWidget {
  final String specs;
  const ModelSpecBadge({super.key, required this.specs});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: const Color(0xFFF8F8F8), border: Border.all(color: Colors.black.withOpacity(0.05)), borderRadius: BorderRadius.circular(4)),
      child: Text(specs, style: GoogleFonts.jetBrainsMono(fontSize: 8, fontWeight: FontWeight.w700, color: Colors.black38)),
    );
  }
}

// --- 5. EvidenceTraceTile ---
class EvidenceTraceTile extends StatelessWidget {
  final String label;
  final double score;
  final String reason;

  const EvidenceTraceTile({super.key, required this.label, required this.score, required this.reason});

  @override
  Widget build(BuildContext context) {
    final isGood = score >= 75;
    final isWarning = score < 50;
    final color = isWarning ? const Color(0xFFFF4500) : isGood ? const Color(0xFF6366F1) : Colors.amber;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.03),
        border: Border.all(color: color.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label.toUpperCase(), style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w900, color: color, letterSpacing: 1)),
              Text('${score.toInt()}/100', style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.w800, color: color)),
            ],
          ),
          const SizedBox(height: 8),
          Text(reason, style: GoogleFonts.inter(fontSize: 11, color: Colors.black54, height: 1.4, fontStyle: FontStyle.italic)),
        ],
      ),
    );
  }
}

// --- 6. LatencyGaugePlot ---
class LatencyGaugePlot extends StatelessWidget {
  final int latencyMs;
  const LatencyGaugePlot({super.key, required this.latencyMs});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 120,
      child: CustomPaint(
        painter: GaugePainter(latencyMs),
      ),
    );
  }
}

class GaugePainter extends CustomPainter {
  final int latency;
  GaugePainter(this.latency);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    
    // Draw background arc
    final bgPaint = Paint()..color = Colors.black.withOpacity(0.05)..style = PaintingStyle.stroke..strokeWidth = 10..strokeCap = StrokeCap.round;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), math.pi * 0.8, math.pi * 1.4, false, bgPaint);

    // Draw value arc
    final percentage = math.min(latency / 5000.0, 1.0); // Max 5s
    final valuePaint = Paint()..color = const Color(0xFF6366F1)..style = PaintingStyle.stroke..strokeWidth = 10..strokeCap = StrokeCap.round;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), math.pi * 0.8, math.pi * 1.4 * percentage, false, valuePaint);

    // Text
    final tp = TextPainter(
      text: TextSpan(text: '${latency}ms', style: GoogleFonts.jetBrainsMono(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.black)),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(center.dx - tp.width / 2, center.dy - tp.height / 2));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// --- 7. ReasoningLogBox ---
class ReasoningLogBox extends StatelessWidget {
  final String log;
  const ReasoningLogBox({super.key, required this.log});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF1A1A1A), borderRadius: BorderRadius.circular(4)),
      child: Text(
        log,
        style: GoogleFonts.jetBrainsMono(fontSize: 10, color: const Color(0xFF00FF41), height: 1.5),
      ),
    );
  }
}

// --- 8. ExpertiseHexBadge ---
class ExpertiseHexBadge extends StatelessWidget {
  final String label;
  final double score;
  const ExpertiseHexBadge({super.key, required this.label, required this.score});

  @override
  Widget build(BuildContext context) {
    final color = score >= 75 ? const Color(0xFF6366F1) : Colors.black26;
    return Column(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withOpacity(0.05),
            border: Border.all(color: color.withOpacity(0.2)),
            shape: BoxShape.circle, // Simplified from Hex for now
          ),
          child: Center(child: Text('${score.toInt()}', style: GoogleFonts.jetBrainsMono(fontSize: 12, fontWeight: FontWeight.w900, color: color))),
        ),
        const SizedBox(height: 8),
        Text(label.toUpperCase(), style: GoogleFonts.inter(fontSize: 7, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 1)),
      ],
    );
  }
}

// --- 9. TechnicalAdvisorSheet ---
class TechnicalAdvisorSheet extends StatelessWidget {
  final String tips;
  const TechnicalAdvisorSheet({super.key, required this.tips});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.lightbulb, color: Color(0xFF6366F1), size: 18),
              const SizedBox(width: 12),
              Text('ARCHITECTURAL ADVICE', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 2)),
            ],
          ),
          const SizedBox(height: 20),
          Text(tips, style: GoogleFonts.inter(fontSize: 14, color: Colors.white70, height: 1.6)),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            ),
            child: Text('DISMISS NODE ADVICE', style: GoogleFonts.inter(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}

// --- 10. AuditTimelineSteps ---
class AuditTimelineSteps extends StatelessWidget {
  final String status;
  const AuditTimelineSteps({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final steps = ['QUEUED', 'INFERENCE', 'JUDGING', 'FINALIZED'];
    final currentIdx = status == 'completed' ? 3 : status == 'processing' ? 2 : 1;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(steps.length, (i) {
        final isActive = i <= currentIdx;
        return Expanded(
          child: Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive ? const Color(0xFF6366F1) : Colors.black.withOpacity(0.05),
                ),
              ),
              if (i < steps.length - 1)
                Expanded(child: Container(height: 1, color: isActive ? const Color(0xFF6366F1) : Colors.black.withOpacity(0.05))),
            ],
          ),
        );
      }),
    );
  }
}

// --- 11. CognitivePiePlot ---
class CognitivePiePlot extends StatelessWidget {
  final Map<String, double> scores;
  const CognitivePiePlot({super.key, required this.scores});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 150,
      height: 150,
      child: CustomPaint(
        painter: PiePainter(scores),
      ),
    );
  }
}

class PiePainter extends CustomPainter {
  final Map<String, double> scores;
  PiePainter(this.scores);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);
    
    double startAngle = -math.pi / 2;
    final total = scores.values.fold(0.0, (a, b) => a + (b > 0 ? b : 1.0)); 
    
    final colors = [const Color(0xFF6366F1), const Color(0xFF10B981), Colors.amber, const Color(0xFFFF4500)];
    int i = 0;
    
    scores.forEach((key, value) {
      final sweepAngle = (value / total) * 2 * math.pi;
      final paint = Paint()..color = colors[i % colors.length]..style = PaintingStyle.stroke..strokeWidth = 20;
      canvas.drawArc(rect, startAngle, sweepAngle, false, paint);
      startAngle += sweepAngle;
      i++;
    });
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// --- 12. BiasDetectionHeatmap ---
class BiasDetectionHeatmap extends StatelessWidget {
  final List<double> values;
  const BiasDetectionHeatmap({super.key, required this.values});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 5, mainAxisSpacing: 2, crossAxisSpacing: 2),
      itemCount: 20,
      itemBuilder: (context, i) {
        final val = i < values.length ? values[i] : 0.8;
        final color = val > 0.7 ? const Color(0xFF10B981) : val > 0.4 ? Colors.amber : const Color(0xFFFF4500);
        return Container(decoration: BoxDecoration(color: color.withOpacity(0.3), border: Border.all(color: color.withOpacity(0.1))));
      },
    );
  }
}

// --- 13. ScorePillBadge ---
class ScorePillBadge extends StatelessWidget {
  final double score;
  const ScorePillBadge({super.key, required this.score});

  @override
  Widget build(BuildContext context) {
    final color = score >= 75 ? const Color(0xFF6366F1) : score >= 50 ? Colors.amber : const Color(0xFFFF4500);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(100), border: Border.all(color: color.withOpacity(0.2))),
      child: Text('${score.toInt()}', style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
    );
  }
}

// --- 14. CognitiveThinkingOverlay ---
class CognitiveThinkingOverlay extends StatelessWidget {
  const CognitiveThinkingOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white.withOpacity(0.9),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: Color(0xFF1A1A1A), strokeWidth: 1),
            const SizedBox(height: 24),
            Text('DECRYPTING COGNITIVE TRACE...', style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black45)),
          ],
        ),
      ),
    );
  }
}

// --- 15. LogicBranchTree ---
class LogicBranchTree extends StatelessWidget {
  final List<String> steps;
  const LogicBranchTree({super.key, required this.steps});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: steps.map((s) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(LucideIcons.gitBranch, size: 12, color: Colors.black12),
            const SizedBox(width: 12),
            Expanded(child: Text(s, style: GoogleFonts.inter(fontSize: 11, color: Colors.black87, height: 1.4))),
          ],
        ),
      )).toList(),
    );
  }
}

// --- 16. ArithmeticExpressionCard ---
class ArithmeticExpressionCard extends StatelessWidget {
  final String expression;
  final bool isCorrect;
  const ArithmeticExpressionCard({super.key, required this.expression, required this.isCorrect});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFFF8F8F8), borderRadius: BorderRadius.circular(4)),
      child: Row(
        children: [
          Icon(isCorrect ? LucideIcons.check : LucideIcons.x, size: 14, color: isCorrect ? const Color(0xFF10B981) : const Color(0xFFFF4500)),
          const SizedBox(width: 12),
          Text(expression, style: GoogleFonts.jetBrainsMono(fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

// --- 17. ForensicRadarChart (Polished) ---
class ForensicRadarChart extends StatelessWidget {
  final Map<String, double> scores;
  const ForensicRadarChart({super.key, required this.scores});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,
      height: 200,
      child: CustomPaint(
        painter: ForensicRadarPainter(scores),
      ),
    );
  }
}

class ForensicRadarPainter extends CustomPainter {
  final Map<String, double> scores;
  ForensicRadarPainter(this.scores);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final keys = scores.keys.toList();
    final angleStep = (2 * math.pi) / keys.length;

    final paint = Paint()..color = Colors.black.withOpacity(0.05)..style = PaintingStyle.stroke..strokeWidth = 0.5;
    for (var i = 1; i <= 5; i++) {
        canvas.drawCircle(center, radius * (i / 5), paint);
    }

    final points = <Offset>[];
    for (var i = 0; i < keys.length; i++) {
      final angle = i * angleStep - math.pi / 2;
      final val = scores[keys[i]] ?? 0;
      final pRadius = radius * (val / 100);
      points.add(Offset(center.dx + pRadius * math.cos(angle), center.dy + pRadius * math.sin(angle)));
      canvas.drawLine(center, Offset(center.dx + radius * math.cos(angle), center.dy + radius * math.sin(angle)), paint);
    }

    if(points.isNotEmpty) {
      final path = Path()..moveTo(points[0].dx, points[0].dy);
      for (var i = 1; i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }
      path.close();
      canvas.drawPath(path, Paint()..color = const Color(0xFF6366F1).withOpacity(0.2)..style = PaintingStyle.fill);
      canvas.drawPath(path, Paint()..color = const Color(0xFF6366F1)..style = PaintingStyle.stroke..strokeWidth = 2);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// --- 18. AuditActionFab ---
class AuditActionFab extends StatelessWidget {
  final VoidCallback onRefresh;
  const AuditActionFab({super.key, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: onRefresh,
      backgroundColor: const Color(0xFF1A1A1A),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
      child: const Icon(LucideIcons.refreshCcw, size: 18, color: Colors.white),
    );
  }
}

// --- 19. DetailedDimensionModal ---
class DetailedDimensionModal extends StatelessWidget {
  final String title;
  final String reason;
  const DetailedDimensionModal({super.key, required this.title, required this.reason});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
           Text(title.toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1), letterSpacing: 2)),
           const SizedBox(height: 24),
           Text(reason, style: GoogleFonts.inter(fontSize: 16, height: 1.6, color: Colors.black87)),
           const SizedBox(height: 40),
           ElevatedButton(
             onPressed: () => Navigator.pop(context),
             style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A1A1A), minimumSize: const Size(double.infinity, 50), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4))),
             child: const Text('CLOSE TRACE', style: TextStyle(color: Colors.white)),
           ),
        ],
      ),
    );
  }
}

// --- 20. MetricsRibbon ---
class MetricsRibbon extends StatelessWidget {
  final Map<String, String> metrics;
  const MetricsRibbon({super.key, required this.metrics});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: metrics.entries.map((e) => Container(
          margin: const EdgeInsets.only(right: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(e.key.toUpperCase(), style: GoogleFonts.inter(fontSize: 7, fontWeight: FontWeight.w900, color: Colors.black26)),
              Text(e.value, style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.black)),
            ],
          ),
        )).toList(),
      ),
    );
  }
}
