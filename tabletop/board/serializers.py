from .models import Sprite
from rest_framework import serializers


class SpriteSerializer(serializers.HyperlinkedModelSerializer):
    xPos = serializers.IntegerField(source="x_pos")
    yPos = serializers.IntegerField(source="y_pos")

    class Meta:
        model = Sprite
        fields = ["id", "name", "xPos", "yPos"]
