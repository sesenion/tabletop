from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r"sprites", views.SpriteViewSet, basename="sprite")

urlpatterns = [
    path("api/", include(router.urls)),
    path("", views.IndexView.as_view()),
]
