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
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import geopandas as gpd
from shapely.geometry import Point
import contextily as ctx

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
    
    # # Handle file uploads
    # if request.method == 'POST' and request.FILES:
    #     uploaded_files = request.FILES.getlist('uploaded_file')  # Get the uploaded files
    #     fs = FileSystemStorage()  # Create a FileSystemStorage instance

    #     for file in uploaded_files:
    #         filename = fs.save(file.name, file)  # Save the file
    #         uploaded_file_url = fs.url(filename)  # Get the URL for the saved file
            
    #         # If needed, add uploaded_file_url to the context or handle it otherwise
        
    #     # Run the transform script after saving files
    #     venv_path = os.path.join(os.getcwd(), 'portfolio_env', 'Scripts', 'activate.bat')
    #     transform_data_script = os.path.join(os.getcwd(), 'transform.py')
    #     try:
    #         print("Running transform.py script...")
    #         subprocess.run(f'"{venv_path}" && python "{transform_data_script}"', shell=True, check=True)
    #     except subprocess.CalledProcessError as e:
    #         return render(request, 'pfl_app/error_template.html', {'error': f'Failed to run transform script: {str(e)}'})


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

def select_things_to_do(request):
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

    return render(request, "pfl_app/select_things_to_do.html", context)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from datetime import datetime
from django.conf import settings

