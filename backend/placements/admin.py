from django.contrib import admin
from .models import Company, CampusDrive, Application, Announcement


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'website', 'created_at']
    search_fields = ['name']


@admin.register(CampusDrive)
class CampusDriveAdmin(admin.ModelAdmin):
    list_display = ['company', 'job_profile', 'ctc', 'vacancies', 'visit_date', 'is_active']
    list_filter = ['is_active', 'visit_date']
    search_fields = ['company__name', 'job_profile']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'drive', 'status', 'applied_at']
    list_filter = ['status']
    search_fields = ['student__full_name', 'drive__company__name']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'priority', 'created_by', 'is_active', 'created_at']
    list_filter = ['priority', 'is_active']
