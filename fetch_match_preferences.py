import os
import sys
import django
import json
import pandas as pd

# Add the project directory to the system path
# sys.path.insert(0, "E:/data_science/portfolio")
# Navigate two levels up from the current script's directory to get the project root
project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

sys.path.insert(0, project_dir)


# Set up the Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pfl_project.settings')
django.setup()

from pfl_app.models import UserPreference

# Query the most recent entry in UserPreference and print it
latest_preference = UserPreference.objects.order_by('-created_at').first()
if latest_preference:
    print("Latest User Preference:")
    preferred_geo_features = latest_preference.geographical_features
    preferred_activities = latest_preference.tourist_activities
    preferred_month = latest_preference.tour_month
    print(f"Geographical Features: {preferred_geo_features}")
    print(f"Tourist Activities: {preferred_activities}")
    print(f"Tour Month: {preferred_month}")
    print(f"Created At: {latest_preference.created_at}")
else:
    print("No preferences found.")
    sys.exit()

# Load JSON data for geographical features and tourist activities
geo_file_path = r"pfl_app\media\all_cities_geo_features.json"
with open(geo_file_path, 'r', encoding='utf-8') as f:
    geo_data = json.load(f)

tourist_act_file_path = r"pfl_app\media\all_cities_tourist_activities.json"
with open(tourist_act_file_path, 'r', encoding='utf-8') as f:
    activities_data = json.load(f)

# Filter function to find matching cities
def filter_cities(geo_data, activities_data):
    matching_cities = []
    for geo in geo_data:
        if all(geo.get(feature, '0') == '1' for feature in preferred_geo_features):
            for activity in activities_data:
                if activity["City"] == geo["City"] and all(activity.get(act, 0) == 1 for act in preferred_activities):
                    matching_cities.append(geo["City"])
    return matching_cities

# Get matching cities
matching_cities = filter_cities(geo_data, activities_data)
print("Cities that match preferences:", matching_cities)

# Load province descriptions
static_asset = r"pfl_app\static\pfl_app\assets"
province_data_excel = os.path.join(static_asset, r"all_province_descriptions.xlsx")

province_data = pd.read_excel(province_data_excel)

# Load climate data
static_asset = r"pfl_app\static\pfl_app\assets"
climate_data_file = os.path.join(static_asset, "combined_climate_data.json")
with open(climate_data_file, 'r', encoding='utf-8') as f:
    climate_data = json.load(f)
    
# LOAD CURRENT WEATHER AND THE NEXT 7 DAYS' WEATHER
import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
from geopy.geocoders import Nominatim
import json
import os


def get_current_and_next_7_days_weather(city_name):
    geolocator = Nominatim(user_agent="MyApp")
    location = geolocator.geocode(f"{city_name}, Việt Nam")
    print(location)

    lat = location.latitude
    long = location.longitude

    print("The latitude of the location is: ", lat)
    print("The longitude of the location is: ", long)

    cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
    retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
    openmeteo = openmeteo_requests.Client(session = retry_session)

    # Make sure all required weather variables are listed here
    # The order of variables in hourly or daily is important to assign them correctly below
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": long,
        "current": ["temperature_2m", "rain"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "uv_index_max", "precipitation_sum"],
        "timezone": "auto"
    }
    responses = openmeteo.weather_api(url, params=params)

    # Process first location. Add a for-loop for multiple locations or weather models
    response = responses[0]
    print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
    print(f"Elevation {response.Elevation()} m asl")
    print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
    print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")

    # Current values. The order of variables needs to be the same as requested.
    current = response.Current()
    current_temperature_2m = str(round(current.Variables(0).Value()))+' °C'
    current_rain = str(round(current.Variables(1).Value())) +' mm'

    print(f"Current time {current.Time()}")
    print(f"Current temperature_2m {current_temperature_2m}")
    print(f"Current rain {current_rain}")

    # Process daily data. The order of variables needs to be the same as requested.
    daily = response.Daily()
    daily_temperature_2m_max = daily.Variables(0).ValuesAsNumpy()
    daily_temperature_2m_min = daily.Variables(1).ValuesAsNumpy()
    daily_uv_index_max = daily.Variables(2).ValuesAsNumpy()
    daily_precipitation_sum = daily.Variables(3).ValuesAsNumpy()

    daily_data = {"date": pd.date_range(
        start = pd.to_datetime(daily.Time(), unit = "s", utc = True),
        end = pd.to_datetime(daily.TimeEnd(), unit = "s", utc = True),
        freq = pd.Timedelta(seconds = daily.Interval()),
        inclusive = "left"
    )}

    daily_data["date"] = daily_data["date"].strftime('%Y-%m-%d').tolist()

    daily_data["temperature_2m_max"] = [str(round(x))+' °C' for x in daily_temperature_2m_max.tolist()]
    daily_data["temperature_2m_min"] = [str(round(x))+' °C' for x in daily_temperature_2m_min.tolist()]
    daily_data["uv_index_max"] = [str(round(x)) for x in daily_uv_index_max.tolist()]
    daily_data["precipitation_sum"] = [str(round(x))+' mm' for x in daily_precipitation_sum.tolist()]


    daily_dataframe = pd.DataFrame(data=daily_data)

    daily_dataframe = pd.DataFrame(data = daily_data)
    print(daily_dataframe)

    return daily_dataframe, current_temperature_2m, current_rain, daily_data

month_to_number = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
}


# Prepare list for matched results
matched_result = []

for city in matching_cities:
    
    daily_dataframe, current_temperature_2m, current_rain, daily_data = get_current_and_next_7_days_weather(city)
    
    geo_data_for_city = next((geo for geo in geo_data if geo["City"] == city), None)
    activities_data_for_city = next((activity for activity in activities_data if activity["City"] == city), None)
    province_description = province_data[province_data['Province Name'] == city]['Province Summary'].iloc[0] if not province_data[province_data['Province Name'] == city].empty else "Description not available"
    
    # Create a single dictionary for climate data for the specified preferred month
    climate_data_for_city = {
        attribute['attribute']: attribute['months'].get(preferred_month)
        for city_data in climate_data if city_data['province'] == city
        for attribute in city_data['climate_data'] if preferred_month in attribute['months']
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
            "month": month_to_number[preferred_month]
        })

# Save the matched result as a JSON file
# output_file = r'E:\data_science\portfolio\pfl_app\media\matches\matched_city_data.json'
output_file = os.path.join(static_asset, r"matched_city_data.json")

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(matched_result, f, ensure_ascii=False, indent=4)

print(f"Matched result saved to {output_file}")