@csrf_exempt
def save_selected_locations(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            locations = data.get('locations', [])
            
            if not locations:
                return JsonResponse({'status': 'error', 'message': 'No locations provided'}, status=400)
            
            # Create media directory if it doesn't exist
            media_dir = settings.MEDIA_ROOT
            
            # Generate filename with timestamp
            filename = f'selected_locations.json'
            filepath = os.path.join(media_dir, filename)
            
            # Process the data to ensure it's serializable
            processed_locations = []
            for location in locations:
                processed_location = {
                    'name': location['name'],
                    'geo_features_emojis': location['geo_features'],
                    'activities_emojis': location.get('emoji_activities', {}),
                    'description': location['description'],
                    'coordinates': location.get('coordinates', {})
                }
                processed_locations.append(processed_location)
            
            # Save to file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(processed_locations, f, ensure_ascii=False, indent=2)
            
            # Redirect to itinerary_k_days page
            return JsonResponse({
                'status': 'success',
                'message': 'Locations saved successfully',
                'redirect_url': reverse('pfl_app:itinerary_k_days')
            })
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Invalid JSON data: {str(e)}'}, status=400)
        except Exception as e:
            print(f"Error saving locations: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

def itinerary_k_days_view(request):
    """View for the trip planning form"""
    return render(request, 'pfl_app/itinerary_k_days.html')

@csrf_exempt
def process_trip_plan(request):
    import geopy
    """Process the trip planning form and generate the itinerary"""
    if request.method == 'POST':
        try:
            days_spent = int(request.POST.get('tripDuration'))
            home_point_address = request.POST.get('homePoint')

            # Get coordinates for home point using geopy with increased timeout
            from geopy.geocoders import Nominatim
            geolocator = Nominatim(user_agent="my_trip_planner", timeout=10)  # Increased timeout to 10 seconds
            location = geolocator.geocode(home_point_address)
            
            if not location:
                return JsonResponse({'status': 'error', 'message': 'Could not find coordinates for the provided address'})

            home_point = (str(location.latitude), str(location.longitude))
            home_name = home_point_address

            # Load selected locations
            with open(os.path.join(settings.MEDIA_ROOT, 'selected_locations.json'), 'r', encoding='utf-8') as f:
                selected_locations = json.load(f)

            # Convert locations to the format needed by the clustering algorithm
            locations = {}
            descriptions = {}
            for loc in selected_locations:
                name = loc['name']
                coords = loc['coordinates'].split(',')
                locations[name] = (coords[0], coords[1])
                descriptions[name] = loc['description']

            # Add home point to locations
            locations[home_name] = home_point

            # Perform clustering
            location_clusters = cluster_locations(locations, home_name, home_point, n_clusters=days_spent, enforce_min_cluster_size=True)
            location_clusters = dict(sorted(location_clusters.items()))

            # Process each cluster
            cluster_results = []
            for cluster_name, cluster_data in location_clusters.items():
                route, G = find_optimal_route(cluster_data, home_name)
                route_details, total_distance = calculate_route_details(route, cluster_data)

                # Generate visualization
                import matplotlib.pyplot as plt
                import io
                import base64
                
                plt.figure(figsize=(10, 8))
                visualize_cluster_route(locations, cluster_data, route, cluster_name, home_name)
                
                # Save plot to a bytes buffer
                buf = io.BytesIO()
                plt.savefig(buf, format='png', bbox_inches='tight')
                buf.seek(0)
                plot_data = base64.b64encode(buf.getvalue()).decode('utf-8')
                plt.close()

                cluster_results.append({
                    'cluster_name': cluster_name,
                    'route': route,
                    'route_details': route_details,
                    'total_distance': total_distance,
                    'plot': plot_data
                })

            return JsonResponse({
                'status': 'success',
                'cluster_results': cluster_results,
                'descriptions': descriptions,
                'home_name': home_name
            })

        except Exception as e:
            print(f"Error processing trip plan: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

# Add the clustering and routing functions
import math
import numpy as np
from collections import defaultdict
import matplotlib.pyplot as plt
import networkx as nx
from sklearn.cluster import KMeans

def haversine(coord1, coord2):
    lat1, lon1 = map(float, coord1)
    lat2, lon2 = map(float, coord2)
    R = 6371  # Earth radius in kilometers

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def cluster_locations(locations_dict, home_name, home_point, n_clusters=3, enforce_min_cluster_size=True, max_retries=3):
    """Create clusters of locations, ensuring no cluster has only one location (excluding home), with a retry limit."""
    locations_list = [(name, coords) for name, coords in locations_dict.items() if name != home_name]
    coordinates = np.array([(float(coord[0]), float(coord[1])) for _, coord in locations_list])

    best_clusters = None
    best_invalid_count = float('inf')
    attempts = 0

    while attempts < max_retries:
        attempts += 1
        print(f"Clustering attempt {attempts}...")

        kmeans = KMeans(n_clusters=n_clusters, random_state=np.random.randint(0, 10000))
        labels = kmeans.fit_predict(coordinates)

        clusters = defaultdict(dict)
        for i, (name, coords) in enumerate(locations_list):
            clusters[f"Ngày {labels[i]+1}"][name] = coords

        for cluster in clusters.values():
            cluster[home_name] = home_point

        invalid_clusters = sum(1 for cluster in clusters.values() if len(cluster) == 2)

        if invalid_clusters < best_invalid_count:
            best_clusters = dict(clusters)
            best_invalid_count = invalid_clusters

        if not enforce_min_cluster_size or invalid_clusters == 0:
            break

    if attempts == max_retries and enforce_min_cluster_size and best_invalid_count > 0:
        print(f"Max retries reached ({max_retries}). Using best found clustering.")
        return best_clusters

    return dict(clusters)

def find_optimal_route(locations, home_name):
    """Find optimal route for a set of locations"""
    G = nx.Graph()
    
    for loc1, coord1 in locations.items():
        for loc2, coord2 in locations.items():
            if loc1 != loc2:
                distance = haversine(coord1, coord2)
                G.add_edge(loc1, loc2, weight=distance)

    tsp_path = nx.approximation.traveling_salesman_problem(G, cycle=True)
    
    start_index = tsp_path.index(home_name)
    tsp_path = tsp_path[start_index:] + tsp_path[1:start_index] + [home_name]
    
    return tsp_path, G

def calculate_route_details(path, locations):
    """Calculate and return route details with descriptions"""
    total_distance = 0
    route_details = []

    for i in range(len(path) - 1):
        loc1, loc2 = path[i], path[i + 1]
        coord1, coord2 = locations[loc1], locations[loc2]
        dist = haversine(coord1, coord2)
        total_distance += dist
            
        route_details.append({
            'from': loc1,
            'to': loc2,
            'distance': dist,
            'coords_from': coord1,
            'coords_to': coord2
        })

    return route_details, total_distance

def visualize_cluster_route(all_locations, cluster_locations, path, cluster_name, home_name):
    """Visualize the route for a specific cluster over a real map"""
    # Convert all points to GeoDataFrame
    points = []
    labels = []
    for loc, (lat, lon) in all_locations.items():
        points.append(Point(float(lon), float(lat)))  # (lon, lat)
        labels.append(loc)

    gdf = gpd.GeoDataFrame({'location': labels}, geometry=points, crs="EPSG:4326")
    gdf = gdf.to_crs(epsg=3857)  # Convert to Web Mercator for contextily
    
    # Create a buffer around all points to determine the map extent
    buffer_distance = 2000  # 2km buffer
    bounds = gdf.geometry.buffer(buffer_distance).total_bounds
    
    pos = {row['location']: (row.geometry.x, row.geometry.y) for _, row in gdf.iterrows()}
    
    plt.figure(figsize=(10, 8))
    
    # Draw complete graph
    G = nx.Graph()
    G.add_nodes_from(all_locations.keys())
    for loc1 in all_locations:
        for loc2 in all_locations:
            if loc1 != loc2:
                G.add_edge(loc1, loc2)
    
    nx.draw(G, pos, node_size=0, edge_color='lightgray', width=0.2, alpha=0.2, with_labels=False)

    # Draw cluster locations
    non_cluster = [loc for loc in all_locations if loc not in cluster_locations]
    cluster_nodes = [loc for loc in cluster_locations if loc != home_name]

    nx.draw_networkx_nodes(G, pos, nodelist=non_cluster, node_color='lightgray', node_size=100, alpha=0.6)
    nx.draw_networkx_labels(G, pos, labels={loc: loc for loc in non_cluster}, font_size=13, font_color='gray')

    nx.draw_networkx_nodes(G, pos, nodelist=cluster_nodes, node_color='lightblue', node_size=200)
    nx.draw_networkx_labels(G, pos, labels={loc: loc for loc in cluster_nodes}, font_size=13, font_color='black')

    # Draw route
    if path:
        edges = list(zip(path, path[1:]))
        nx.draw_networkx_edges(G, pos, edgelist=edges, edge_color='red', width=2)

    # Draw home location
    nx.draw_networkx_nodes(G, pos, nodelist=[home_name], node_color='green', node_size=300)
    nx.draw_networkx_labels(G, pos, labels={home_name: home_name}, font_size=13, font_color='black')

    # Add map with adjusted extent
    ax = plt.gca()
    ax.set_xlim(bounds[0], bounds[2])
    ax.set_ylim(bounds[1], bounds[3])
    ctx.add_basemap(ax, crs=gdf.crs.to_string(), source=ctx.providers.CartoDB.Positron)

    plt.axis('off')
    plt.tight_layout()