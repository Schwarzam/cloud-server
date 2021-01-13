from django.shortcuts import render
from django.conf import settings
from os import walk
from django.http import HttpResponse
from django.utils.encoding import force_text, smart_str
from zipfile import ZipFile, ZIP_DEFLATED
import os
from os.path import basename
from django.shortcuts import redirect
from django.core.files.storage import FileSystemStorage
from django.core.files.uploadhandler import MemoryFileUploadHandler, TemporaryFileUploadHandler
from django.views.decorators.csrf import csrf_exempt 
from rest_framework.decorators import api_view

# Create your views here.

def home(request):
    mypath = settings.MEDIA_ROOT

    if len(request.GET) != 0:
        current = request.GET['dir']
        mypath = mypath + '/' + request.GET['dir']
    else:
        current = ''

    try:
        f = []
        for (dirpath, dirnames, filenames) in walk(mypath):
            f.extend(filenames)
            break

        context={
            'files':f,
            'dirs': dirnames,
            'current': current
            }

    except: 
        context={
            'files':'',
            'dirs': '',
            'current': 'not found'
            }

    return render(request, 'home.html', context)


class NamedMemoryFileUploadHandler(MemoryFileUploadHandler):
    def file_complete(self, file_size):
        in_memory_file = super().file_complete(file_size)
        if in_memory_file is None:
            return
        return in_memory_file, self.file_name


class NamedTemporaryFileUploadHandler(TemporaryFileUploadHandler):
    def file_complete(self, file_size):
        temporary_file = super().file_complete(file_size)
        if temporary_file is None:
            return
        return temporary_file, self.file_name

@csrf_exempt
@api_view(['POST'])
def simple_upload(request):
    print(request.data)

    if request.method == 'POST':
        myfile = request.data
        fs = FileSystemStorage()
        filename = fs.save(myfile['path'], myfile['file'])
        
        return HttpResponse('success')

    return HttpResponse('failed')

def zipfolder(target_dir, foldername):            
    zipobj = ZipFile(foldername, 'w', ZIP_DEFLATED)
    rootlen = len(target_dir) + 1

    direcs = []
    filesec = []
    lenmypath = len(target_dir)
    
    for root, dirs, files in os.walk(target_dir):
        for f in files:
            filesec.append(os.path.join(root, f)[lenmypath:])

            zipobj.write(os.path.join(root, f), os.path.join(root, f)[lenmypath:])


def get_file(request):
    print(request.GET)

    file_name = request.GET['filepath']
    path_to_file = settings.MEDIA_ROOT + '/' + file_name

    if os.path.isdir(path_to_file):
        zipfolder(settings.MEDIA_ROOT + '/dalserver-v0.5' ,settings.MEDIA_ROOT + '/zipped' + f'/{file_name}.zip', )

        print(settings.MEDIA_ROOT + f'/{file_name}.zip')
        return redirect(f'/media/zipped{file_name}.zip')

    if os.path.isfile(path_to_file):
        return redirect(f'/media/{file_name}')
