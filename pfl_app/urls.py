from django.contrib import admin
from django.urls import path, re_path, include
from . import views

# app_name = 'pfl_app'
# urlpatterns = [
#   path('<member>/<func>', views.member, name='member'),
# ]

from django.contrib import admin
from django.urls import path, re_path, include
from . import views

app_name = 'pfl_app'
urlpatterns = [
    path('<member>/<func>', views.member, name='member'),
    path('save_preferences/', views.save_preferences, name='save_preferences'),  # New path for AJAX preference saving
]
