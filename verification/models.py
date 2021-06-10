from django.db import models
from django.conf import settings


class Projects(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    input_file = models.TextField(blank=True,null=True)
    output_file = models.TextField(blank=True,null=True)
    last_time = models.TextField(null=True)

    def __str__(self):
        return self.title