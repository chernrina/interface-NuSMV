from django import forms
from django.contrib.auth.models import User

class LoginForm(forms.ModelForm):

	password = forms.CharField(widget=forms.PasswordInput)

	def __init__(self,*args,**kwargs):
		super().__init__(*args,**kwargs)
		#self.fields['username'].label = 'Логин'
		#self.fields['password'].label = 'Пароль'
		for visible in self.visible_fields():
			visible.field.widget.attrs['class'] = 'form-control'

	def __str__(self):
		return self.as_div()

	def clean(self):
		username = self.cleaned_data['username']
		password = self.cleaned_data['password']

		if not User.objects.filter(username=username).exists():
			raise forms.ValidationError(f'User with login {username} not found.')

		user = User.objects.filter(username=username).first()
		if user:
			if not user.check_password(password):
				raise forms.ValidationError('Wrong password.')
		return self.cleaned_data

	class Meta:
		model = User
		fields = ['username','password']


class RegistrationForm(forms.ModelForm):

	confirm_password = forms.CharField(widget=forms.PasswordInput)
	password = forms.CharField(widget=forms.PasswordInput)
	email = forms.EmailField(required=True)

	def __init__(self,*args,**kwargs):
		super().__init__(*args,**kwargs)
		#self.fields['confirm_password'].label = 'Подтвердите пароль'
		#self.fields['password'].label = 'Пароль'
		#self.fields['username'].label = 'Логин'
		#self.fields['email'].label = 'Электронная почта'
		for visible in self.visible_fields():
			visible.field.widget.attrs['class'] = 'form-control'

	def clean_email(self):
		email = self.cleaned_data['email']
		if User.objects.filter(email=email).exists():
			raise forms.ValidationError(f'Such email is already exists.')

		return email

	def clean_username(self):
		username = self.cleaned_data['username']
		if User.objects.filter(username=username).exists():
			raise forms.ValidationError(f'Name {username} is already exists')
		return username

	def clean(self):
		password = self.cleaned_data['password']
		confirm_password = self.cleaned_data['confirm_password']
		if password != confirm_password:
			raise forms.ValidationError('Password mismatch')
		return self.cleaned_data

	class Meta:
		model = User
		fields = ['username','password','confirm_password','email']
		
		