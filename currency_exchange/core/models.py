from django.db import models
from django.utils import timezone

class CurrencyRate(models.Model):
    currency_name = models.CharField(max_length=10, verbose_name="Currency Name")
    buy_rate = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Buy Rate")
    sell_rate = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Sell Rate")
    date_added = models.DateField(default=timezone.now, verbose_name="Date Added")

    class Meta:
        verbose_name = "Currency Rate"
        verbose_name_plural = "Currency Rates"
        ordering = ['-date_added', 'currency_name']

    def __str__(self):
        return f"{self.currency_name} - {self.date_added}"