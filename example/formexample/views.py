# Create your views here.
from formexample.models import *
from django.shortcuts import render
from django.http import  HttpResponseRedirect

def freeCropView(request):

    if request.method == 'POST': # If the form has been submitted...

        form = freeCrop(request.POST) # A form bound to the POST data
        if form.is_valid(): # All validation rules pass
            new_event = form.save()
            return HttpResponseRedirect('/cicu-freecrop/?id='+str(new_event.id))

    else:
        if request.GET.get('id',None):
            form = freeCrop(instance=testModel.objects.get(id=request.GET.get('id',None)))
        else:
            form = freeCrop()

    return render(request, 'example/example.html', {
        'form': form,
        })

def fixedRatioView(request):

    if request.method == 'POST': # If the form has been submitted...

        form = fixedRatioCrop(request.POST) # A form bound to the POST data
        if form.is_valid(): # All validation rules pass
            new_event = form.save()
            return HttpResponseRedirect('/cicu-fixedratio/?id='+str(new_event.id))

    else:
        if request.GET.get('id',None):
            form = fixedRatioCrop(instance=testModel.objects.get(id=request.GET.get('id',None)))
        else:
            form = fixedRatioCrop()

    return render(request, 'example/example.html', {
        'form': form,
        })

def warningSizeView(request):

    if request.method == 'POST': # If the form has been submitted...

        form = warningSizeCrop(request.POST) # A form bound to the POST data
        if form.is_valid(): # All validation rules pass
            new_event = form.save()
            return HttpResponseRedirect('/cicu-warningsize/?id='+str(new_event.id))

    else:
        if request.GET.get('id',None):
            form = warningSizeCrop(instance=testModel.objects.get(id=request.GET.get('id',None)))
        else:
            form = warningSizeCrop()

    return render(request, 'example/example.html', {
        'form': form,
        })