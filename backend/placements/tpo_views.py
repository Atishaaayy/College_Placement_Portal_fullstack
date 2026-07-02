import csv
from django.http import HttpResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.models import StudentProfile
from accounts.serializers import StudentProfileSerializer
from accounts.permissions import IsTPO
from .models import Company, CampusDrive, Application, Announcement
from .serializers import (
    CompanySerializer, CampusDriveSerializer, CampusDriveCreateSerializer,
    ApplicationSerializer, AnnouncementSerializer
)


class TPODrivesView(APIView):
    permission_classes = [IsTPO]

    def get(self, request):
        drives = CampusDrive.objects.select_related('company', 'posted_by').all()
        return Response(CampusDriveSerializer(drives, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = CampusDriveCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            drive = serializer.save()
            return Response(
                CampusDriveSerializer(drive, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TPODriveDetailView(APIView):
    permission_classes = [IsTPO]

    def get_object(self, pk):
        try:
            return CampusDrive.objects.select_related('company').get(pk=pk)
        except CampusDrive.DoesNotExist:
            return None

    def get(self, request, pk):
        drive = self.get_object(pk)
        if not drive:
            return Response({'error': 'Drive not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CampusDriveSerializer(drive, context={'request': request}).data)

    def patch(self, request, pk):
        drive = self.get_object(pk)
        if not drive:
            return Response({'error': 'Drive not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Handle company_name -> company FK
        data = request.data.copy()
        if 'company_name' in data:
            company_name = data.pop('company_name')
            if isinstance(company_name, list):
                company_name = company_name[0]
            company, _ = Company.objects.get_or_create(name=company_name)
            data['company'] = company.id
        
        serializer = CampusDriveSerializer(drive, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        drive = self.get_object(pk)
        if not drive:
            return Response({'error': 'Drive not found.'}, status=status.HTTP_404_NOT_FOUND)
        drive.delete()
        return Response({'message': 'Drive deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class TPOCompaniesView(APIView):
    permission_classes = [IsTPO]

    def get(self, request):
        companies = Company.objects.all()
        return Response(CompanySerializer(companies, context={'request': request}).data)

    def post(self, request):
        serializer = CompanySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Student Verification Queue
class StudentVerificationQueueView(APIView):
    permission_classes = [IsTPO]

    def get(self, request):
        status_filter = request.query_params.get('status', None)
        profiles = StudentProfile.objects.select_related('user').all()
        if status_filter:
            profiles = profiles.filter(verification_status=status_filter.upper())
        return Response(StudentProfileSerializer(profiles, many=True).data)


class StudentVerificationUpdateView(APIView):
    permission_classes = [IsTPO]

    def patch(self, request, profile_id):
        try:
            profile = StudentProfile.objects.get(pk=profile_id)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('verification_status')
        if new_status not in ['PENDING', 'VERIFIED']:
            return Response({'error': 'Invalid status. Use PENDING or VERIFIED.'}, status=status.HTTP_400_BAD_REQUEST)

        profile.verification_status = new_status
        profile.save()
        return Response({
            'message': f'Student verification status updated to {new_status}.',
            'profile': StudentProfileSerializer(profile).data
        })


# Drive Applications (for TPO)
class TPODriveApplicationsView(APIView):
    permission_classes = [IsTPO]

    def get(self, request, drive_id):
        try:
            drive = CampusDrive.objects.get(pk=drive_id)
        except CampusDrive.DoesNotExist:
            return Response({'error': 'Drive not found.'}, status=status.HTTP_404_NOT_FOUND)
        applications = drive.applications.select_related('student', 'drive__company').all()
        return Response(ApplicationSerializer(applications, many=True, context={'request': request}).data)


# CSV Export
class ExportDriveApplicantsCSV(APIView):
    permission_classes = [IsTPO]

    def get(self, request, drive_id):
        try:
            drive = CampusDrive.objects.select_related('company').get(pk=drive_id)
        except CampusDrive.DoesNotExist:
            return Response({'error': 'Drive not found.'}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{drive.company.name}_{drive.job_profile}_applicants.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Student Name', 'Email', 'Roll Number', 'Branch',
            'CGPA', 'Graduation Year', 'Active Backlogs',
            'Verification Status', 'Application Status', 'Applied At'
        ])

        applications = drive.applications.select_related(
            'student', 'student__student_profile'
        ).all()

        for app in applications:
            try:
                sp = app.student.student_profile
                writer.writerow([
                    app.student.full_name,
                    app.student.email,
                    sp.roll_number,
                    sp.get_branch_display(),
                    sp.cgpa,
                    sp.graduation_year,
                    sp.active_backlogs,
                    sp.verification_status,
                    app.status,
                    app.applied_at.strftime('%Y-%m-%d %H:%M')
                ])
            except Exception:
                writer.writerow([app.student.full_name, app.student.email, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', app.status, app.applied_at.strftime('%Y-%m-%d %H:%M')])

        return response


# Announcements
class AnnouncementsView(APIView):
    permission_classes = [IsTPO]

    def get(self, request):
        announcements = Announcement.objects.select_related('created_by', 'drive').all()
        return Response(AnnouncementSerializer(announcements, many=True).data)

    def post(self, request):
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnnouncementDetailView(APIView):
    permission_classes = [IsTPO]

    def patch(self, request, pk):
        try:
            announcement = Announcement.objects.get(pk=pk)
        except Announcement.DoesNotExist:
            return Response({'error': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AnnouncementSerializer(announcement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            announcement = Announcement.objects.get(pk=pk)
            announcement.delete()
            return Response({'message': 'Announcement deleted.'}, status=status.HTTP_204_NO_CONTENT)
        except Announcement.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
