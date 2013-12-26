from django.http import HttpResponse, HttpResponseBadRequest
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.files import File
from PIL import Image
from os import path, sep, makedirs
from .forms import UploadedFileForm
from .models import UploadedFile
from .settings import IMAGE_CROPPED_UPLOAD_TO
from django.conf import settings


@csrf_exempt
@require_POST
def upload(request):
    form = UploadedFileForm(data=request.POST, files=request.FILES)
    if form.is_valid():
        uploaded_file = form.save()
        # pick an image file you have in the working directory
        # (or give full path name)
        img = Image.open(uploaded_file.file.path, mode='r')
        # get the image's width and height in pixels
        width, height = img.size
        data = {
            'path': uploaded_file.file.url,
            'id' : uploaded_file.id,
            'width' : width,
            'height' : height,
        }
        return HttpResponse(simplejson.dumps(data))
    else:
        return HttpResponseBadRequest(simplejson.dumps({'errors': form.errors}))

@csrf_exempt
@require_POST
def crop(request):
    try:
        if request.method == 'POST':
            box = request.POST.get('cropping', None)
            imageId = request.POST.get('id', None)
            uploaded_file = UploadedFile.objects.get(id=imageId)
            img = Image.open( uploaded_file.file.path, mode='r' )
            values = [int(x) for x in box.split(',')]

            width = abs(values[2] - values[0])
            height = abs(values[3] - values[1])
            if width and height and (width != img.size[0] or height != img.size[1]):
                croppedImage = img.crop(values).resize((width,height),Image.ANTIALIAS)

            else:
                raise

            pathToFile = path.join(settings.MEDIA_ROOT,IMAGE_CROPPED_UPLOAD_TO)
            if not path.exists(pathToFile):
                makedirs(pathToFile)
            pathToFile = path.join(pathToFile,uploaded_file.file.path.split(sep)[-1])
            croppedImage.save(pathToFile)

            new_file = UploadedFile()
            f = open(pathToFile, mode='rb')
            new_file.file.save(uploaded_file.file.name, File(f))
            f.close()

            data = {
                'path': new_file.file.url,
                'id' : new_file.id,
            }

            return HttpResponse(simplejson.dumps(data))

    except Exception:
        return HttpResponseBadRequest(simplejson.dumps({'errors': 'illegal request'}))
