from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Drawing

@api_view(['GET', 'POST'])
def drawings_list(request):
    if request.method == 'GET':
        drawings = Drawing.objects.all().order_by('-created_at')
        data = [{'id': d.id, 'title': d.title, 'created_at': str(d.created_at)} for d in drawings]
        return Response(data)
    if request.method == 'POST':
        title = request.data.get('title', 'Untitled')
        strokes = request.data.get('data', [])
        drawing = Drawing.objects.create(title=title, data=strokes)
        return Response({'id': drawing.id, 'title': drawing.title}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def drawing_detail(request, pk):
    try:
        drawing = Drawing.objects.get(pk=pk)
    except Drawing.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response({'id': drawing.id, 'title': drawing.title, 'data': drawing.data})