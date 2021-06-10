from django.shortcuts import render
from django.http.response import HttpResponse, HttpResponseRedirect
from django.views.generic.base import View
from django.contrib.auth import authenticate,login
from django.contrib.auth import logout as django_logout
from .forms import LoginForm, RegistrationForm
from .models import Projects
from django.contrib.auth.models import User
from django.views.generic import TemplateView
from django.shortcuts import redirect


class LoginView(View):

	def get(self,request,*args,**kwargs):
		form = LoginForm(request.POST or None)
		context = {'form': form}
		return render(request, 'login.html',context)

	def post(self,request, *args, **kwargs):
		form = LoginForm(request.POST or None)
		if form.is_valid():
			username = form.cleaned_data['username']
			password = form.cleaned_data['password']
			user = authenticate(username=username,password=password)
			if user:
				login(request,user)
				return HttpResponseRedirect('/lk/{}'.format(form.cleaned_data['username']))
		return render(request,'login.html',{'form':form})


class RegistrationView(View):

	def get(self,request,*args,**kwargs):
		form = RegistrationForm(request.POST or None)
		context = {'form': form}
		return render(request, 'registration.html',context)

	def post(self,request, *args, **kwargs):
		form = RegistrationForm(request.POST or None)
		if form.is_valid():
			new_user = form.save(commit=False)
			new_user.username = form.cleaned_data['username']
			new_user.email = form.cleaned_data['email']
			new_user.save()
			new_user.set_password(form.cleaned_data['password'])
			new_user.save()

			user = authenticate(username=form.cleaned_data['username'],password=form.cleaned_data['password'])
			login(request,user)
			return HttpResponseRedirect('/lk/{}'.format(form.cleaned_data['username']))
		return render(request,'registration.html',{'form':form})


def lk(request,username):
	if str(request.user) == username and request.user.is_authenticated:
		return TemplateView.as_view(template_name='index.html')(request)
	else:
		return redirect('/')


def edit(request,username,projectname):
	if str(request.user) == username and request.user.is_authenticated:
		return TemplateView.as_view(template_name='index.html')(request)
	else:
		return redirect('/')


def logout(request):
    django_logout(request)
    return redirect('/')