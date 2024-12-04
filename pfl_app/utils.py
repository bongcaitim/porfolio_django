import os
import pandas as pd
from django.db import transaction
from .models import ProvinceDescription, GeoFeature, TouristActivity, ClimateData

# Paths to the Excel files
tabular_data = r"pfl_app\static\pfl_app\assets\tabular_data"
all_province_descriptions_path = os.path.join(tabular_data, 'all_province_descriptions.xlsx')
geo_feature_path = os.path.join(tabular_data, 'geo_features.xlsx')
tourist_activities_path = os.path.join(tabular_data, 'tourist_activities.xlsx')
climate_path = os.path.join(tabular_data, 'monthly_climate.xlsx')

# Function to load province descriptions
def load_province_descriptions():
    df = pd.read_excel(all_province_descriptions_path)
    for _, row in df.iterrows():
        province_desc = ProvinceDescription(province=row['Province Name'], description=row['Province Summary'])
        province_desc.save()

# Function to load geo features data
def load_geo_features():
    df = pd.read_excel(geo_feature_path)
    for _, row in df.iterrows():
        geo_feature = GeoFeature(
            province=row['City'],
            mountain_hills=row['Núi đồi'] == 1,
            forest=row['Rừng'] == 1,
            beach=row['Bãi biển'] == 1,
            city=row['Thành phố'] == 1,
            village=row['Làng mạc'] == 1,
            cave=row['Hang động'] == 1,
            stream=row['Suối'] == 1
        )
        geo_feature.save()

# Function to load tourist activities data
def load_tourist_activities():
    df = pd.read_excel(tourist_activities_path)
    for _, row in df.iterrows():
        activity = TouristActivity(
            province=row['City'],
            park=row['Công viên'] == 1,
            historical_sites=row['Di tích lịch sử & văn hóa'] == 1,
            outdoor_adventures=row['Hoạt động ngoài trời & mạo hiểm'] == 1,
            water_activities=row['Hoạt động dưới nước'] == 1,
            food_experience=row['Trải nghiệm ẩm thực'] == 1,
            festivals=row['Lễ hội'] == 1,
            relaxation_health=row['Thư giãn & chăm sóc sức khỏe'] == 1,
            nightlife=row['Cuộc sống về đêm'] == 1,
            wildlife_nature=row['Thiên nhiên & động vật hoang dã'] == 1,
            shopping=row['Mua sắm'] == 1
        )
        activity.save()

import numpy as np

def load_climate_data():
    df = pd.read_excel(climate_path)
    for _, row in df.iterrows():
        # Explicitly convert nan to None using numpy
        climate = ClimateData(
            province=row['Province'],
            month=row['Month'],
            daytime_temperature=np.nan_to_num(row['Daytime temperature (°C)'], nan=None),
            nighttime_temperature=np.nan_to_num(row['Nighttime temperature (°C)'], nan=None),
            precipitation=np.nan_to_num(row['Precipitation (mm)'], nan=None),
            uv_index=np.nan_to_num(row['UV Index'], nan=None),
            typhoon_season=row['Typhoon season'] if not pd.isna(row['Typhoon season']) else None,
            best_month=row['Best month'] if not pd.isna(row['Best month']) else None,
            url=row['URL'] if not pd.isna(row['URL']) else None
        )
        climate.save()


def load_all_data():
    print("Hey, it's running")
    print("Checking file paths...")
    print(f"Province descriptions path: {all_province_descriptions_path}")
    print(f"Geo features path: {geo_feature_path}")
    print(f"Tourist activities path: {tourist_activities_path}")
    print(f"Climate data path: {climate_path}\n\n")
    with transaction.atomic():
        print("Starting to load province descriptions...")
        load_province_descriptions()
        print("Finished loading province descriptions\n\n")
        
        print("Starting to load geo features...")
        load_geo_features()
        print("Finished loading geo features\n\n")
        
        print("Starting to load tourist activities...")
        load_tourist_activities()
        print("Finished loading tourist activities\n\n")
        
        # print("Starting to load climate data...")
        # load_climate_data()
        # print("Finished loading climate data")
