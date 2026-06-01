from django.shortcuts import render
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CurrencyRate
from .serializers import CurrencyRateSerializer

def all_rates_view(request):
    rates = CurrencyRate.objects.all()
    return render(request, 'core/all_rates.html', {'rates': rates, 'title': 'All Currency Rates'})

def today_rates_view(request):
    today = timezone.now().date()
    rates = CurrencyRate.objects.filter(date_added=today)
    return render(request, 'core/today_rates.html', {'rates': rates, 'title': 'Today\'s Current Rates'})

class TodayRatesAPIView(APIView):
    def get(self, request):
        today = timezone.now().date()
        rates = CurrencyRate.objects.filter(date_added=today)
        serializer = CurrencyRateSerializer(rates, many=True)
        return Response(serializer.data)