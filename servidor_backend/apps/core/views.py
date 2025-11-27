# En: apps/core/views.py

import math
import datetime
from django.utils import timezone
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDate
from django.contrib.auth import authenticate

from rest_framework import viewsets
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import (
    Conductor, Vehiculo, Ruta, Cliente, Pedido, 
    Categoria, Producto, DetallePedido, Incidencia
)
from .serializers import (
    ConductorSerializer, VehiculoSerializer, RutaSerializer, ClienteSerializer, 
    PedidoSerializer, CategoriaSerializer, ProductoSerializer, DetallePedidoSerializer,
    PedidoConductorSerializer, IncidenciaSerializer
)

# -----------------------------------------------------------------
# VIEWSETS (CRUD Estándar)
# -----------------------------------------------------------------

class ConductorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Conductor.objects.all()
    serializer_class = ConductorSerializer
    
    def perform_destroy(self, instance):
        user_asociado = instance.user
        if user_asociado:
            user_asociado.delete()
        else:
            instance.delete()

class VehiculoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer

class RutaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class PedidoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def perform_update(self, serializer):
        pedido_actualizado = serializer.save()
        if pedido_actualizado.ruta and pedido_actualizado.estado == 'entregado':
            ruta = pedido_actualizado.ruta
            pedidos_pendientes = Pedido.objects.filter(ruta=ruta).exclude(estado='entregado').count()
            if pedidos_pendientes == 0:
                conductor = ruta.conductor
                if conductor:
                    conductor.estado = 'disponible'
                    conductor.save()

class CategoriaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class DetallePedidoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = DetallePedido.objects.all()
    serializer_class = DetallePedidoSerializer


