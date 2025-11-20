# En: apps/core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# 1. Creamos el Router
router = DefaultRouter()

# 2. Registramos TODOS los ViewSets (¡Esto es lo que probablemente faltaba!)
router.register(r'conductores', views.ConductorViewSet)
router.register(r'vehiculos', views.VehiculoViewSet)
router.register(r'rutas', views.RutaViewSet)
router.register(r'clientes', views.ClienteViewSet)
router.register(r'pedidos', views.PedidoViewSet)
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'productos', views.ProductoViewSet)
router.register(r'detalles-pedido', views.DetallePedidoViewSet)

# 3. Definimos las URLs
urlpatterns = [
    # --- URLs automáticas del Router (conductores, productos, etc.) ---
    path('api/', include(router.urls)),
    
    # --- URL personalizada de Logística ---
    path('api/logistica/asignar-ruta/', views.asignar_ruta, name='asignar_ruta'),
    
    # --- URL personalizada de Login ---
    path('api/login/', views.login_view, name='login'),
    
    # --- URL personalizada de Mi Ruta (Conductor) ---
    path('api/mi-ruta/', views.mi_ruta_view, name='mi_ruta'),

     # --- ¡NUEVA URL DE REPORTES! ---
    path('api/reportes/', views.reportes_view, name='reportes'),
]


