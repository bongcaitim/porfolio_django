import pandas as pd
import os
tabular_data = r"pfl_app\static\pfl_app\assets\tabular_data"


# Reading a JSON file
geo_file_path = r"pfl_app\media\all_cities_geo_features.json"
geo_feature_df = pd.read_json(geo_file_path)
print(geo_feature_df.head())
geo_output_path = os.path.join(tabular_data, 'geo_features.xlsx')
geo_feature_df.to_excel(geo_output_path, index=False)


tourist_activities_path = r"pfl_app\media\all_cities_tourist_activities.json"
tourist_activities_df = pd.read_json(tourist_activities_path)
print(tourist_activities_df.head())
tourist_activities_output_path = os.path.join(tabular_data, 'tourist_activities.xlsx')
tourist_activities_df.to_excel(tourist_activities_output_path, index=False)



# Define the file path
static_asset = r"pfl_app\static\pfl_app\assets"
climate_path = os.path.join(static_asset, "combined_climate_data.json")

# cmt
import pandas as pd
import os

# Load JSON data
static_asset = r"pfl_app\static\pfl_app\assets"
climate_path = os.path.join(static_asset, "combined_climate_data.json")
data = pd.read_json(climate_path)

# Initialize an empty list to store dataframes for each province
province_dfs = []

# Loop through each province
for _, row in data.iterrows():
    province = row['province']
    url = row['url']
    climate_data = row['climate_data']
    
    # Create a temporary DataFrame to hold the months data
    temp_list = []
    for entry in climate_data:
        attribute = entry['attribute']
        months = entry['months']
        # Convert months dictionary into a DataFrame with the attribute as a column
        month_df = pd.DataFrame.from_dict(months, orient='index', columns=[attribute])
        month_df.index.name = 'Month'
        month_df.reset_index(inplace=True)
        temp_list.append(month_df)
    
    # Merge all attributes into one DataFrame
    province_df = temp_list[0]
    for other_df in temp_list[1:]:
        province_df = pd.merge(province_df, other_df, on='Month')
    
    # Add province and URL columns
    province_df['Province'] = province
    province_df['URL'] = url
    
    # Append the province_df to the list
    province_dfs.append(province_df)

# Combine all provinces into a single DataFrame
final_df = pd.concat(province_dfs, ignore_index=True)

# Save to CSV or display
climate_output_path = os.path.join(tabular_data, "monthly_climate.xlsx")
final_df.to_excel(climate_output_path, index=False)

print(final_df.head())