# -----------------------------------------------------------------
# VISTAS PERSONALIZADAS (Lógica de Negocio)
# -----------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_ruta(request):
    try:
        conductor_id = request.data.get('conductor_id')
        pedido_ids = request.data.get('pedido_ids')

        if not conductor_id or not pedido_ids:
            return Response({"error": "Faltan datos."}, status=status.HTTP_400_BAD_REQUEST)

        conductor = Conductor.objects.get(id=conductor_id)
        pedidos_nuevos = list(Pedido.objects.filter(id__in=pedido_ids))

        if not pedidos_nuevos:
            return Response({"error": "Pedidos no encontrados."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Buscar ruta activa
        ruta_actual = Ruta.objects.filter(conductor=conductor).last()
        ruta_activa = None
        if ruta_actual:
            pendientes = Pedido.objects.filter(ruta=ruta_actual).exclude(estado='entregado').exists()
            if pendientes:
                ruta_activa = ruta_actual

        # 2. Punto de partida
        if ruta_activa:
            ultimo_pedido = Pedido.objects.filter(ruta=ruta_activa).last()
            if ultimo_pedido:
                ubicacion_actual = {'lat': float(ultimo_pedido.latitud), 'lng': float(ultimo_pedido.longitud)}
            else:
                ubicacion_actual = {'lat': -17.393879, 'lng': -66.156944}
        else:
            ubicacion_actual = {'lat': -17.393879, 'lng': -66.156944}

        # 3. Algoritmo Vecino Más Cercano
        ruta_ordenada = []
        
        while pedidos_nuevos:
            mas_cercano = None
            distancia_minima = float('inf')

            for pedido in pedidos_nuevos:
                if not pedido.latitud or not pedido.longitud:
                    continue
                
                lat_diff = float(pedido.latitud) - ubicacion_actual['lat']
                lng_diff = float(pedido.longitud) - ubicacion_actual['lng']
                distancia = math.sqrt(lat_diff**2 + lng_diff**2)

                if distancia < distancia_minima:
                    distancia_minima = distancia
                    mas_cercano = pedido

            if mas_cercano:
                ruta_ordenada.append(mas_cercano)
                ubicacion_actual = {'lat': float(mas_cercano.latitud), 'lng': float(mas_cercano.longitud)}
                pedidos_nuevos.remove(mas_cercano)
            else:
                ruta_ordenada.extend(pedidos_nuevos)
                break

        # 4. Guardar
        puntos_nuevos = ""
        for pedido in ruta_ordenada:
            puntos_nuevos += f"({pedido.latitud}, {pedido.longitud}); "

        if ruta_activa:
            ruta_final = ruta_activa
            ruta_final.puntos_de_entrega += puntos_nuevos
            ruta_final.save()
            mensaje = f"Pedidos agregados a la Ruta #{ruta_final.id}."
        else:
            ruta_final = Ruta.objects.create(
                conductor=conductor,
                puntos_de_entrega=puntos_nuevos,
                distancia=10.0, 
                tiempo_estimado=60
            )
            mensaje = f"Nueva Ruta #{ruta_final.id} creada."

        conductor.estado = 'en_ruta'
        conductor.save()
        
        for pedido in ruta_ordenada:
            pedido.ruta = ruta_final
            pedido.estado = 'en_camino'
            pedido.save()

        return Response({"mensaje": mensaje}, status=status.HTTP_201_CREATED)

    except Conductor.DoesNotExist:
        return Response({"error": "Conductor no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mi_ruta_view(request):
    usuario_logueado = request.user
    try:
        conductor = usuario_logueado.conductor
    except AttributeError:
        return Response({"error": "No eres conductor."}, status=status.HTTP_403_FORBIDDEN)

    ultima_ruta = Ruta.objects.filter(conductor=conductor).last()
    if not ultima_ruta:
        return Response({"mensaje": "No tienes rutas asignadas."}, status=status.HTTP_200_OK)

    pedidos = Pedido.objects.filter(ruta=ultima_ruta).exclude(estado='entregado')
    if not pedidos.exists():
         return Response({"mensaje": "Has completado tu ruta."}, status=status.HTTP_200_OK)

    serializer = PedidoConductorSerializer(pedidos, many=True)
    return Response({
        "ruta_id": ultima_ruta.id,
        "conductor": conductor.nombre,
        "origen": {"lat": -17.393879, "lng": -66.156944},
        "pedidos": serializer.data
    })


# --- ESTA ES LA FUNCIÓN QUE TE FALTABA ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics_view(request):
    """
    API para el Dashboard de Reportes.
    """
    hoy = timezone.now().date()
    inicio_mes = hoy.replace(day=1)
    hace_7_dias = hoy - datetime.timedelta(days=7)

    # KPIs
    total_pedidos_mes = Pedido.objects.filter(hora_entrega__gte=inicio_mes).count()
    entregados_mes = Pedido.objects.filter(hora_entrega__gte=inicio_mes, estado='entregado').count()
    tasa_exito = round((entregados_mes / total_pedidos_mes * 100), 1) if total_pedidos_mes > 0 else 0
    
    conductores_activos = Conductor.objects.filter(estado='en_ruta').count()
    conductores_totales = Conductor.objects.count()
    incidencias_pendientes = Incidencia.objects.count()

    # Gráfico Línea
    pedidos_por_dia = (
        Pedido.objects.filter(hora_entrega__date__gte=hace_7_dias)
        .annotate(dia=TruncDate('hora_entrega'))
        .values('dia')
        .annotate(cantidad=Count('id'))
        .order_by('dia')
    )
    grafico_dias_labels = [item['dia'].strftime("%d/%m") for item in pedidos_por_dia]
    grafico_dias_data = [item['cantidad'] for item in pedidos_por_dia]

    # Gráfico Dona
    pendientes = Pedido.objects.filter(estado='pendiente').count()
    en_camino = Pedido.objects.filter(estado='en_camino').count()
    entregados_hoy = Pedido.objects.filter(estado='entregado', hora_entrega__date=hoy).count()

    # Tops
    top_conductores = (
        Conductor.objects
        .annotate(entregas=Count('ruta__pedido', filter=Q(ruta__pedido__estado='entregado')))
        .order_by('-entregas')[:5]
        .values('nombre', 'entregas')
    )
    
    top_productos = (
        DetallePedido.objects
        .values('producto__nombre')
        .annotate(total_vendido=Sum('cantidad'))
        .order_by('-total_vendido')[:5]
    )

    data = {
        "kpis": {
            "total_mes": total_pedidos_mes,
            "tasa_exito": tasa_exito,
            "conductores_activos": conductores_activos,
            "conductores_totales": conductores_totales,
            "incidencias": incidencias_pendientes
        },
        "grafico_dias": {
            "labels": grafico_dias_labels,
            "data": grafico_dias_data
        },
        "grafico_estados": {
            "pendientes": pendientes,
            "en_camino": en_camino,
            "entregados_hoy": entregados_hoy
        },
        "top_conductores": list(top_conductores),
        "top_productos": list(top_productos)
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historial_conductor_view(request):
    try:
        conductor = request.user.conductor
        rutas = Ruta.objects.filter(conductor=conductor)
        pedidos = Pedido.objects.filter(ruta__in=rutas, estado='entregado').order_by('-id')
        serializer = PedidoConductorSerializer(pedidos, many=True)
        return Response(serializer.data)
    except AttributeError:
        return Response({"error": "No eres conductor."}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reportar_incidencia_view(request):
    try:
        conductor = request.user.conductor
        Incidencia.objects.create(
            conductor=conductor,
            tipo=request.data.get('tipo'),
            descripcion=request.data.get('descripcion')
        )
        return Response({"mensaje": "Reportado."}, status=status.HTTP_201_CREATED)
    except AttributeError:
        return Response({"error": "No eres conductor."}, status=status.HTTP_403_FORBIDDEN)

# En: apps/core/views.py

# ... (tus otras vistas) ...

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reportes_view(request):
    """Dashboard de estadísticas y gráficos."""
    hoy = timezone.now().date()
    inicio_mes = hoy.replace(day=1)
    hace_7_dias = hoy - datetime.timedelta(days=7)

    # KPIs
    total_entregados = Pedido.objects.filter(estado='entregado').count()
    total_pendientes = Pedido.objects.filter(estado='pendiente').count()
    total_en_camino = Pedido.objects.filter(estado='en_camino').count()
    conductores_libres = Conductor.objects.filter(estado='disponible').count()
    conductores_ocupados = Conductor.objects.filter(estado='en_ruta').count()
    
    incidencias = Incidencia.objects.count()

    # Gráfico Línea (7 días)
    pedidos_por_dia = (
        Pedido.objects.filter(hora_entrega__date__gte=hace_7_dias)
        .annotate(dia=TruncDate('hora_entrega'))
        .values('dia')
        .annotate(cantidad=Count('id'))
        .order_by('dia')
    )
    grafico_dias_labels = [item['dia'].strftime("%d/%m") for item in pedidos_por_dia]
    grafico_dias_data = [item['cantidad'] for item in pedidos_por_dia]

    # Gráfico Dona (Estados actuales)
    pendientes = Pedido.objects.filter(estado='pendiente').count()
    en_camino = Pedido.objects.filter(estado='en_camino').count()
    entregados_hoy = Pedido.objects.filter(estado='entregado', hora_entrega__date=hoy).count()

    # Top Conductores
    top_conductores = (
        Conductor.objects
        .annotate(entregas=Count('ruta__pedido', filter=Q(ruta__pedido__estado='entregado')))
        .order_by('-entregas')[:5]
        .values('nombre', 'entregas')
    )
    
    # Top Productos
    top_productos = (
        DetallePedido.objects
        .values('producto__nombre')
        .annotate(total_vendido=Sum('cantidad'))
        .order_by('-total_vendido')[:5]
    )

    data = {
        "kpis": {
            "total_mes": total_entregados + total_pendientes + total_en_camino,
            "tasa_exito": 95, # Simulado o calculado
            "conductores_activos": conductores_ocupados,
            "conductores_totales": conductores_libres + conductores_ocupados,
            "incidencias": incidencias
        },
        "grafico_dias": {
            "labels": grafico_dias_labels,
            "data": grafico_dias_data
        },
        "grafico_estados": {
            "pendientes": pendientes,
            "en_camino": en_camino,
            "entregados_hoy": entregados_hoy
        },
        "top_conductores": list(top_conductores),
        "top_productos": list(top_productos)
    }
    return Response(data, status=status.HTTP_200_OK)

# -----------------------------------------------------------------
# LOGIN
# -----------------------------------------------------------------

@authentication_classes([]) 
@permission_classes([AllowAny]) 
@api_view(['POST', 'OPTIONS'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        rol = 'admin'
        if hasattr(user, 'conductor'):
            rol = 'conductor'
        return Response({'token': token.key, 'rol': rol}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)