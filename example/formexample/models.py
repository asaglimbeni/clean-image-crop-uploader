from django.db import models

# Create your models here.

from django import forms
from cicu.widgets import CicuUploaderInput
from example.settings import MEDIA_ROOT

class testModel (models.Model):
    image = models.ImageField(verbose_name="Main image", null=True, blank=True, upload_to=MEDIA_ROOT, max_length=300)

class freeCrop(forms.ModelForm):
    class Meta:
        model = testModel
        cicuOptions = {
            'ratioWidth': '', #if image need to have fix-width ratio
            'ratioHeight':'', #if image need to have fix-height ratio
            'sizeWarning': 'False', #if True the crop selection have to respect minimal ratio size defined above.
        }
        widgets = {
            'image': CicuUploaderInput(options=cicuOptions)
        }

class fixedRatioCrop(forms.ModelForm):
    class Meta:
        model = testModel
        cicuOptions = {
            'ratioWidth': '800', #if image need to have fix-width ratio
            'ratioHeight': '600', #if image need to have fix-height ratio
            'sizeWarning': 'False', #if True the crop selection have to respect minimal ratio size defined above.
        }
        widgets = {
            'image': CicuUploaderInput(options=cicuOptions)
        }

class warningSizeCrop(forms.ModelForm):
    class Meta:
        model = testModel
        cicuOptions = {
            'ratioWidth': '100', #if image need to have fix-width ratio
            'ratioHeight': '50', #if image need to have fix-height ratio
            'sizeWarning': 'True', #if True the crop selection have to respect minimal ratio size defined above.
        }
        widgets = {
            'image': CicuUploaderInput(options=cicuOptions)
        }
