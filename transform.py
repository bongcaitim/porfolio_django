import os
import re
import json

# Directory where the JSON files are stored
media_dir = r"pfl_app\media"

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
static_asset = r"pfl_app\static\pfl_app\assets"
output_path = os.path.join(static_asset, "combined_climate_data.json")
with open(output_path, 'w', encoding='utf-8') as output_file:
    json.dump(combined_climate_data, output_file, ensure_ascii=False, indent=4)

print(f"Combined climate data has been saved to {output_path}")

##########################################################################
##### PDF
##########################################################################


import pdfplumber

import os


static_asset = r"pfl_app\static\pfl_app\assets"
media_dir = r"pfl_app\media"


pdf_path = os.path.join(media_dir, r"province_descriptions.pdf")
txt_output_path = os.path.join(static_asset, r"province_descriptions.txt")

# Extract text from the PDF and save it to a .txt file
print("Processing the PDF files....")
with pdfplumber.open(pdf_path) as pdf:
    with open(txt_output_path, 'w', encoding='utf-8') as txt_file:
        for page in pdf.pages:
            text = page.extract_text()
            if text:  # Check if the page has text
                txt_file.write(text + '\n\n')  # Add a newline between pages

print(f"Text extracted and saved to {txt_output_path}")
import re
import pandas as pd
import os



# Read the content of the text file
txt_output_path = r"pfl_app\static\pfl_app\assets\province_descriptions.txt"
with open(txt_output_path, 'r', encoding='utf-8') as file:
    text = file.read()

# Regular expression to match "Tỉnh thành X) City Name" pattern
pattern = r"Tỉnh thành \d+\) (.+?)\n"

# Find all matches for city names and their starting positions
matches = [(match.group(1), match.start()) for match in re.finditer(pattern, text)]

# Extract city descriptions
city_descriptions = {}
for i, (city, start_pos) in enumerate(matches):
    # Define the start and end positions for each description
    end_pos = matches[i + 1][1] if i + 1 < len(matches) else len(text)
    description = text[start_pos:end_pos].split('\n', 1)[1].strip()
    
    # Clean line breaks within the description
    description = re.sub(r'\n(?!\n)', ' ', description)  # Replace single newlines with space
    description = re.sub(r' +', ' ', description)  # Replace multiple spaces with single space
    
    # Add newline before sentences ending with colon followed by a dash or special character
    description = re.sub(r'([^.\n]*)(:)(?=\s*[-\W])', r'\n\n\1\2', description)
    
    # Insert a newline before dashes that are followed by a capital letter to denote a bullet point
    description = re.sub(r' - (?=[A-Z])', r'\n- ', description)
    
    # Clean up any multiple consecutive newlines that might have been created
    description = re.sub(r'\n{3,}', '\n\n', description)  # Replace 3 or more newlines with 2
    description = re.sub(r'\n\n- ', '\n- ', description)  # Remove extra newline before bullet points
    
    # Remove newline characters at the beginning of the text
    description = re.sub(r'^\n+', '', description)

    
    print(city)
    print(f"{description[:20]}...{description[-20:]}")
    print()
    city_descriptions[city] = description



# Create a DataFrame
df = pd.DataFrame({
    'Province Name': list(city_descriptions.keys()),
    'Province Summary': list(city_descriptions.values())
})

# Save to an Excel file
static_asset = r"pfl_app\static\pfl_app\assets"
province_data_excel = os.path.join(static_asset, r"all_province_descriptions.xlsx")
df.to_excel(province_data_excel, index=False)

print(f"Excel file saved at {province_data_excel}")
