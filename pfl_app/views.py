from django.shortcuts import render, redirect
from django.core.files.storage import FileSystemStorage
import json
import os
import os
import json
from django.core.files.storage import FileSystemStorage
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UserPreference
import json
from django.shortcuts import render
import subprocess
import sys
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.conf import settings
from datetime import datetime

def member(request, member, func):
    print("FUNCTION MEMBER IS BEING TRIGGERED")
    
    if request.path.startswith('/portfolio/pfl_app/results'):
        print('REDIRECTING TO RESULTS VIEW')
        return results_view(request)  # Call results_view directly if this is the 'results' URL
    
    # Lists for form options
    geographical_features = ["Núi đồi", "Rừng", "Bãi biển", "Thành phố", "Làng mạc", "Hang động", "Suối"]
    tourist_activities = [
        "Công viên", "Di tích lịch sử & văn hóa", "Hoạt động ngoài trời & mạo hiểm",
        "Hoạt động dưới nước", "Trải nghiệm ẩm thực", "Lễ hội",
        "Thư giãn & chăm sóc sức khỏe", "Cuộc sống về đêm",
        "Thiên nhiên & động vật hoang dã", "Mua sắm"
    ]
    months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", 
              "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
    
    # Context preparation
    context = {
        'geographical_features': geographical_features,
        'tourist_activities': tourist_activities,
        'months': months,
        'member': member,
        'func': func
    }
    
    # Handle file uploads
    if request.method == 'POST' and request.FILES:
        uploaded_files = request.FILES.getlist('uploaded_file')  # Get the uploaded files
        fs = FileSystemStorage()  # Create a FileSystemStorage instance

        for file in uploaded_files:
            filename = fs.save(file.name, file)  # Save the file
            uploaded_file_url = fs.url(filename)  # Get the URL for the saved file
            
            # If needed, add uploaded_file_url to the context or handle it otherwise
        
        # Run the transform script after saving files
        venv_path = os.path.join(os.getcwd(), 'portfolio_env', 'Scripts', 'activate.bat')
        transform_data_script = os.path.join(os.getcwd(), 'transform.py')
        try:
            print("Running transform.py script...")
            subprocess.run(f'"{venv_path}" && python "{transform_data_script}"', shell=True, check=True)
        except subprocess.CalledProcessError as e:
            return render(request, 'pfl_app/error_template.html', {'error': f'Failed to run transform script: {str(e)}'})


    # Load JSON template configuration
    json_path = os.path.join("pfl_app", "templates", f"{member}", "info_template.json")
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            INFO_TEMPLATE = json.load(file)
        template_name = INFO_TEMPLATE.get(func.lower(), 'pfl_app/default_template.html')  # Fallback to a default if func not found
    except FileNotFoundError:
        return render(request, 'pfl_app/error_template.html', {'error': 'Template configuration not found.'})

    return render(request, template_name, context)

def results_view(request):
    print("FUNCTION results_view IS BEING TRIGGERED")

    # Load city data
    try:
        static_asset = r"pfl_app\static\pfl_app\assets"
        matched_city_data = os.path.join(static_asset, r"matched_city_data.json")

        with open(matched_city_data, "r", encoding="utf-8") as file:
            cities = json.load(file)
    except FileNotFoundError:
        return render(request, "pfl_app/error.html", {"message": "Data file not found"})
    except json.JSONDecodeError:
        return render(request, "pfl_app/error.html", {"message": "Failed to decode JSON"})

    # Load emoji data
    try:
        feature_emojis = r"pfl_app\static\pfl_app\assets\features_activities_emojis.json"
        with open(feature_emojis, "r", encoding="utf-8") as emoji_file:
            emoji_data = json.load(emoji_file)
    except FileNotFoundError:
        return render(request, "pfl_app/error.html", {"message": "Emoji file not found"})
    except json.JSONDecodeError:
        return render(request, "pfl_app/error.html", {"message": "Failed to decode Emoji JSON"})

    # Format the data for template compatibility
    for city in cities:
        # Format climate data
        climate_data = city.get("climate_data", {})
        formatted_climate_data = {
            "daytime_temp": climate_data.get("Daytime temperature (°C)"),
            "nighttime_temp": climate_data.get("Nighttime temperature (°C)"),
            "precipitation": climate_data.get("Precipitation (mm)"),
            "uv_index": climate_data.get("UV Index"),
            "typhoon_season": climate_data.get("Typhoon season"),
            "best_month": climate_data.get("Best month"),
        }

        city["formatted_climate_data"] = formatted_climate_data

        # Add emojis to geo_features and tourist_activities
        city["geo_features_emoji"] = {
            feature: emoji_data["geo_features"].get(feature, "") for feature, available in city.get("geo_features", {}).items() if available == "1"
        }
        city["tourist_activities_emoji"] = {
            activity: emoji_data["tourist_activities"].get(activity, "") for activity, available in city.get("tourist_activities", {}).items() if available == 1
        }

    return render(request, "pfl_app/results.html", {"cities": cities})


