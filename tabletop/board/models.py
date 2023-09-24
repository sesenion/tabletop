from django.db import models

# Create your models here.
class Sprite(models.Model):
    name = models.CharField(max_length=20, blank=True)
    x_pos = models.IntegerField(default=0)
    y_pos = models.IntegerField(default=0)

