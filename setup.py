__author__ = 'Alfredo Saglimbeni'

from distutils.core import setup
from setuptools import setup, find_packages

setup(name = "clean-image-crop-uploader",
    version = "0.2.2",
    description = "Clean Image Crop Uploader (CICU) provides AJAX file upload and image CROP functionalities for ImageFields with a simple widget replacement in the form. It use Modal from twitter-bootstrap.",
    long_description=open('README.rst').read(),
    author = "asagli",
    author_email = "alfredo.saglimbeni@gmail.com",
    url = "",
    packages = find_packages(),
    include_package_data=True,
    install_requires = [
        'Pillow','django>=1.4.3','south>=0.7.6'
        ],
    classifiers = [
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules',
        ],
)
