import type { WeeklyRecordNodeInfoRes, WeeklyRecordNodesRes } from '@/shared/api/weekly_records';
import type { WeeklyRecordConcept, WeeklyRecordMaterial } from '@/shared/types/stology';

function toDisplayDate(dateTime: string): string {
  return dateTime.split('T')[0] || dateTime;
}

export function mapWeeklyRecordConcepts(response: WeeklyRecordNodesRes): WeeklyRecordConcept[] {
  return response.nodes.map((node) => ({
    id: String(node.studyNodeId),
    materials: [],
    name: node.title,
    status: node.activeLevel > 1 ? 'reinforced' : 'newly_activated',
  }));
}

export function mapWeeklyRecordMaterials(
  response: WeeklyRecordNodeInfoRes,
): WeeklyRecordMaterial[] {
  return response.materials.map((material) => ({
    downloadUrl: material.presignedUrl,
    id: String(material.studyMaterialId),
    title: material.dataTitle,
    uploadedAt: toDisplayDate(material.createdAt),
    uploaderName: material.uploaderName,
  }));
}
