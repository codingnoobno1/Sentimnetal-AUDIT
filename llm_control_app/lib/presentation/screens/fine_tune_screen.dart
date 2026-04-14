import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:llm_control_app/logic/fine_tune/fine_tune_bloc.dart';
import 'package:llm_control_app/core/theme.dart';
import 'package:llm_control_app/data/services/voice_service.dart';
import 'package:llm_control_app/logic/utils/voice_command_processor.dart';

class FineTuneScreen extends StatefulWidget {
  const FineTuneScreen({super.key});

  @override
  State<FineTuneScreen> createState() => _FineTuneScreenState();
}

class _FineTuneScreenState extends State<FineTuneScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedDataset = 'dataset_v1_curated';
  double _learningRate = 0.0001;
  int _epochs = 3;
  double _dropout = 0.1;
  bool _isClawOpen = false;
  final VoiceService _voiceService = VoiceService();
  final TextEditingController _notesController = TextEditingController();
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
  }

  void _submitJob() {
    context.read<FineTuneBloc>().add(SubmitFineTune(
      datasetId: _selectedDataset,
      params: {
        'learning_rate': _learningRate,
        'epochs': _epochs,
        'dropout': _dropout,
      },
    ));
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<FineTuneBloc, FineTuneState>(
      listener: (context, state) {
        if (state is FineTuneSuccess) {
          setState(() => _isClawOpen = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Job submitted successfully: ${state.jobId}'),
              backgroundColor: Colors.green,
            ),
          );
        }
      },
      builder: (context, state) {
        return Stack(
          children: [
            _buildMainContent(),
            _buildClawOverlay(state is FineTuneSubmitting),
            _buildClawPanel(state is FineTuneSubmitting),
          ],
        );
      },
    );
  }

  Widget _buildMainContent() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppTheme.primaryBlue.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: Icon(
              LucideIcons.settings2,
              size: 64,
              color: AppTheme.primaryBlue.withOpacity(0.5),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Fine-Tuning Engine',
            style: AppTheme.lightTheme.textTheme.displayLarge?.copyWith(fontSize: 24),
          ),
          const SizedBox(height: 12),
          const Text(
            'Open the configuration claw to start a new training job.',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 40),
          ElevatedButton.icon(
            onPressed: () => setState(() => _isClawOpen = true),
            icon: const Icon(LucideIcons.chevronsLeft, size: 20),
            label: const Text('OPEN CONFIGURATION CLAW'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClawOverlay(bool isSubmitting) {
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 300),
      opacity: _isClawOpen ? 1.0 : 0.0,
      child: Visibility(
        visible: _isClawOpen,
        child: GestureDetector(
          onTap: isSubmitting ? null : () => setState(() => _isClawOpen = false),
          child: Container(
            color: Colors.black.withOpacity(0.3),
          ),
        ),
      ),
    );
  }

  Widget _buildClawPanel(bool isSubmitting) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double clawWidth = screenWidth < 500 ? screenWidth * 0.9 : 450;

    return AnimatedPositioned(
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutQuart,
      right: _isClawOpen ? 0 : -clawWidth,
      top: 0,
      bottom: 0,
      child: Container(
        width: clawWidth,
        decoration: const BoxDecoration(
          color: AppTheme.surfaceWhite,
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 20,
              offset: Offset(-5, 0),
            ),
          ],
        ),
        child: SingleChildScrollView(child: _buildFormCard(isSubmitting)),
      ),
    );
  }

  Widget _buildFormCard(bool isSubmitting) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Configure Fine-Tuning Job',
                style: AppTheme.lightTheme.textTheme.displayLarge?.copyWith(
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 32),
              _buildDropdownField('Dataset Selection', _selectedDataset, [
                'dataset_v1_curated',
                'customer_support_logs',
                'technical_docs_raw',
              ]),
              const SizedBox(height: 24),
              _buildSliderField(
                'Learning Rate',
                _learningRate,
                0.00001,
                0.001,
                (val) => setState(() => _learningRate = val),
              ),
              const SizedBox(height: 24),
              _buildIntField(
                'Epochs',
                _epochs,
                1,
                10,
                (val) => setState(() => _epochs = val.toInt()),
              ),
              const SizedBox(height: 24),
              _buildSliderField(
                'Dropout Rate',
                _dropout,
                0.0,
                0.5,
                (val) => setState(() => _dropout = val),
              ),
              const SizedBox(height: 24),
              _buildVoiceTextField(
                'Training Session Notes',
                'Describe the objective of this fine-tuning run...',
                (text) => setState(() => _notesController.text = text),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () {
                          context.read<FineTuneBloc>().add(SubmitFineTune(
                            datasetId: _selectedDataset,
                            params: {
                              'learning_rate': _learningRate,
                              'epochs': _epochs,
                              'dropout': _dropout,
                            },
                          ));
                        },
                  child: isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Start Training Job'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdownField(String label, String value, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTheme.lightTheme.textTheme.bodySmall),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          decoration: InputDecoration(
            filled: true,
            fillColor: AppTheme.backgroundLight,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide.none,
            ),
          ),
          items: items
              .map((item) => DropdownMenuItem(value: item, child: Text(item)))
              .toList(),
          onChanged: (val) => setState(() => _selectedDataset = val!),
        ),
      ],
    );
  }

  Widget _buildSliderField(String label, double value, double min, double max,
      Function(double) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTheme.lightTheme.textTheme.bodySmall),
            Text(
              value.toStringAsFixed(5),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildIntField(String label, int value, double min, double max,
      Function(double) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTheme.lightTheme.textTheme.bodySmall),
            Text(
              value.toString(),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        Slider(
          value: value.toDouble(),
          min: min,
          max: max,
          divisions: (max - min).toInt(),
          onChanged: onChanged,
        ),
      ],
    );
  }
  Widget _buildVoiceTextField(String label, String hint, Function(String) onResult) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTheme.lightTheme.textTheme.bodySmall),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _notesController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: hint,
                  hintStyle: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                  filled: true,
                  fillColor: AppTheme.backgroundLight,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: BoxDecoration(
                color: _isListening ? Colors.red.withOpacity(0.1) : AppTheme.backgroundLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: IconButton(
                icon: Icon(
                  LucideIcons.mic,
                  color: _isListening ? Colors.red : AppTheme.textSecondary,
                  size: 20,
                ),
                onPressed: () async {
                  if (_isListening) {
                    await _voiceService.stopListening();
                    setState(() => _isListening = false);
                  } else {
                    final started = await _voiceService.startListening((text) {
                      setState(() {
                        _notesController.text = text;
                      });
                      
                      // Process Voice Commands
                      final intent = VoiceCommandProcessor.detectIntent(text);
                      switch (intent) {
                        case VoiceIntent.openClaw:
                          setState(() => _isClawOpen = true);
                          _voiceService.speak("Opening configuration claw.");
                          _stopListeningLocally();
                          break;
                        case VoiceIntent.closeClaw:
                          setState(() => _isClawOpen = false);
                          _voiceService.speak("Closing configuration claw.");
                          _stopListeningLocally();
                          break;
                        case VoiceIntent.startTraining:
                          if (_isClawOpen) {
                            _submitJob();
                            _stopListeningLocally();
                          } else {
                            _voiceService.speak("Please open the claw first to verify settings.");
                          }
                          break;
                        default:
                          // Fallback to chat or just keep text in input
                          break;
                      }
                    });
                    if (started) {
                      setState(() => _isListening = true);
                    }
                  }
                },
              ),
            ),
          ],
        ),
      ],
    );
  }
}