@csrf_exempt
def save_preferences_and_run_script(request):
    print("save_preferences_and_run_script function is being triggered")
    if request.method == 'POST':
        print("POST request received")
        # Retrieve the data from the form submission
        geographical_features = request.POST.getlist('geographical_features')
        tourist_activities = request.POST.getlist('tourist_activities')
        tour_month = request.POST.get('tour_month')
        
        print(f"Received data: geographical_features={geographical_features}, tourist_activities={tourist_activities}, tour_month={tour_month}")

        vi_en_months = {
            "Tháng 1": "January",
            "Tháng 2": "February",
            "Tháng 3": "March",
            "Tháng 4": "April",
            "Tháng 5": "May",
            "Tháng 6": "June",
            "Tháng 7": "July",
            "Tháng 8": "August",
            "Tháng 9": "September",
            "Tháng 10": "October",
            "Tháng 11": "November",
            "Tháng 12": "December"
        }

        try:
            # Save the preferences to the database
            print("Attempting to save preferences to database")
            UserPreference.objects.create(
                geographical_features=geographical_features,
                tourist_activities=tourist_activities,
                tour_month=vi_en_months[tour_month],
            )
            print("Successfully saved preferences to database")

            import subprocess

            # Paths to the virtual environment and script
            venv_path = os.path.join(os.getcwd(), 'portfolio_env', 'Scripts', 'activate.bat')
            fetch_match_preferences_script = os.path.join(os.getcwd(), 'fetch_match_preferences.py')
            
            print(f"Script paths: venv_path={venv_path}, fetch_match_preferences_script={fetch_match_preferences_script}")

            # Activate virtual environment and run the script
            try:
                print("Attempting to run fetch_match_preferences.py script")
                # Run the script in the activated environment
                subprocess.run(f'"{venv_path}" && python "{fetch_match_preferences_script}"', shell=True, check=True)
                print("Successfully ran fetch_match_preferences.py script")
                
                # Redirect to results page after successful execution
                print("Redirecting to results page")
                return HttpResponseRedirect(reverse('pfl_app:results_view'))

            except subprocess.CalledProcessError as e:
                print(f"Error running script: {str(e)}")
                return JsonResponse({'status': 'error', 'message': f'Failed to run script: {str(e)}'})
        except Exception as e:
            print(f"Error saving preferences: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Failed to save preferences: {str(e)}'})
    else:
        print(f"Invalid request method: {request.method}")
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def itinerary_view(request):
    # Get the latest user preferences from the database
    latest_preference = UserPreference.objects.order_by('-created_at').first()
    if not latest_preference:
        return render(request, "pfl_app/error.html", {"message": "No user preferences found"})

    # Load geo data
    geo_path = os.path.join("pfl_app", "media", "ttd_geo_tag_copilot_processed.json")
    with open(geo_path, "r", encoding="utf-8") as f:
        geo_data = json.load(f)[0]  # Data is a list containing dict

    # Load activity data
    activity_path = os.path.join("pfl_app", "media", "ttd_activity_tag_copilot_processed.json")
    with open(activity_path, "r", encoding="utf-8") as f:
        activity_data = json.load(f)[0]  # Data is a list containing dict

    # Load description data
    description_path = os.path.join("pfl_app", "media", "ttd_description_copilot.json")
    with open(description_path, "r", encoding="utf-8") as f:
        description_data = json.load(f)  

    # Load description data
    coordinates_path = os.path.join("pfl_app", "media", "place_full_pluscode_long_lat.json")
    with open(coordinates_path, "r", encoding="utf-8") as f:
        coordinates_data = json.load(f)          

    # Load emoji data
    emoji_path = os.path.join("pfl_app", "static", "pfl_app", "assets", "features_activities_emojis.json")
    with open(emoji_path, "r", encoding="utf-8") as f:
        emoji_data = json.load(f)

    # Get the intersection of location names from both datasets
    location_names = list(set(geo_data.keys()) & set(activity_data.keys()))
    
    # Filter locations based on user preferences
    matching_locations = []
    for location in location_names:
        geo_features = geo_data[location]
        activities = activity_data[location]
        
        # Check if any of the preferred geo features are available
        geo_match = any(
            geo_features.get(feature, 0) == 1 
            for feature in latest_preference.geographical_features
        )
        
        # Check if any of the preferred activities are available
        activity_match = any(
            activities.get(activity, 0) == 1 
            for activity in latest_preference.tourist_activities
        )
        
        # If either geo features or activities match, include the location
        if geo_match or activity_match:
            matching_locations.append(location)

    # Sort the matching locations
    matching_locations.sort()

    location_coordinates = {}

    # Add emojis to geo_features and tourist_activities for each matching location
    for location_name in matching_locations:
        # Add emojis to geo features
        geo_features = geo_data[location_name]
        geo_data[location_name] = {
            "features": geo_features,
            "emojis": {
                feature: emoji_data["geo_features"].get(feature, "") 
                for feature, value in geo_features.items() 
                if value == 1
            }
        }

        # Add emojis to tourist activities
        activities = activity_data[location_name]
        activity_data[location_name] = {
            "activities": activities,
            "emojis": {
                activity: emoji_data["tourist_activities"].get(activity, "") 
                for activity, value in activities.items() 
                if value == 1
            }
        }

        location_coordinates[location_name] = coordinates_data[location_name]["coordinates"]

    context = {
        "location_names": matching_locations,  # Use filtered locations
        "geo_data": geo_data,
        "activity_data": activity_data,
        "description_data": description_data,
        "coordinates_data": location_coordinates
    }

    print(latest_preference.geographical_features, latest_preference.tourist_activities)
    print(len(matching_locations))
    print(matching_locations)
    print(location_coordinates)

    return render(request, "pfl_app/itinerary.html", context)

@csrf_exempt
def save_selected_locations(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            locations = data.get('locations', [])
            
            if not locations:
                return JsonResponse({'status': 'error', 'message': 'No locations provided'}, status=400)
            
            # Create media directory if it doesn't exist
            media_dir = os.path.join(settings.MEDIA_ROOT, 'selected_locations')
            os.makedirs(media_dir, exist_ok=True)
            
            # Generate filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'selected_locations_{timestamp}.json'
            filepath = os.path.join(media_dir, filename)
            
            # Process the data to ensure it's serializable
            processed_locations = []
            for location in locations:
                processed_location = {
                    'name': location['name'],
                    'geo_features': location['geo_features'],
                    'activities': location['activities'],
                    'description': location['description'],
                    'coordinates': location['coordinates']
                }
                processed_locations.append(processed_location)
            
            # Save to file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(processed_locations, f, ensure_ascii=False, indent=2)
            
            return JsonResponse({
                'status': 'success',
                'message': 'Locations saved successfully',
                'file_path': filepath
            })
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)