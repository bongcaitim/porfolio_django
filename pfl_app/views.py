# from django.shortcuts import render,redirect
# import json
# import os 

# # Create your views here.
# def member(requests,member,func):
# 	with open(os.path.join(r"pfl_app\templates",f"{member}\info_template.json"), 'r', encoding='utf-8') as file:
# 		INFO_TEMPLATE = json.load(file)
# 	context = {member:member,func:func}
# 	template = INFO_TEMPLATE[str(func).lower()]
# 	return render(requests, template, context)

from django.shortcuts import render, redirect
from django.core.files.storage import FileSystemStorage
import json
import os

# # Create your views here.
# def member(requests, member, func):
#     if requests.method == 'POST' and requests.FILES:
#         uploaded_files = requests.FILES.getlist('uploaded_file')  # Get the uploaded files
#         fs = FileSystemStorage()  # Create a FileSystemStorage instance

#         for file in uploaded_files:
#             filename = fs.save(file.name, file)  # Save the file
#             uploaded_file_url = fs.url(filename)  # Get the URL for the saved file

#             # You can do something with the uploaded_file_url if needed

#     # Load the JSON template configuration
#     with open(os.path.join(r"pfl_app\templates", f"{member}\info_template.json"), 'r', encoding='utf-8') as file:
#         INFO_TEMPLATE = json.load(file)

#     context = {member: member, func: func}
#     template = INFO_TEMPLATE[str(func).lower()]
#     return render(requests, template, context)

import os
import json
from django.core.files.storage import FileSystemStorage
from django.shortcuts import render

def member(request, member, func):
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

    # Load JSON template configuration
    json_path = os.path.join("pfl_app", "templates", f"{member}", "info_template.json")
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            INFO_TEMPLATE = json.load(file)
        template_name = INFO_TEMPLATE.get(func.lower(), 'pfl_app/default_template.html')  # Fallback to a default if func not found
    except FileNotFoundError:
        return render(request, 'pfl_app/error_template.html', {'error': 'Template configuration not found.'})

    return render(request, template_name, context)
