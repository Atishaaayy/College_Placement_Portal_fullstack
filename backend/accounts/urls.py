from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Registration
    path('register/student/', views.StudentRegisterView.as_view(), name='student-register'),
    path('register/recruiter/', views.RecruiterRegisterView.as_view(), name='recruiter-register'),

    # Authentication
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Current user
    path('me/', views.MeView.as_view(), name='me'),

    # Profile management
    path('profile/student/', views.StudentProfileView.as_view(), name='student-profile'),
    path('profile/student/resume/', views.ResumeUploadView.as_view(), name='resume-upload'),
    path('profile/recruiter/', views.RecruiterProfileView.as_view(), name='recruiter-profile'),

    # Password management
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.PasswordResetView.as_view(), name='reset-password'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # TPO utilities
    path('students/', views.AllStudentsView.as_view(), name='all-students'),
]
