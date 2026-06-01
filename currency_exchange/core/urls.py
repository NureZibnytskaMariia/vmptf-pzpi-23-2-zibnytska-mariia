from django.urls import path
from . import views

urlpatterns = [
    path('', views.all_rates_view, name='all_rates'),
    path('today/', views.today_rates_view, name='today_rates'),
    path('api/today/', views.TodayRatesAPIView.as_view(), name='api_today_rates'),
]