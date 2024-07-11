from django.shortcuts import render,redirect
import json
import os 

# Create your views here.
def member(requests,member,func):
	with open(os.path.join(r"pfl_app\templates",f"{member}\info_template.json"), 'r', encoding='utf-8') as file:
		INFO_TEMPLATE = json.load(file)
	context = {member:member,func:func}
	template = INFO_TEMPLATE[str(func).lower()]
	return render(requests, template, context)