from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import Projects

class UserSerializer(serializers.ModelSerializer):

	class Meta:
		model = User
		fields = ['id','username']

class ProjectsSerializer(serializers.ModelSerializer):

	class Meta:
		model = Projects
		fields = ['id','title']

class ProjectSerializer(serializers.ModelSerializer):

	class Meta:
		model = Projects
		fields = '__all__'

class Structure(serializers.Serializer):

	moduls = serializers.CharField()