import os
import sys
import django

# Add the project directory to the system path
sys.path.insert(0, "E:/data_science/portfolio")

# Set up the Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pfl_project.settings')
django.setup()

from pfl_app.models import UserPreference

# Query the most recent entry in UserPreference and print it
latest_preference = UserPreference.objects.order_by('-created_at').first()
if latest_preference:
    print("Latest User Preference:")
    preferred_geo_features = latest_preference.geographical_features
    print(f"Geographical Features: {preferred_geo_features}")
    
    preferred_activities = latest_preference.tourist_activities
    print(f"Tourist Activities: {preferred_activities}")
    
    preferred_month = latest_preference.tour_month
    print(f"Tour Month: {preferred_month}")
    
    print(f"Created At: {latest_preference.created_at}")
else:
    print("No preferences found.")


import json

# Load JSON data
with open(r'E:\data_science\portfolio\pfl_app\media\all_cities_geo_features.json', 'r', encoding='utf-8') as f:
    geo_data = json.load(f)

with open(r'E:\data_science\portfolio\pfl_app\media\all_cities_tourist_activities.json', 'r', encoding='utf-8') as f:
    activities_data = json.load(f)


# Filter function
def filter_cities(geo_data, activities_data):
    matching_cities = []
    for geo in geo_data:
        # Check if the city has all preferred geo features
        if all(geo.get(feature, '0') == '1' for feature in preferred_geo_features):
            # Find corresponding city in activities data
            for activity in activities_data:
                if activity["City"] == geo["City"]:
                    # Check if the city has all preferred activities
                    if all(activity.get(act, 0) == 1 for act in preferred_activities):
                        matching_cities.append(geo["City"])
    return matching_cities

# Get matching cities
matching_cities = filter_cities(geo_data, activities_data)
print("Cities that match preferences:", matching_cities)


import pandas as pd

# Load the Excel file
province_data = pd.read_excel(r'E:\data_science\portfolio\pfl_app\media\all_province_descriptions.xlsx')

# Filter rows where 'Province Name' matches any of the cities in matching_cities
matching_province_summaries = province_data[province_data['Province Name'].isin(matching_cities)]

# Print out the summaries
print("Matching Province Summaries:")
for index, row in matching_province_summaries.iterrows():
    print(f"Province Name: {row['Province Name']}")
    print(f"Province Summary: {row['Province Summary']}\n")



import json
import pandas as pd

# Load the Excel file
province_data = pd.read_excel(r'E:\data_science\portfolio\pfl_app\media\all_province_descriptions.xlsx')

# Prepare a list to hold the result
matched_result = []

# Iterate over the matching cities and collect their data
for city in matching_cities:
    # Find the corresponding row in geo_data
    geo_data_for_city = next((geo for geo in geo_data if geo["City"] == city), None)
    activities_data_for_city = next((activity for activity in activities_data if activity["City"] == city), None)
    province_description = province_data[province_data['Province Name'] == city]['Province Summary'].iloc[0] if not province_data[province_data['Province Name'] == city].empty else "Description not available"

    if geo_data_for_city and activities_data_for_city:
        matched_result.append({
            "city": city,
            "geo_features": {key: value for key, value in geo_data_for_city.items() if key != "City"},
            "tourist_activities": {key: value for key, value in activities_data_for_city.items() if key != "City"},
            "description": province_description
        })

# Save the matched result as a JSON file
output_file = r'E:\data_science\portfolio\pfl_app\media\matches\matched_city_data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(matched_result, f, ensure_ascii=False, indent=4)

print(f"Matched result saved to {output_file}")
