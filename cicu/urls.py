from django.conf.urls import patterns, url


urlpatterns = patterns('cicu.views',
    url(r'^$', 'upload', name='ajax-upload'),
    url(r'^crop/$', 'crop', name='cicu-crop'),
)
