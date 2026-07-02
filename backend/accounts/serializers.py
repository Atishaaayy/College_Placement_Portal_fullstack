from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, StudentProfile, RecruiterProfile, Role


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    roll_number = serializers.CharField(max_length=30)
    branch = serializers.ChoiceField(choices=StudentProfile.BRANCH_CHOICES)
    graduation_year = serializers.IntegerField()
    cgpa = serializers.DecimalField(max_digits=4, decimal_places=2)

    class Meta:
        model = CustomUser
        fields = ['email', 'full_name', 'password', 'confirm_password',
                  'roll_number', 'branch', 'graduation_year', 'cgpa']

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_roll_number(self, value):
        if StudentProfile.objects.filter(roll_number=value).exists():
            raise serializers.ValidationError("This roll number is already registered.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        cgpa = data.get('cgpa', 0)
        if float(cgpa) < 0 or float(cgpa) > 10:
            raise serializers.ValidationError({"cgpa": "CGPA must be between 0 and 10."})
        return data

    def create(self, validated_data):
        profile_data = {
            'roll_number': validated_data.pop('roll_number'),
            'branch': validated_data.pop('branch'),
            'graduation_year': validated_data.pop('graduation_year'),
            'cgpa': validated_data.pop('cgpa'),
        }
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(
            role=Role.STUDENT,
            **validated_data
        )
        StudentProfile.objects.create(user=user, **profile_data)
        return user


class RecruiterRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    company_name = serializers.CharField(max_length=200)

    class Meta:
        model = CustomUser
        fields = ['email', 'full_name', 'password', 'confirm_password', 'company_name']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(role=Role.RECRUITER, **validated_data)
        RecruiterProfile.objects.create(user=user, company_name=company_name)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please try again.")
        if not user.is_active:
            raise serializers.ValidationError("Your account has been deactivated.")
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'role', 'date_joined']
        read_only_fields = ['id', 'role', 'date_joined']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['verification_status']


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', required=False)
    email = serializers.EmailField(source='user.email', required=False, read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['full_name', 'email', 'phone', 'about', 'linkedin_url',
                  'github_url', 'active_backlogs']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if 'full_name' in user_data:
            instance.user.full_name = user_data['full_name']
            instance.user.save()
        return super().update(instance, validated_data)


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = '__all__'
        read_only_fields = ['user', 'is_approved']


class RecruiterProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ['company_name', 'company_website', 'company_description',
                  'hr_contact_name', 'hr_contact_email', 'hr_contact_phone']


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            # Return success even if email not found (security best practice)
            pass
        return value


class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data
