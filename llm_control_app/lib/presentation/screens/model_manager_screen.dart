import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../logic/model_manager/model_manager_bloc.dart';
import '../../data/models/hf_model.dart';
import 'model_details_screen.dart';

class ModelManagerScreen extends StatefulWidget {
  const ModelManagerScreen({super.key});

  @override
  State<ModelManagerScreen> createState() => _ModelManagerScreenState();
}

class _ModelManagerScreenState extends State<ModelManagerScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<ModelManagerBloc>().add(FetchLocalModelsRequested());
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ModelManagerBloc, ModelManagerState>(
      listener: (context, state) {
        if (state.error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.error!), backgroundColor: Colors.red),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          backgroundColor: const Color(0xFFFAFAFA),
          body: Column(
            children: [
              _buildHeader(state),
              _buildStorageSentinel(state),
              _buildDiscoveryTabs(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildLocalSection(state),
                    _buildCloudSection(state),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(ModelManagerState state) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 20),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('MODEL ORCHESTRATOR', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1), letterSpacing: 3)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Storage Command', style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w900, color: const Color(0xFF1A1A1A), letterSpacing: -1)),
              _buildStatusDot(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusDot() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircleAvatar(radius: 3, backgroundColor: Color(0xFF10B981)),
          const SizedBox(width: 6),
          Text('NODE ONLINE', style: GoogleFonts.jetBrainsMono(fontSize: 8, fontWeight: FontWeight.w800, color: const Color(0xFF10B981))),
        ],
      ),
    );
  }

  Widget _buildStorageSentinel(ModelManagerState state) {
    final stats = state.storageStats;
    if (stats == null) return const SizedBox.shrink();

    final isLow = stats.freeGb < 10.0;

    return Container(
      margin: const EdgeInsets.fromLTRB(24, 0, 24, 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('LAPTOP DISK SENTINEL', style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white70, letterSpacing: 1.5)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(LucideIcons.hardDrive, size: 14, color: Color(0xFF6366F1)),
                      const SizedBox(width: 8),
                      Text('Drive ${stats.drive}', style: GoogleFonts.jetBrainsMono(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                    ],
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('${stats.freeGb.toInt()} GB FREE', style: GoogleFonts.jetBrainsMono(fontSize: 14, fontWeight: FontWeight.w900, color: isLow ? Colors.red : const Color(0xFF6366F1))),
                  if (isLow) Text('CRITICAL SPACE', style: GoogleFonts.inter(fontSize: 7, fontWeight: FontWeight.w900, color: Colors.red)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: stats.percentUsed / 100,
              backgroundColor: Colors.white.withOpacity(0.05),
              color: isLow ? Colors.red : const Color(0xFF6366F1),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('0 GB', style: GoogleFonts.jetBrainsMono(fontSize: 8, color: Colors.white30)),
              Text('${stats.totalGb.toInt()} GB TOTAL CAPACITY', style: GoogleFonts.jetBrainsMono(fontSize: 8, color: Colors.white30, fontWeight: FontWeight.w700)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDiscoveryTabs() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(color: Colors.black.withOpacity(0.03), borderRadius: BorderRadius.circular(8)),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(6), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)]),
        labelColor: Colors.black,
        unselectedLabelColor: Colors.black38,
        labelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.5),
        tabs: const [
          Tab(text: 'LOCAL STORAGE'),
          Tab(text: 'HF DISCOVERY'),
        ],
      ),
    );
  }

  Widget _buildLocalSection(ModelManagerState state) {
    if (state.activeDownloads.isEmpty && state.localModels.isEmpty) {
      return const Center(child: Text('No models detected in node.'));
    }

    return CustomScrollView(
      slivers: [
        _buildActiveDownloads(state),
        _buildLocalModelList(state),
      ],
    );
  }

  Widget _buildCloudSection(ModelManagerState state) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(24),
          child: Container(
            decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.black.withOpacity(0.05))),
            child: TextField(
               controller: _searchController,
               decoration: InputDecoration(
                 hintText: 'Search Hugging Face models...',
                 hintStyle: GoogleFonts.inter(fontSize: 12),
                 prefixIcon: const Icon(LucideIcons.search, size: 16),
                 border: InputBorder.none,
                 contentPadding: const EdgeInsets.symmetric(vertical: 15),
               ),
               onSubmitted: (val) => context.read<ModelManagerBloc>().add(SearchModelsRequested(val)),
            ),
          ),
        ),
        Expanded(
          child: state.status == ModelManagerStatus.loading 
              ? const Center(child: CircularProgressIndicator()) 
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: state.searchResults.length,
                  itemBuilder: (context, index) => _buildHfResultCard(state.searchResults[index], state),
                ),
        ),
      ],
    );
  }

  Widget _buildActiveDownloads(ModelManagerState state) {
    if (state.activeDownloads.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
        child: Column(
          children: state.activeDownloads.values.map((model) => _buildDownloadCard(model)).toList(),
        ),
      ),
    );
  }

  Widget _buildDownloadCard(dynamic model) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFFF4500).withOpacity(0.1))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(model.id, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w800))),
              Text('${model.progress.toInt()}%', style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.w900, color: const Color(0xFFFF4500))),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(value: model.progress / 100, backgroundColor: const Color(0xFFFF4500).withOpacity(0.05), color: const Color(0xFFFF4500), minHeight: 2),
        ],
      ),
    );
  }

  Widget _buildLocalModelList(ModelManagerState state) {
    return SliverPadding(
      padding: const EdgeInsets.all(24),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final modelId = state.localModels[index];
            return InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ModelDetailsScreen(modelId: modelId),
                  ),
                );
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.black.withOpacity(0.03))),
                child: Row(
                  children: [
                    const Icon(LucideIcons.package, size: 18, color: Color(0xFF6366F1)),
                    const SizedBox(width: 16),
                    Expanded(child: Text(modelId.split('/').last, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700))),
                    IconButton(icon: const Icon(LucideIcons.trash2, size: 16, color: Colors.black12), onPressed: () => _confirmDelete(context, modelId)),
                  ],
                ),
              ),
            );
          },
          childCount: state.localModels.length,
        ),
      ),
    );
  }

  Widget _buildHfResultCard(HfModel model, ModelManagerState state) {
    bool isDownloading = state.activeDownloads.containsKey(model.id);
    bool isLocal = state.localModels.contains(model.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.black.withOpacity(0.05))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(model.id, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w800))),
              if (isLocal) const Icon(LucideIcons.checkCircle, size: 16, color: Color(0xFF10B981))
              else if (isDownloading) const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
              else IconButton(
                icon: const Icon(LucideIcons.plusCircle, size: 20, color: Color(0xFF6366F1)),
                onPressed: () => _requestDownload(model),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildSmallBadge(LucideIcons.download, '${model.downloads}'),
              const SizedBox(width: 12),
              _buildSmallBadge(LucideIcons.heart, '${model.likes}'),
              if (model.pipelineTag != null) ...[
                const SizedBox(width: 12),
                _buildSmallBadge(LucideIcons.tag, model.pipelineTag!),
              ]
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSmallBadge(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 10, color: Colors.black26),
        const SizedBox(width: 4),
        Text(text, style: GoogleFonts.jetBrainsMono(fontSize: 9, fontWeight: FontWeight.w600, color: Colors.black45)),
      ],
    );
  }

  void _requestDownload(HfModel model) {
    final stats = context.read<ModelManagerBloc>().state.storageStats;
    if (stats != null && stats.freeGb < 5) {
       _showLowSpaceWarning(model.id);
    } else {
       context.read<ModelManagerBloc>().add(DownloadModelRequested(model.id));
       _tabController.animateTo(0);
    }
  }

  void _showLowSpaceWarning(String modelId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('LOW DISK SPACE WARNING'),
        content: const Text('Your laptop storage is critically low (< 5GB). Starting this download may cause an error.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          TextButton(
            onPressed: () {
              context.read<ModelManagerBloc>().add(DownloadModelRequested(modelId));
              Navigator.pop(context);
              _tabController.animateTo(0);
            },
            child: const Text('DOWNLOAD ANYWAY', style: TextStyle(color: Colors.orange)),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, String modelId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('PURGE STORAGE?'),
        content: Text('Remove $modelId from your PC?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          TextButton(
            onPressed: () {
              this.context.read<ModelManagerBloc>().add(DeleteModelRequested(modelId));
              Navigator.pop(context);
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }
}
