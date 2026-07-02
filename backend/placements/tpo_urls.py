from django.urls import path
from . import tpo_views

urlpatterns = [
    # Campus Drives
    path('drives/', tpo_views.TPODrivesView.as_view(), name='tpo-drives'),
    path('drives/<int:pk>/', tpo_views.TPODriveDetailView.as_view(), name='tpo-drive-detail'),
    path('drives/<int:drive_id>/applications/', tpo_views.TPODriveApplicationsView.as_view(), name='tpo-drive-apps'),
    path('drives/<int:drive_id>/export/', tpo_views.ExportDriveApplicantsCSV.as_view(), name='tpo-export-csv'),

    # Companies
    path('companies/', tpo_views.TPOCompaniesView.as_view(), name='tpo-companies'),

    # Student Verification
    path('verification/', tpo_views.StudentVerificationQueueView.as_view(), name='tpo-verification'),
    path('verification/<int:profile_id>/', tpo_views.StudentVerificationUpdateView.as_view(), name='tpo-verify-student'),

    # Announcements
    path('announcements/', tpo_views.AnnouncementsView.as_view(), name='tpo-announcements'),
    path('announcements/<int:pk>/', tpo_views.AnnouncementDetailView.as_view(), name='tpo-announcement-detail'),
]
