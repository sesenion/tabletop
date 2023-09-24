from .models import Sprite
from rest_framework import serializers

class SpriteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Sprite
        fields = ["id", "name", "x_pos", "y_pos"]
