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
    months = ["January", "February", "March", "April", "May", "June", "July", 
              "August", "September", "October", "November", "December"]
    
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
    if request.method == 'POST':
        # Retrieve the data from the form submission
        geographical_features = request.POST.getlist('geographical_features')
        tourist_activities = request.POST.getlist('tourist_activities')
        tour_month = request.POST.get('tour_month')

        # Save the preferences to the database
        UserPreference.objects.create(
            geographical_features=geographical_features,
            tourist_activities=tourist_activities,
            tour_month=tour_month,
        )

        import subprocess

        # Paths to the virtual environment and script
        venv_path = os.path.join(os.getcwd(), 'portfolio_env', 'Scripts', 'activate.bat')
        fetch_match_preferences_script = os.path.join(os.getcwd(), 'fetch_match_preferences.py')

        # Activate virtual environment and run the script
        try:
            # Run the script in the activated environment
            subprocess.run(f'"{venv_path}" && python "{fetch_match_preferences_script}"', shell=True, check=True)
            
            # Redirect to results page after successful execution
            return HttpResponseRedirect(reverse('pfl_app:results_view'))

        except subprocess.CalledProcessError as e:
            return JsonResponse({'status': 'error', 'message': f'Failed to run script: {str(e)}'})

