import secrets
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import CustomUser, StudentProfile, RecruiterProfile, PasswordResetToken, Role
from .serializers import (
    StudentRegistrationSerializer, RecruiterRegistrationSerializer,
    LoginSerializer, StudentProfileSerializer, StudentProfileUpdateSerializer,
    RecruiterProfileSerializer, RecruiterProfileUpdateSerializer,
    ForgotPasswordSerializer, PasswordResetSerializer, ChangePasswordSerializer,
    UserSerializer
)
from .permissions import IsStudent, IsRecruiter, IsTPO


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['full_name'] = user.full_name
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class StudentRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Registration successful.',
                'tokens': tokens,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecruiterRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RecruiterRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Recruiter account created. Awaiting TPO approval.',
                'tokens': tokens,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful.',
                'tokens': tokens,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class StudentProfileView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        try:
            profile = request.user.student_profile
            return Response(StudentProfileSerializer(profile).data)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        try:
            profile = request.user.student_profile
            serializer = StudentProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(StudentProfileSerializer(profile).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)


class ResumeUploadView(APIView):
    permission_classes = [IsStudent]

    def post(self, request):
        try:
            profile = request.user.student_profile
            if 'resume' not in request.FILES:
                return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
            resume_file = request.FILES['resume']
            if not resume_file.name.endswith('.pdf'):
                return Response({'error': 'Only PDF files are accepted.'}, status=status.HTTP_400_BAD_REQUEST)
            if resume_file.size > 5 * 1024 * 1024:  # 5MB limit
                return Response({'error': 'File size must not exceed 5MB.'}, status=status.HTTP_400_BAD_REQUEST)
            profile.resume = resume_file
            profile.save()
            return Response({
                'message': 'Resume uploaded successfully.',
                'resume_url': request.build_absolute_uri(profile.resume.url)
            })
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterProfileView(APIView):
    permission_classes = [IsRecruiter]

    def get(self, request):
        try:
            profile = request.user.recruiter_profile
            return Response(RecruiterProfileSerializer(profile).data)
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        try:
            profile = request.user.recruiter_profile
            serializer = RecruiterProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(RecruiterProfileSerializer(profile).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = CustomUser.objects.get(email=email)
                # Mock: Generate token and log it (in prod, email it)
                token_str = secrets.token_hex(32)
                PasswordResetToken.objects.create(user=user, token=token_str)
                print(f"[MOCK EMAIL] Password reset token for {email}: {token_str}")
            except CustomUser.DoesNotExist:
                pass  # Don't reveal if email exists
            return Response({
                'message': 'If an account with that email exists, a password reset link has been sent.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            try:
                reset_token = PasswordResetToken.objects.get(
                    token=serializer.validated_data['token'],
                    is_used=False
                )
                user = reset_token.user
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                reset_token.is_used = True
                reset_token.save()
                return Response({'message': 'Password reset successfully.'})
            except PasswordResetToken.DoesNotExist:
                return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# TPO-only: list all students
class AllStudentsView(APIView):
    permission_classes = [IsTPO]

    def get(self, request):
        profiles = StudentProfile.objects.select_related('user').all()
        return Response(StudentProfileSerializer(profiles, many=True).data)
