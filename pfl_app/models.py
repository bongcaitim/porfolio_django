from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User  # Import if linking preferences to a user

class UserPreference(models.Model):
    geographical_features = models.JSONField()  # Store selected geographical features
    tourist_activities = models.JSONField()     # Store selected tourist activities
    tour_month = models.CharField(max_length=20)  # Store selected tour month
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "Preferences"
