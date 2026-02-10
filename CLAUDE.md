# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Django-based tourism/travel recommendation and trip planning application. Users select geographic feature and activity preferences, the system matches Thai provinces/cities, then helps plan multi-day itineraries with optimized routing.

## Commands

```bash
# Activate virtual environment (Windows)
portfolio_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create new migrations after model changes
python manage.py makemigrations pfl_app

# Django shell for DB queries
python manage.py shell

# Collect static files (for deployment)
python manage.py collectstatic
```

## Architecture

**Single Django app (`pfl_app`)** inside project config (`pfl_project/`).

### User Flow

1. **Preference Selection** (`/portfolio/pfl_app/select_preferences/`) — User picks geographic features (beach, mountain, cave, etc.) and tourist activities (nightlife, food, wildlife, etc.) plus travel month
2. **City Matching** — `fetch_match_preferences.py` filters cities against preferences using JSON data files, fetches weather from Open-Meteo API, writes results to `matched_city_data.json`
3. **Results Display** (`/portfolio/results/`) — Shows matched cities with climate data and emoji indicators
4. **Activity Selection** (`/portfolio/select_things_to_do/`) — User picks specific locations from matched results
5. **Trip Planning** (`/portfolio/itinerary_k_days/`) — User sets trip duration and home address; system uses K-means clustering + TSP (NetworkX) to generate optimized daily routes with map visualizations (matplotlib + contextily + geopandas)

### Key Files

- **`pfl_app/views.py`** — All view logic (~625 lines), includes geospatial helpers (haversine, clustering, TSP routing, map visualization)
- **`fetch_match_preferences.py`** — City matching engine, loads JSON data files from `pfl_app/media/` and `pfl_app/static/`, calls Open-Meteo weather API
- **`transform.py`** — Data pipeline utilities: combines climate JSON files, extracts text from PDFs, parses province descriptions
- **`json_to_csv.py`** — Converts JSON data files to Excel format

### Data Files

JSON data files in `pfl_app/media/`:
- `all_cities_geo_features.json` / `all_cities_tourist_activities.json` — Province feature/activity boolean maps
- `place_full_pluscode_long_lat.json` — Location coordinates for route planning
- `ttd_*.json` — "Things to do" location-level data (processed by Copilot)
- `selected_locations.json` — Generated file from user selections

JSON data files in `pfl_app/static/pfl_app/`:
- `combined_climate_data.json` — Monthly climate data by province
- `features_activities_emojis.json` — Emoji display mappings
- `matched_city_data.json` — Generated output from city matching

### URL Routing

Root (`/`) redirects to preference selection. The `member/<member>/<func>/` catch-all pattern dynamically loads templates via `info_template.json` config. The `tao_souvenir/` prefix routes to a separate souvenir shop section with its own templates.

### Template Organization

- `pfl_app/templates/pfl_app/` — Main app templates (base.html, select_preferences, results, itinerary)
- `pfl_app/templates/tao_souvenir/` — Souvenir shop section templates

### Frontend Stack

Bootstrap 4.3.1, jQuery 3.4.1, Themify Icons, custom SCSS in `pfl_app/static/pfl_app/assets/scss/`.

## Key Dependencies

- **Geospatial:** geopandas, shapely, contextily, geopy (Nominatim geocoding), folium
- **Data:** pandas, numpy, scikit-learn (K-means clustering)
- **Graph/Routing:** networkx (TSP approximation)
- **Visualization:** matplotlib
- **Weather API:** openmeteo_requests
- **Production:** gunicorn, whitenoise (static files middleware)

## Database

SQLite (`db.sqlite3`). Models in `pfl_app/models.py`: `UserPreference` (JSONFields for preferences), `ProvinceDescription`, `GeoFeature`, `TouristActivity`, `ClimateData` (monthly weather per province).
