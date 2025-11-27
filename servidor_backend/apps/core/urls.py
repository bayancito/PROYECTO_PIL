from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'conductores', views.ConductorViewSet)
router.register(r'vehiculos', views.VehiculoViewSet)
router.register(r'rutas', views.RutaViewSet)
router.register(r'clientes', views.ClienteViewSet)
router.register(r'pedidos', views.PedidoViewSet)
router.register(r'categorias', views.CategoriaViewSet)  
router.register(r'productos', views.ProductoViewSet)
router.register(r'detalles-pedido', views.DetallePedidoViewSet)


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/logistica/asignar-ruta/', views.asignar_ruta, name='asignar_ruta'),
    path('api/login/', views.login_view, name='login'),
    path('api/mi-ruta/', views.mi_ruta_view, name='mi_ruta'),
    path('api/reportes/', views.reportes_view, name='reportes'),
    # En apps/core/urls.py
    path('api/reportes/dashboard/', views.dashboard_analytics_view, name='dashboard_analytics'),
    # --- NUEVAS RUTAS ---
    path('api/conductor/historial/', views.historial_conductor_view, name='historial_conductor'),
    path('api/conductor/incidencia/', views.reportar_incidencia_view, name='reportar_incidencia'),
]