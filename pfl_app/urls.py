from django.urls import path
from . import views
from django.urls import path, include


app_name = 'pfl_app'

urlpatterns = [
    path('results/', views.results_view, name='results_view'),

    path('<member>/<func>/', views.member, name='member'),
   
    path('save_preferences_and_run_script/', views.save_preferences_and_run_script, name='save_preferences_and_run_script'),

    
    
]
