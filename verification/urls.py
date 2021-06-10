from django.urls import path
from verification import views
from django.views.generic import TemplateView
from django.contrib.auth.views import LogoutView

urlpatterns = [    
    path('', TemplateView.as_view(template_name='index.html')),    
    path('login/', views.LoginView.as_view(), name='login'),
    path('registration/', views.RegistrationView.as_view(), name='registration'),
    path('edit/<str:username>/<str:projectname>', views.edit),
    path('lk/<str:username>',views.lk),
    path('logout/',views.logout,name='logout')
]