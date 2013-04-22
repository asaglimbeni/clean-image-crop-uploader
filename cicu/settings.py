from django.conf import settings


# Number of seconds to keep uploaded files. The clean_uploaded command will
# delete them after this has expired.
UPLOADER_DELETE_AFTER = getattr(settings, 'UPLOADER_DELETE_AFTER', 60 * 60)
IMAGE_CROPPED_UPLOAD_TO = getattr(settings, 'IMAGE_CROPPED_UPLOAD_TO', 'cicu_cropped/')
