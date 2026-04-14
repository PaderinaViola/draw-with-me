from django.urls import path
from . import views

urlpatterns = [
    path('', views.drawings_list),
    path('<int:pk>/', views.drawing_detail),
]