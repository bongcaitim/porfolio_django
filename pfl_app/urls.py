from django.urls import path
from . import views

app_name = 'pfl_app'

urlpatterns = [
    # Top Priority: Specific Tao Souvenir Pages
    path('tao_souvenir/blog/', views.blog, name='blog_list_page'),

    path('tao_souvenir/blog/detail/', views.blog_detail, name='blog_detail'),
    path('tao_souvenir/campaigns/', views.campaigns, name='campaigns_page'),
    path('tao_souvenir/campaigns/detail/', views.campaign_detail, name='campaign_detail'),
    path('tao_souvenir/products/', views.products, name='products'),
    path('tao_souvenir/about_us/', views.about_us, name='about_us'),
    path('tao_souvenir/', views.tao_souvenir_home, name='tao_souvenir_home'),

    # Other Specific App Routes
    path('results/', views.results_view, name='results_view'),
    path('save_preferences_and_run_script/', views.save_preferences_and_run_script, name='save_preferences_and_run_script'),
    path('select_things_to_do/', views.select_things_to_do, name='select_things_to_do'),
    path('save_selected_locations/', views.save_selected_locations, name='save_selected_locations'),
    path('itinerary_k_days/', views.itinerary_k_days_view, name='itinerary_k_days'),
    path('process_trip_plan/', views.process_trip_plan, name='process_trip_plan'),
    
    # Catch-all / Generic Routes (Must be last)
    path('<member>/<func>/', views.member, name='member'),
]
