from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsStudent
from accounts.models import StudentProfile
from .models import CampusDrive, Application, Announcement
from .serializers import CampusDriveSerializer, ApplicationSerializer, AnnouncementSerializer


class StudentJobFeedView(APIView):
    """Active campus drives list for students."""
    permission_classes = [IsStudent]

    def get(self, request):
        drives = CampusDrive.objects.filter(is_active=True).select_related('company').all()
        data = []
        try:
            student_profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            student_profile = None

        for drive in drives:
            drive_data = CampusDriveSerializer(drive, context={'request': request}).data
            if student_profile:
                eligible, reasons = drive.is_student_eligible(student_profile)
                drive_data['is_eligible'] = eligible
                drive_data['ineligibility_reasons'] = reasons
                # Check if already applied
                drive_data['has_applied'] = Application.objects.filter(
                    student=request.user, drive=drive
                ).exists()
            else:
                drive_data['is_eligible'] = False
                drive_data['ineligibility_reasons'] = ['Profile not set up']
                drive_data['has_applied'] = False
            data.append(drive_data)
        return Response(data)


class StudentApplyView(APIView):
    """Apply to a campus drive with eligibility check."""
    permission_classes = [IsStudent]

    def post(self, request, drive_id):
        try:
            drive = CampusDrive.objects.get(pk=drive_id, is_active=True)
        except CampusDrive.DoesNotExist:
            return Response({'error': 'Drive not found or no longer active.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if already applied
        if Application.objects.filter(student=request.user, drive=drive).exists():
            return Response({'error': 'You have already applied to this drive.'}, status=status.HTTP_409_CONFLICT)

        try:
            student_profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Please complete your student profile first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Eligibility check
        eligible, reasons = drive.is_student_eligible(student_profile)
        if not eligible:
            return Response({
                'error': 'You do not meet the eligibility criteria.',
                'reasons': reasons
            }, status=status.HTTP_403_FORBIDDEN)

        application = Application.objects.create(student=request.user, drive=drive)
        return Response(
            ApplicationSerializer(application, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class StudentApplicationsView(APIView):
    """Get all applications for the logged-in student."""
    permission_classes = [IsStudent]

    def get(self, request):
        applications = Application.objects.filter(
            student=request.user
        ).select_related('drive', 'drive__company').order_by('-applied_at')
        return Response(ApplicationSerializer(applications, many=True, context={'request': request}).data)


class StudentAnnouncementsView(APIView):
    """Get active announcements for students."""
    permission_classes = [IsStudent]

    def get(self, request):
        announcements = Announcement.objects.filter(
            is_active=True
        ).select_related('created_by', 'drive').all()
        return Response(AnnouncementSerializer(announcements, many=True).data)


class StudentEligibilityCheckView(APIView):
    """Check eligibility for a specific drive."""
    permission_classes = [IsStudent]

    def get(self, request, drive_id):
        try:
            drive = CampusDrive.objects.get(pk=drive_id)
        except CampusDrive.DoesNotExist:
            return Response({'error': 'Drive not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            student_profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        eligible, reasons = drive.is_student_eligible(student_profile)
        return Response({
            'drive_id': drive_id,
            'is_eligible': eligible,
            'ineligibility_reasons': reasons
        })
