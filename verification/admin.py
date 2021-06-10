from django.contrib import admin
from .models import Projects

# Register your models here.
admin.register(Projects)(admin.ModelAdmin)