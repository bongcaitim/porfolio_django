import os
import re
import json

# Directory where the JSON files are stored
media_dir = "E:/data_science/portfolio/pfl_app/media"

# Pattern to match a single letter followed by '.json'
pattern = re.compile(r'^[a-z]\.json$', re.IGNORECASE)

# List to hold all dictionaries from all JSON files
combined_climate_data = []

# Traverse the directory and process files that match the pattern
for filename in os.listdir(media_dir):
    if pattern.match(filename):
        file_path = os.path.join(media_dir, filename)
        with open(file_path, 'r', encoding='utf-8') as json_file:
            # Load JSON file and extend the combined_climate_data list with its content
            try:
                data = json.load(json_file)
                combined_climate_data.extend(data)  # assuming each file contains a list of dictionaries
            except json.JSONDecodeError:
                print(f"Warning: Could not decode JSON in file {filename}")


####################################################
import os
import json


# Month mapping from short to long form
month_mapping = {
    "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
    "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
    "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
}


# Update month names in each entry
for entry in combined_climate_data:
    for climate in entry.get("climate_data", []):
        climate["months"] = {month_mapping.get(k, k): v for k, v in climate["months"].items()}


# Save the combined data to a new JSON file
output_path = os.path.join(media_dir, "combined_climate_data.json")
with open(output_path, 'w', encoding='utf-8') as output_file:
    json.dump(combined_climate_data, output_file, ensure_ascii=False, indent=4)

print(f"Combined data has been saved to {output_path}")
