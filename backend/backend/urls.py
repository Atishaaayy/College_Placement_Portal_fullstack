from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/auth/', include('accounts.urls')),
    path('api/tpo/', include('placements.tpo_urls')),
    path('api/student/', include('placements.student_urls')),
    path('api/recruiter/', include('placements.recruiter_urls')),
    path('api/analytics/', include('placements.analytics_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
