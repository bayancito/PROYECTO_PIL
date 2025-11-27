# En: apps/core/serializers.py

from rest_framework import serializers
# Asegúrate de importar todos los modelos, incluido User
from django.contrib.auth.models import User
from .models import Conductor, Vehiculo, Ruta, Cliente, Pedido, Categoria, Producto, DetallePedido, Incidencia

# --- SERIALIZADORES SIMPLES ---

class ConductorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    class Meta:
        model = Conductor
        fields = ['id', 'nombre', 'licencia', 'telefono', 'placa_vehiculo', 'estado', 'username', 'password']
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=username, password=password)
        conductor = Conductor.objects.create(user=user, **validated_data)
        return conductor

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

# --- SERIALIZADORES COMPLEJOS (PEDIDOS) ---

class DetallePedidoSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.ReadOnlyField(source='producto.nombre')
    class Meta:
        model = DetallePedido
        fields = ['id', 'producto', 'nombre_producto', 'cantidad', 'precio_unitario']

class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    conductor_asignado = serializers.ReadOnlyField(source='ruta.conductor.nombre')
    
    # Campos de lectura del cliente
    nombre_cliente = serializers.ReadOnlyField(source='cliente.nombre_cliente')
    telefono_cliente = serializers.ReadOnlyField(source='cliente.telefono')

    # Campos de escritura opcionales para nuevo cliente
    nombre_nuevo_cliente = serializers.CharField(write_only=True, required=False, allow_blank=True)
    telefono_nuevo_cliente = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Pedido
        extra_kwargs = {'cliente': {'required': False, 'allow_null': True}}
        fields = [
            'id', 'cliente', 'nombre_cliente', 'telefono_cliente',
            'estado', 'detalles', 'latitud', 'longitud', 'conductor_asignado',
            'nombre_nuevo_cliente', 'telefono_nuevo_cliente'
        ]

    def create(self, validated_data):
        # 1. Sacar los datos que no van directos al modelo Pedido
        detalles_data = validated_data.pop('detalles')
        nombre_nuevo = validated_data.pop('nombre_nuevo_cliente', None)
        telefono_nuevo = validated_data.pop('telefono_nuevo_cliente', "")
        
        lat = validated_data.get('latitud')
        lon = validated_data.get('longitud')
        cliente = validated_data.get('cliente')

        # 2. Lógica de Cliente
        if not cliente and nombre_nuevo:
            # Crear cliente nuevo
            cliente = Cliente.objects.create(
                nombre_cliente=nombre_nuevo,
                telefono=telefono_nuevo,
                direccion=f"Ubicación GPS: {lat}, {lon}",
                email="",
                latitud=lat,
                longitud=lon
            )
            validated_data['cliente'] = cliente
        
        elif cliente:
            # Actualizar ubicación de cliente existente si no tiene
            if not cliente.latitud or not cliente.longitud:
                cliente.latitud = lat
                cliente.longitud = lon
                cliente.save()
        
        # Validación manual
        if not validated_data.get('cliente'):
             raise serializers.ValidationError({"cliente": "Debe seleccionar un cliente o crear uno nuevo."})

        # 3. Crear el Pedido
        pedido = Pedido.objects.create(**validated_data)
        
        # 4. Crear los detalles
        for detalle_data in detalles_data:
            DetallePedido.objects.create(pedido=pedido, **detalle_data)
            
        # --- ¡ESTA ES LA LÍNEA QUE FALTABA O ESTABA MAL! ---
        return pedido 

# Serializador para la vista del Conductor
class PedidoConductorSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    nombre_cliente = serializers.ReadOnlyField(source='cliente.nombre_cliente')
    telefono_cliente = serializers.ReadOnlyField(source='cliente.telefono')
    direccion_texto = serializers.ReadOnlyField(source='cliente.direccion')

    class Meta:
        model = Pedido
        fields = ['id', 'estado', 'latitud', 'longitud', 'detalles', 'nombre_cliente', 'telefono_cliente', 'direccion_texto']

class IncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidencia
        fields = ['id', 'tipo', 'descripcion', 'fecha_reporte']