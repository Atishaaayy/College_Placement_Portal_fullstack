from django.db.models import Count, Avg, Max, Min, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import StudentProfile
from accounts.permissions import IsTPO
from .models import Application, CampusDrive, Company


class AnalyticsSummaryView(APIView):
    """Aggregated placement analytics dashboard data."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Total students
        total_students = StudentProfile.objects.count()

        # Placed students (SELECTED status)
        placed_student_ids = Application.objects.filter(
            status='SELECTED'
        ).values_list('student_id', flat=True).distinct()
        placed_count = len(set(placed_student_ids))
        unplaced_count = total_students - placed_count

        # Branch-wise placement
        branch_stats = []
        branch_choices = dict(StudentProfile.BRANCH_CHOICES)
        for branch_code, branch_name in branch_choices.items():
            branch_total = StudentProfile.objects.filter(branch=branch_code).count()
            branch_placed = StudentProfile.objects.filter(
                branch=branch_code,
                user__applications__status='SELECTED'
            ).distinct().count()
            branch_stats.append({
                'branch_code': branch_code,
                'branch_name': branch_name,
                'total': branch_total,
                'placed': branch_placed,
                'unplaced': branch_total - branch_placed,
                'placement_percentage': round((branch_placed / branch_total * 100), 1) if branch_total > 0 else 0
            })

        # Salary stats (CTC of drives with selected students)
        selected_drives = CampusDrive.objects.filter(
            applications__status='SELECTED'
        ).distinct()

        salary_stats = selected_drives.aggregate(
            highest_ctc=Max('ctc'),
            lowest_ctc=Min('ctc'),
            average_ctc=Avg('ctc')
        )

        # Top recruiters by hire count
        top_companies = Company.objects.annotate(
            total_hired=Count(
                'drives__applications',
                filter=Q(drives__applications__status='SELECTED')
            )
        ).filter(total_hired__gt=0).order_by('-total_hired')[:10]

        top_recruiters = [
            {
                'company_id': c.id,
                'company_name': c.name,
                'total_hired': c.total_hired
            }
            for c in top_companies
        ]

        # Active drives
        active_drives = CampusDrive.objects.filter(is_active=True).count()
        total_applications = Application.objects.count()

        return Response({
            'placement_summary': {
                'total_students': total_students,
                'placed_count': placed_count,
                'unplaced_count': unplaced_count,
                'placement_percentage': round((placed_count / total_students * 100), 1) if total_students > 0 else 0
            },
            'branch_breakdown': branch_stats,
            'salary_stats': {
                'highest_ctc': float(salary_stats['highest_ctc'] or 0),
                'lowest_ctc': float(salary_stats['lowest_ctc'] or 0),
                'average_ctc': round(float(salary_stats['average_ctc'] or 0), 2)
            },
            'top_recruiters': top_recruiters,
            'overview': {
                'active_drives': active_drives,
                'total_applications': total_applications,
                'total_companies': Company.objects.count()
            }
        })
