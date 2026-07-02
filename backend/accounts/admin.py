from django.contrib import admin
from .models import CustomUser, StudentProfile, RecruiterProfile, PasswordResetToken


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'full_name']


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'roll_number', 'branch', 'graduation_year', 'cgpa', 'verification_status']
    list_filter = ['branch', 'graduation_year', 'verification_status']
    search_fields = ['roll_number', 'user__full_name', 'user__email']


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'user', 'is_approved']
    list_filter = ['is_approved']
    search_fields = ['company_name', 'user__email']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'is_used']
    list_filter = ['is_used']
