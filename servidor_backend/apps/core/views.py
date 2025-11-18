# En: apps/core/views.py

print("¡HOLA MUNDO! El archivo views.py se ha recargado.") # (Puedes borrar esto si quieres)

from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated # <-- IMPORTADO

from .models import Conductor, Vehiculo, Ruta, Cliente, Pedido, Categoria, Producto, DetallePedido
from .serializers import (
    ConductorSerializer, VehiculoSerializer, RutaSerializer, ClienteSerializer, 
    PedidoSerializer, CategoriaSerializer, ProductoSerializer, DetallePedidoSerializer
)

# -----------------------------------------------------------------
# TUS VIEWSETS (¡AHORA PROTEGIDOS MANUALMENTE!)
# -----------------------------------------------------------------

class ConductorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = Conductor.objects.all()
    serializer_class = ConductorSerializer

class VehiculoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer

class RutaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class PedidoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class DetallePedidoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # <-- ¡PROTEGIDO!
    queryset = DetallePedido.objects.all()
    serializer_class = DetallePedidoSerializer
    
# -----------------------------------------------------------------
# VISTA DE LOGÍSTICA (¡TAMBIÉN DEBE PROTEGERSE!)
# -----------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # <-- ¡PROTEGIDO!
def asignar_ruta(request):
    # ... (tu lógica de asignar ruta va aquí)
    # ... (no es necesario copiarla, solo asegúrate de añadir el decorador)
    try:
        conductor_id = request.data.get('conductor_id')
        pedido_ids = request.data.get('pedido_ids')
        if not conductor_id or not pedido_ids:
            return Response({"error": "Se requieren 'conductor_id' y 'pedido_ids'."}, status=status.HTTP_400_BAD_REQUEST)
        conductor = Conductor.objects.get(id=conductor_id)
        pedidos_para_asignar = Pedido.objects.filter(id__in=pedido_ids)
        puntos = ""
        total_distancia = 0.0
        for pedido in pedidos_para_asignar:
            puntos += f"({pedido.latitud}, {pedido.longitud}); "
            total_distancia += 10.0
        nueva_ruta = Ruta.objects.create(puntos_de_entrega=puntos, distancia=total_distancia, tiempo_estimado=60)
        conductor.estado = 'en_ruta'
        conductor.save()
        for pedido in pedidos_para_asignar:
            pedido.ruta = nueva_ruta
            pedido.estado = 'en_camino'
            pedido.save()
        return Response({"mensaje": f"Ruta {nueva_ruta.id} creada y asignada a {conductor.nombre}."}, status=status.HTTP_201_CREATED)
    except Conductor.DoesNotExist:
        return Response({"error": "Conductor no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
# -----------------------------------------------------------------
# VISTA DE LOGIN (¡PÚBLICA!)
# -----------------------------------------------------------------
# (Como la regla global ya no existe, estos decoradores 
#  aseguran que esta vista sea 100% pública)

# En: apps/core/views.py
# (Asegúrate de tener 'from .models import Conductor' al inicio del archivo)

# ... (tus ViewSets y 'asignar_ruta' van aquí) ...

@authentication_classes([]) 
@permission_classes([AllowAny]) 
@api_view(['POST', 'OPTIONS'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        # ¡LÓGICA DE ROL MEJORADA!
        token, created = Token.objects.get_or_create(user=user)
        
        # 1. Por defecto, asumimos que es un admin
        rol = 'admin' 
        
        # 2. Intentamos buscar un Conductor vinculado a este usuario
        try:
            # Revisa si existe un objeto Conductor donde el
            # campo 'user' sea el usuario que acaba de iniciar sesión
            if hasattr(user, 'conductor'): # 'conductor' es el nombre de la relación
                rol = 'conductor'
        except Conductor.DoesNotExist:
            pass # Si no existe, sigue siendo 'admin'

        # 3. Devolvemos el token Y el rol
        return Response(
            {'token': token.key, 'rol': rol}, # <-- ¡AHORA DEVUELVE EL ROL!
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {'error': 'Credenciales inválidas'}, 
            status=status.HTTP_400_BAD_REQUEST
        )