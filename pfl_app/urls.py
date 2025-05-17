from django.urls import path
from . import views
from django.urls import path, include


app_name = 'pfl_app'

urlpatterns = [
    path('results/', views.results_view, name='results_view'),

    path('<member>/<func>/', views.member, name='member'),
   
    path('save_preferences_and_run_script/', views.save_preferences_and_run_script, name='save_preferences_and_run_script'),

    path('select_things_to_do/', views.select_things_to_do, name='select_things_to_do'),
    path('save_selected_locations/', views.save_selected_locations, name='save_selected_locations'),
    path('itinerary_k_days/', views.itinerary_k_days_view, name='itinerary_k_days'),
    path('process_trip_plan/', views.process_trip_plan, name='process_trip_plan'),
   
    
]
