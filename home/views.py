from django.shortcuts import render
from django.conf import settings
from os import walk
from django.http import HttpResponse
from rest_framework.response import Response
from django.utils.encoding import force_text, smart_str
from zipfile import ZipFile, ZIP_DEFLATED
import os
from os.path import basename
from django.shortcuts import redirect
from django.core.files.storage import FileSystemStorage
from django.core.files.uploadhandler import MemoryFileUploadHandler, TemporaryFileUploadHandler
from django.views.decorators.csrf import csrf_exempt 
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from django.contrib.auth.decorators import login_required
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
# Create your views here.

@login_required
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


@csrf_exempt
@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def simple_upload(request):
    print(request.data)

    if request.method == 'POST':
        myfile = request.data
        fs = FileSystemStorage()
        filename = fs.save(myfile['path'], myfile['file'])
        
        return HttpResponse('success')

    return HttpResponse('failed')

def zipfolder(target_dir, foldername): 
    x = target_dir.split('/')
    lenght = len(x)
    concat = ''

    for obj in range(len(x) - 1):
        concat = concat + x[obj]

    zipobj = ZipFile(foldername, 'w', ZIP_DEFLATED)
    rootlen = len(target_dir) + 1

    direcs = []
    filesec = []
    lenmypath = len(concat) + lenght - 1
    
    for root, dirs, files in os.walk(target_dir):
        for f in files:
            filesec.append(os.path.join(root, f)[lenmypath:])
            print(os.path.join(root, f)[lenmypath:])
            zipobj.write(os.path.join(root, f), os.path.join(root, f)[lenmypath:])


@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_file(request):
    file_name = request.GET['filepath']

    path_to_file = settings.MEDIA_ROOT + '/' + file_name

    if os.path.isfile(path_to_file):
        return redirect(f'/media{file_name}')

    x = file_name.split('/')
    lenght = len(x)
    concat = ''
    for obj in range(len(x) - 1):
        concat = concat + x[obj]
    rootlen = len(file_name) + 1
    lenmypath = len(concat) + lenght - 1
    file_name = file_name[lenmypath:]

    print(settings.MEDIA_ROOT + '/zipped' + f'{file_name}.zip')

    if os.path.isdir(path_to_file):
        zipfolder(path_to_file ,settings.MEDIA_ROOT + '/zipped' + f'/{file_name}.zip', )

        print(settings.MEDIA_ROOT + f'{file_name}.zip')
        return redirect(f'/media/zipped/{file_name}.zip')

    if os.path.isfile(path_to_file):
        return redirect(f'/media/{file_name}')


@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def delete_file(request):
    file_name = request.GET['filepath']
    path_to_file = settings.MEDIA_ROOT + '/' + file_name
    os.system(f'rm {path_to_file}')

    return Response('success')