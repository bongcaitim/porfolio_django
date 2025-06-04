import os
import sys
import django
import json
import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry
from geopy.geocoders import Nominatim

def setup_django():
    """Set up Django environment and import required models."""
    # Add the project directory to the system path
    project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    sys.path.insert(0, project_dir)

    # Set up the Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pfl_project.settings')
    django.setup()

    from pfl_app.models import UserPreference
    return UserPreference

def get_latest_preferences(UserPreference):
    """Get the most recent user preferences from the database."""
    latest_preference = UserPreference.objects.order_by('-created_at').first()
    if not latest_preference:
        raise ValueError("No preferences found in the database.")
    
    return {
        'geographical_features': latest_preference.geographical_features,
        'tourist_activities': latest_preference.tourist_activities,
        'tour_month': latest_preference.tour_month,
        'created_at': latest_preference.created_at
    }

def load_json_data():
    """Load all required JSON data files."""
    static_asset = os.path.join('pfl_app', 'static', 'pfl_app', 'assets')
    
    # Load geographical features
    geo_file_path = os.path.join('pfl_app', 'media', 'all_cities_geo_features.json')
    with open(geo_file_path, 'r', encoding='utf-8') as f:
        geo_data = json.load(f)

    # Load tourist activities
    tourist_act_file_path = os.path.join('pfl_app', 'media', 'all_cities_tourist_activities.json')
    with open(tourist_act_file_path, 'r', encoding='utf-8') as f:
        activities_data = json.load(f)

    # Load climate data
    climate_data_file = os.path.join(static_asset, 'combined_climate_data.json')
    with open(climate_data_file, 'r', encoding='utf-8') as f:
        climate_data = json.load(f)

    # Load warning promotion data
    warning_promotion_file_path = os.path.join(static_asset, 'warning_promotion.json')
    with open(warning_promotion_file_path, 'r', encoding='utf-8') as f:
        warning_promotion_data = json.load(f)

    return geo_data, activities_data, climate_data, warning_promotion_data

def get_current_and_next_7_days_weather(city_name):
    """Get current and forecast weather data for a city."""
    geolocator = Nominatim(user_agent="MyApp")
    location = geolocator.geocode(f"{city_name}, Việt Nam")
    
    if not location:
        raise ValueError(f"Could not find location for city: {city_name}")

    lat = location.latitude
    long = location.longitude

    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": long,
        "current": ["temperature_2m", "rain"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "uv_index_max", "precipitation_sum"],
        "timezone": "auto"
    }
    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    current = response.Current()
    current_temperature_2m = str(round(current.Variables(0).Value())) + ' °C'
    current_rain = str(round(current.Variables(1).Value())) + ' mm'

    daily = response.Daily()
    daily_temperature_2m_max = daily.Variables(0).ValuesAsNumpy()
    daily_temperature_2m_min = daily.Variables(1).ValuesAsNumpy()
    daily_uv_index_max = daily.Variables(2).ValuesAsNumpy()
    daily_precipitation_sum = daily.Variables(3).ValuesAsNumpy()

    daily_data = {
        "date": pd.date_range(
            start=pd.to_datetime(daily.Time(), unit="s", utc=True),
            end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=daily.Interval()),
            inclusive="left"
        )
    }

    daily_data["date"] = daily_data["date"].strftime('%Y-%m-%d').tolist()
    daily_data["temperature_2m_max"] = [str(round(x)) + ' °C' for x in daily_temperature_2m_max.tolist()]
    daily_data["temperature_2m_min"] = [str(round(x)) + ' °C' for x in daily_temperature_2m_min.tolist()]
    daily_data["uv_index_max"] = [str(round(x)) for x in daily_uv_index_max.tolist()]
    daily_data["precipitation_sum"] = [str(round(x)) + ' mm' for x in daily_precipitation_sum.tolist()]

    return daily_data, current_temperature_2m, current_rain

