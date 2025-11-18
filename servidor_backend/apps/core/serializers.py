# En: apps/core/serializers.py (NUEVO ARCHIVO)

from rest_framework import serializers
from .models import Conductor, Vehiculo, Ruta, Cliente, Pedido, Categoria, Producto, DetallePedido

# El Serializer le dice a DRF qué campos del modelo
# debe incluir en la respuesta JSON.

class ConductorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conductor
        fields = '__all__'  # '__all__' significa "incluye todos los campos"

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'

class RutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'



class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

# --- MODIFICACIÓN IMPORTANTE ---
# Este serializer ahora será usado "dentro" del PedidoSerializer
class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = ['producto', 'cantidad', 'precio_unitario']


class PedidoSerializer(serializers.ModelSerializer):
    # "detalles" es el nombre que usamos en React
    detalles = DetallePedidoSerializer(many=True)

    class Meta:
        model = Pedido
        # --- ¡ASEGÚRATE DE QUE LOS CAMPOS ESTÉN AQUÍ! ---
        fields = ['id', 'cliente', 'estado', 'detalles', 'latitud', 'longitud']

    def create(self, validated_data):
        # Extraemos los datos de los detalles
        detalles_data = validated_data.pop('detalles')
        
        # Creamos el objeto 'Pedido' principal (incluyendo lat y lon)
        pedido = Pedido.objects.create(**validated_data)
        
        # Creamos los detalles vinculados al pedido
        for detalle_data in detalles_data:
            DetallePedido.objects.create(pedido=pedido, **detalle_data)
            
        return pedido