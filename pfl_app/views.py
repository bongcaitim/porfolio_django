from django.shortcuts import render
from django.http import HttpResponse
from django.urls import reverse
from django.template.loader import render_to_string

# Create your views here.
def index(request):
    response_data = render_to_string("pfl_app/index.html")
    return HttpResponse(response_data)