import type { WeeklyReportRes } from '@/shared/api/weekly_reports';
import type {
  WeeklyReport,
  WeeklyReportConceptStatus,
  WeeklyReportRecommendationType,
} from '@/shared/types/stology';

export interface WeeklyReportQueryData {
  report: WeeklyReport;
  totalWeeks: number;
}

const recommendationTypeByBadge: Record<string, WeeklyReportRecommendationType> = {
  놓친: 'missed',
  놓침: 'missed',
  심화: 'deepening',
  연결: 'related',
};

function mapCoreConceptStatus(state: string): WeeklyReportConceptStatus {
  return state.includes('신규') ? 'newly_activated' : 'reinforced';
}

function mapRecommendationType(badge: string): WeeklyReportRecommendationType {
  return recommendationTypeByBadge[badge.trim()] ?? 'related';
}

export function mapWeeklyReport(response: WeeklyReportRes): WeeklyReportQueryData {
  const coreConcepts = (response.weeklyCoreNodeList ?? [])
    .filter(({ state }) => !state.includes('비활성'))
    .map((node, index) => ({
      id: `${response.reportId}-core-${index}`,
      materialCount: node.materialCount,
      name: node.nodeName,
      status: mapCoreConceptStatus(node.state),
    }));

  const recommendations = (response.recommendedNodeList ?? []).map((node, index) => ({
    id: `${response.reportId}-recommendation-${index}`,
    name: node.nodeName,
    reason: node.reason,
    type: mapRecommendationType(node.badge),
  }));

  const teamActivities = (response.memberActivityStatisticsList ?? []).map((member, index) => ({
    comment: member.aiFeedback,
    memberId: `${response.reportId}-member-${index}`,
    memberName: member.memberName,
    questionCount: member.questionCount,
    uploadCount: member.materialUploadCount,
  }));

  return {
    report: {
      aiReview: response.aiReviewContent ?? '',
      coreConcepts,
      newlyActivatedCount: response.newActiveNodeCount,
      recommendations,
      reinforcedCount: response.reinforcedNodeCount,
      teamActivities,
      week: response.currentWeek,
    },
    totalWeeks: response.totalWeeks,
  };
}
