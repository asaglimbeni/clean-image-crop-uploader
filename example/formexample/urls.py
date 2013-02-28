__author__ = 'asagli'

from django.conf.urls import patterns, url
from formexample.views import *

# Blog patterns.
urlpatterns = patterns("example.views",
    url("^cicu-freecrop/$" , freeCropView, name="cicuExample"),
    url("^cicu-fixedratio/$" , fixedRatioView, name="cicuExample"),
    url("^cicu-warningsize/$" , warningSizeView, name="cicuExample"),
)
