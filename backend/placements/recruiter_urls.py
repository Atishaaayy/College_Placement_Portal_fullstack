from django.urls import path
from . import recruiter_views

urlpatterns = [
    path('drives/', recruiter_views.RecruiterDrivesView.as_view(), name='recruiter-drives'),
    path('drives/<int:drive_id>/applicants/', recruiter_views.RecruiterApplicantsView.as_view(), name='recruiter-applicants'),
    path('applications/<int:application_id>/status/', recruiter_views.RecruiterUpdateApplicationStatusView.as_view(), name='recruiter-update-status'),
]
