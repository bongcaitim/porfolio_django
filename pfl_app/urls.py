from django.urls import path
from . import views

urlpatterns = [
    path("d3", views.index)
]