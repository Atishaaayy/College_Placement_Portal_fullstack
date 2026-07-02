from django.urls import path
from . import analytics_views

urlpatterns = [
    path('summary/', analytics_views.AnalyticsSummaryView.as_view(), name='analytics-summary'),
]
