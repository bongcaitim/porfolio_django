from django.urls import path
from . import views

app_name = 'pfl_app'

urlpatterns = [
    # Define the results URL pattern first
    path('results/', views.results_view, name='results_view'),

    # Define the generic member/func pattern
    path('<member>/<func>/', views.member, name='member'),

    # Other paths for preferences or additional functionality
    path('save_preferences/', views.save_preferences, name='save_preferences'),
]
