import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../logic/inference/inference_bloc.dart';
import 'model_analysis_screen.dart';
import '../../data/services/voice_service.dart';

class ModelDetailsScreen extends StatefulWidget {
  final String modelId;

  const ModelDetailsScreen({super.key, required this.modelId});

  @override
  State<ModelDetailsScreen> createState() => _ModelDetailsScreenState();
}

class _ModelDetailsScreenState extends State<ModelDetailsScreen> {
  final TextEditingController _promptController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final VoiceService _voiceService = VoiceService();
  bool _isListening = false;

  @override
  void dispose() {
    _promptController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('MODEL INTERACTION', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1), letterSpacing: 2)),
            Text(widget.modelId.split('/').last, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.eraser, color: Colors.black26, size: 20),
            onPressed: () => context.read<InferenceBloc>().add(ClearHistoryRequested()),
          ),
        ],
      ),
      body: BlocConsumer<InferenceBloc, InferenceState>(
        listener: (context, state) {
          if (state.status == InferenceStatus.success || state.status == InferenceStatus.loading) {
            _scrollToBottom();
          }
          if (state.error != null) {
             ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.error!)));
          }
        },
        builder: (context, state) {
          return Column(
            children: [
              Expanded(
                child: state.history.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(24),
                        itemCount: state.history.length,
                        itemBuilder: (context, index) => _buildMessageBubble(state.history[index]),
                      ),
              ),
              if (state.status == InferenceStatus.loading) _buildThinkingIndicator(),
              if (state.history.isNotEmpty && !state.history.last.isUser && state.status != InferenceStatus.loading) 
                _buildAnalysisTrigger(state.history.last.text, state.history[state.history.length - 2].text, state.history.last.auditId),
              _buildInputArea(state),
            ],
          );
        },
      ),
    );
  }

  Widget _buildAnalysisTrigger(String response, String prompt, String? auditId) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      color: Colors.white,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ModelAnalysisScreen(
                modelId: widget.modelId,
                input: prompt,
                output: response,
                auditId: auditId,
              ),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFF1A1A1A),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.barChart2, size: 14, color: Colors.white),
              const SizedBox(width: 8),
              Text('ANALYZE TRACE', style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1.5)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
     return Center(
       child: Column(
         mainAxisAlignment: MainAxisAlignment.center,
         children: [
           const Icon(LucideIcons.messageSquare, size: 48, color: Color(0xFFEEEEEE)),
           const SizedBox(height: 16),
           Text('READY FOR PROMPT INJECTION', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black26, letterSpacing: 1.5)),
           const SizedBox(height: 8),
           Text('Enter a query below to talk to your local model.', style: GoogleFonts.inter(fontSize: 13, color: Colors.black38)),
         ],
       ),
     );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isUser = message.isUser;
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            children: [
              Icon(isUser ? LucideIcons.user : LucideIcons.cpu, size: 10, color: isUser ? Colors.black26 : const Color(0xFF6366F1)),
              const SizedBox(width: 6),
              Text(isUser ? 'YOU' : 'PROMETHEUS NODE', style: GoogleFonts.jetBrainsMono(fontSize: 8, fontWeight: FontWeight.w800, color: isUser ? Colors.black26 : const Color(0xFF6366F1))),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isUser ? const Color(0xFFF8F8F8) : const Color(0xFF6366F1).withOpacity(0.05),
              border: Border.all(color: isUser ? Colors.black.withOpacity(0.05) : const Color(0xFF6366F1).withOpacity(0.1)),
              borderRadius: BorderRadius.circular(4),
            ),
            child: SelectableText(
              message.text,
              style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF1A1A1A), height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThinkingIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        children: [
          const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF6366F1))),
          const SizedBox(width: 12),
          Text('NODE INFERENCE IN PROGRESS...', style: GoogleFonts.jetBrainsMono(fontSize: 9, fontWeight: FontWeight.w800, color: const Color(0xFF6366F1))),
        ],
      ),
    );
  }

  Widget _buildInputArea(InferenceState state) {
    final isLoading = state.status == InferenceStatus.loading;
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 40),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.black.withOpacity(0.05))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(color: const Color(0xFFF8F8F8), borderRadius: BorderRadius.circular(4)),
              child: TextField(
                controller: _promptController,
                enabled: !isLoading,
                maxLines: null,
                decoration: InputDecoration(
                  hintText: 'Inject prompt to model...',
                  hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.black26),
                  border: InputBorder.none,
                ),
                style: GoogleFonts.inter(fontSize: 14),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            decoration: BoxDecoration(
              color: _isListening ? Colors.red.withOpacity(0.1) : const Color(0xFFF8F8F8),
              borderRadius: BorderRadius.circular(4),
            ),
            child: IconButton(
              icon: Icon(
                _isListening ? LucideIcons.mic : LucideIcons.mic,
                color: _isListening ? Colors.red : Colors.black26,
                size: 20,
              ),
              onPressed: isLoading ? null : () async {
                if (_isListening) {
                  await _voiceService.stopListening();
                  setState(() => _isListening = false);
                } else {
                  final started = await _voiceService.startListening((text) {
                    setState(() {
                      _promptController.text = text;
                    });
                  });
                  if (started) {
                    setState(() => _isListening = true);
                  }
                }
              },
            ),
          ),
          const SizedBox(width: 12),
          IconButton(
            onPressed: isLoading ? null : _sendPrompt,
            icon: Icon(LucideIcons.send, color: isLoading ? Colors.black12 : const Color(0xFF6366F1)),
          ),
        ],
      ),
    );
  }

  void _sendPrompt() {
    final text = _promptController.text.trim();
    if (text.isNotEmpty) {
      context.read<InferenceBloc>().add(SendPromptRequested(modelId: widget.modelId, prompt: text));
      _promptController.clear();
    }
  }
}
