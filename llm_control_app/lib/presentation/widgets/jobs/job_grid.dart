import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_datagrid/datagrid.dart';
import 'package:intl/intl.dart';
import '../../../data/models/job_model.dart';
import 'status_badge.dart';
import '../../../core/theme.dart';

class JobGrid extends StatelessWidget {
  final List<JobModel> jobs;

  const JobGrid({super.key, required this.jobs});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: 400,
          child: SfDataGrid(
            source: JobDataSource(jobs: jobs),
            columnWidthMode: ColumnWidthMode.fill,
            headerGridLinesVisibility: GridLinesVisibility.none,
            gridLinesVisibility: GridLinesVisibility.none,
            columns: <GridColumn>[
              GridColumn(
                columnName: 'id',
                label: _buildHeaderCell('JOB ID'),
              ),
              GridColumn(
                columnName: 'model',
                label: _buildHeaderCell('MODEL'),
              ),
              GridColumn(
                columnName: 'dataset',
                label: _buildHeaderCell('DATASET'),
              ),
              GridColumn(
                columnName: 'status',
                label: _buildHeaderCell('STATUS'),
              ),
              GridColumn(
                columnName: 'date',
                label: _buildHeaderCell('CREATED'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCell(String text) {
    return Container(
      padding: const EdgeInsets.all(16),
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
          fontWeight: FontWeight.bold,
          color: AppTheme.textSecondary,
        ),
      ),
    );
  }
}

class JobDataSource extends DataGridSource {
  JobDataSource({required List<JobModel> jobs}) {
    _jobData = jobs
        .map<DataGridRow>((j) => DataGridRow(cells: [
              DataGridCell<String>(columnName: 'id', value: j.id),
              DataGridCell<String>(columnName: 'model', value: j.modelName),
              DataGridCell<String>(columnName: 'dataset', value: j.datasetId),
              DataGridCell<JobStatus>(columnName: 'status', value: j.status),
              DataGridCell<DateTime>(columnName: 'date', value: j.createdAt),
            ]))
        .toList();
  }

  List<DataGridRow> _jobData = [];

  @override
  List<DataGridRow> get rows => _jobData;

  @override
  DataGridRowAdapter buildRow(DataGridRow row) {
    return DataGridRowAdapter(
        cells: row.getCells().map<Widget>((e) {
      if (e.columnName == 'status') {
        return Container(
          padding: const EdgeInsets.all(16),
          alignment: Alignment.centerLeft,
          child: StatusBadge(status: e.value as JobStatus),
        );
      }
      
      String value = e.value is DateTime 
          ? DateFormat('MMM dd, HH:mm').format(e.value as DateTime)
          : e.value.toString();

      return Container(
        padding: const EdgeInsets.all(16),
        alignment: Alignment.centerLeft,
        child: Text(
          value,
          style: const TextStyle(fontSize: 14),
        ),
      );
    }).toList());
  }
}
