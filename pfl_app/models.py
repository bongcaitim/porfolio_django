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


# Model for Province Descriptions
class ProvinceDescription(models.Model):
    province = models.CharField(max_length=10000)  # Province Name
    description = models.TextField()  # Province Summary

    def __str__(self):
        return self.province


# Model for Geographical Features
class GeoFeature(models.Model):
    province = models.CharField(max_length=255)  # Province Name
    mountain_hills = models.BooleanField()  # Núi đồi
    forest = models.BooleanField()  # Rừng
    beach = models.BooleanField()  # Bãi biển
    city = models.BooleanField()  # Thành phố
    village = models.BooleanField()  # Làng mạc
    cave = models.BooleanField()  # Hang động
    stream = models.BooleanField()  # Suối

    def __str__(self):
        return self.province


# Model for Tourist Activities
class TouristActivity(models.Model):
    province = models.CharField(max_length=255)  # Province Name
    park = models.BooleanField()  # Công viên
    historical_sites = models.BooleanField()  # Di tích lịch sử & văn hóa
    outdoor_adventures = models.BooleanField()  # Hoạt động ngoài trời & mạo hiểm
    water_activities = models.BooleanField()  # Hoạt động dưới nước
    food_experience = models.BooleanField()  # Trải nghiệm ẩm thực
    festivals = models.BooleanField()  # Lễ hội
    relaxation_health = models.BooleanField()  # Thư giãn & chăm sóc sức khỏe
    nightlife = models.BooleanField()  # Cuộc sống về đêm
    wildlife_nature = models.BooleanField()  # Thiên nhiên & động vật hoang dã
    shopping = models.BooleanField()  # Mua sắm

    def __str__(self):
        return self.province


# Model for Climate Data
class ClimateData(models.Model):
    province = models.CharField(max_length=255)
    month = models.CharField(max_length=255)
    daytime_temperature = models.CharField(max_length=255, null=True)
    nighttime_temperature = models.CharField(max_length=255, null=True)
    precipitation = models.CharField(max_length=255, null=True)
    uv_index = models.CharField(max_length=255, null=True)
    typhoon_season = models.CharField(max_length=255, null=True)
    best_month = models.CharField(max_length=255, null=True)
    url = models.URLField(null=True)

    def __str__(self):
        return self.province