def filter_cities(geo_data, activities_data, preferred_geo_features, preferred_activities):
    """Filter cities based on geographical features and activities preferences."""
    matching_cities = []
    for geo in geo_data:
        if all(geo.get(feature, '0') == '1' for feature in preferred_geo_features):
            for activity in activities_data:
                if activity["City"] == geo["City"] and all(activity.get(act, 0) == 1 for act in preferred_activities):
                    matching_cities.append(geo["City"])
    return matching_cities

def get_matched_cities_data():
    """Main function to get matched cities data based on user preferences."""
    try:
        # Setup Django and get UserPreference model
        UserPreference = setup_django()
        
        # Get latest preferences
        preferences = get_latest_preferences(UserPreference)
        
        # Load all required data
        geo_data, activities_data, climate_data, warning_promotion_data = load_json_data()
        
        # Load additional data
        static_asset = os.path.join('pfl_app', 'static', 'pfl_app', 'assets')
        province_data = pd.read_excel(os.path.join(static_asset, 'all_province_descriptions.xlsx'))
        weather_favorability_score_df = pd.read_excel(os.path.join(static_asset, 'weather_favorability_scores.xlsx'))
        
        # Get matching cities
        matching_cities = filter_cities(
            geo_data, 
            activities_data, 
            preferences['geographical_features'], 
            preferences['tourist_activities']
        )
        
        # Prepare list for matched results
        matched_result = []
        
        for city in matching_cities:
            try:
                # Get weather data
                daily_data, current_temperature_2m, current_rain = get_current_and_next_7_days_weather(city)
                
                # Get city-specific data
                geo_data_for_city = next((geo for geo in geo_data if geo["City"] == city), None)
                activities_data_for_city = next((activity for activity in activities_data if activity["City"] == city), None)
                province_description = province_data[province_data['Province Name'] == city]['Province Summary'].iloc[0] if not province_data[province_data['Province Name'] == city].empty else "Description not available"
                warning_promotion = warning_promotion_data.get(city, {})
                
                # Get weather favorability score
                weather_favorability_score = weather_favorability_score_df[
                    (weather_favorability_score_df['Province'] == city) & 
                    (weather_favorability_score_df['Month'] == preferences['tour_month'])
                ]['weather_favorability_score'].iloc[0]
                
                # Get climate data for the preferred month
                climate_data_for_city = {
                    attribute['attribute']: attribute['months'].get(preferences['tour_month'])
                    for city_data in climate_data if city_data['province'] == city
                    for attribute in city_data['climate_data'] if preferences['tour_month'] in attribute['months']
                }
                
                if geo_data_for_city and activities_data_for_city:
                    matched_result.append({
                        "city": city,
                        "geo_features": {key: value for key, value in geo_data_for_city.items() if key != "City"},
                        "tourist_activities": {key: value for key, value in activities_data_for_city.items() if key != "City"},
                        "description": province_description,
                        "climate_data": climate_data_for_city,
                        "current_temperature_2m": current_temperature_2m,
                        "current_rain": current_rain,
                        "next_7_days_weather": daily_data,
                        "month": month_to_number[preferences['tour_month']],
                        "warning_promotion": warning_promotion,
                        "weather_favorability_score": float(weather_favorability_score)
                    })
            except Exception as e:
                print(f"Error processing city {city}: {str(e)}")
                continue
        
        # Sort matched_result by weather_favorability_score
        matched_result.sort(key=lambda x: float(x['weather_favorability_score']), reverse=True)
        
        # Save the matched result as a JSON file
        output_file = os.path.join(static_asset, 'matched_city_data.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(matched_result, f, ensure_ascii=False, indent=4)
        
        return matched_result
        
    except Exception as e:
        print(f"Error in get_matched_cities_data: {str(e)}")
        raise

# Month to number mapping
month_to_number = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12
}

if __name__ == '__main__':
    # This block will only run if the script is executed directly
    try:
        result = get_matched_cities_data()
        print("Successfully generated matched cities data")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
