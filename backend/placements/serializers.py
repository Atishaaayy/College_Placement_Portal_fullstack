from rest_framework import serializers
from .models import Company, CampusDrive, Application, Announcement
from accounts.serializers import StudentProfileSerializer, UserSerializer


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']


class CampusDriveSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    selection_steps_list = serializers.SerializerMethodField()
    total_applications = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = CampusDrive
        fields = '__all__'
        read_only_fields = ['posted_by', 'created_at', 'updated_at']

    def get_selection_steps_list(self, obj):
        return obj.get_selection_steps_list()

    def get_total_applications(self, obj):
        return obj.applications.count()

    def get_applications_count(self, obj):
        return obj.applications.count()


class CampusDriveCreateSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True)

    class Meta:
        model = CampusDrive
        fields = [
            'company_name', 'job_profile', 'job_description', 'selection_steps',
            'ctc', 'vacancies', 'visit_date', 'last_apply_date',
            'min_cgpa', 'allowed_branches', 'max_backlogs', 'min_graduation_year',
            'is_active'
        ]

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        company, _ = Company.objects.get_or_create(name=company_name)
        request = self.context.get('request')
        drive = CampusDrive.objects.create(
            company=company,
            posted_by=request.user if request else None,
            **validated_data
        )
        return drive


class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    drive_info = CampusDriveSerializer(source='drive', read_only=True)
    student_profile = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    # Flat drive fields for easy frontend consumption
    drive_company_name = serializers.CharField(source='drive.company.name', read_only=True)
    drive_job_profile = serializers.CharField(source='drive.job_profile', read_only=True)
    drive_ctc = serializers.DecimalField(source='drive.ctc', max_digits=10, decimal_places=2, read_only=True)
    drive_visit_date = serializers.DateField(source='drive.visit_date', read_only=True)
    # Flat roll number for recruiter screening
    student_roll_number = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['student', 'applied_at', 'updated_at']

    def get_student_profile(self, obj):
        try:
            return StudentProfileSerializer(obj.student.student_profile).data
        except Exception:
            return None

    def get_resume_url(self, obj):
        try:
            profile = obj.student.student_profile
            if profile.resume:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.resume.url)
                return profile.resume.url
        except Exception:
            return None

    def get_student_roll_number(self, obj):
        try:
            return obj.student.student_profile.roll_number
        except Exception:
            return None


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status', 'notes']


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']
