from django.urls import path
from . import student_views

urlpatterns = [
    path('feed/', student_views.StudentJobFeedView.as_view(), name='student-feed'),
    path('apply/<int:drive_id>/', student_views.StudentApplyView.as_view(), name='student-apply'),
    path('applications/', student_views.StudentApplicationsView.as_view(), name='student-applications'),
    path('announcements/', student_views.StudentAnnouncementsView.as_view(), name='student-announcements'),
    path('eligibility/<int:drive_id>/', student_views.StudentEligibilityCheckView.as_view(), name='student-eligibility'),
]
