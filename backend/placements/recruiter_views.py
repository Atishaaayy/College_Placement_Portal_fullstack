from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsRecruiter
from accounts.models import RecruiterProfile
from .models import CampusDrive, Application, Company
from .serializers import ApplicationSerializer, ApplicationStatusUpdateSerializer, CampusDriveSerializer, CompanySerializer


class RecruiterDrivesView(APIView):
    """Drives posted under recruiter's company."""
    permission_classes = [IsRecruiter]

    def get(self, request):
        try:
            profile = request.user.recruiter_profile
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            company = Company.objects.get(name__iexact=profile.company_name)
            drives = CampusDrive.objects.filter(company=company).select_related('company')
            return Response(CampusDriveSerializer(drives, many=True, context={'request': request}).data)
        except Company.DoesNotExist:
            return Response([])


class RecruiterApplicantsView(APIView):
    """All applicants for a specific drive belonging to recruiter's company."""
    permission_classes = [IsRecruiter]

    def get(self, request, drive_id):
        try:
            drive = CampusDrive.objects.get(pk=drive_id)
        except CampusDrive.DoesNotExist:
            return Response({'error': 'Drive not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify recruiter owns this drive's company
        try:
            profile = request.user.recruiter_profile
            if drive.company.name.lower() != profile.company_name.lower():
                return Response({'error': 'Unauthorized access to this drive.'}, status=status.HTTP_403_FORBIDDEN)
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        applications = drive.applications.select_related(
            'student', 'student__student_profile'
        ).all()
        return Response(ApplicationSerializer(applications, many=True, context={'request': request}).data)


class RecruiterUpdateApplicationStatusView(APIView):
    """Update application status — triggers student dashboard update."""
    permission_classes = [IsRecruiter]

    def patch(self, request, application_id):
        try:
            application = Application.objects.select_related('drive__company').get(pk=application_id)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify ownership
        try:
            profile = request.user.recruiter_profile
            if application.drive.company.name.lower() != profile.company_name.lower():
                return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': f'Application status updated to {application.status}.',
                'application': ApplicationSerializer(application, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
