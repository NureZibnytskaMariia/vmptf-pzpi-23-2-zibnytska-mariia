from django.contrib import admin
from .models import CurrencyRate

@admin.register(CurrencyRate)
class CurrencyRateAdmin(admin.ModelAdmin):
    list_display = ('currency_name', 'buy_rate', 'sell_rate', 'date_added')
    list_filter = ('date_added', 'currency_name')
    search_fields = ('currency_name',)
    date_hierarchy = 'date_added'