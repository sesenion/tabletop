from typing import Any
from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Sprite
from rest_framework.reverse import reverse
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import SpriteSerializer


@api_view(["GET"])
def api_root(request, format=None):
    return Response(
        {
            "users": reverse("user-list", request=request, format=format),
            "snippets": reverse("snippet-list", request=request, format=format),
        }
    )


class SpriteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Sprites
    """

    queryset = Sprite.objects.all()
    serializer_class = SpriteSerializer
    permission_classes = [permissions.IsAuthenticated]


class IndexView(
    LoginRequiredMixin,
    TemplateView,
):
    template_name = "board/index.html"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        return {}
