from django.urls import path

from rest_framework import routers
from .views import UserViewSet, ProjectViewSet, ProjectsViewSet, getProjectViewSet, UserIdViewSet, parse_smv_file, launch, visualization, create_smv_file

router = routers.SimpleRouter()
router.register('user',UserViewSet,basename='user')
router.register('projects',ProjectViewSet,basename='project')


urlpatterns = [
	path('project/<str:user>',ProjectsViewSet.as_view({"get": "get"}), name='project'),
	path('project/<str:user>/<str:project>',getProjectViewSet.as_view({"get": "get","post":"post"}), name='getProject'),
	path('user/<str:user>',UserIdViewSet.as_view({"get": "get"}), name='project'),
	path('launch', launch, name='launch'),
	path('visualization', visualization, name='visualization'),
	path('generation/<str:username>/<str:projectname>',create_smv_file, name='generation'),
	path('parse', parse_smv_file, name='parse'),
]
urlpatterns += router.urls
