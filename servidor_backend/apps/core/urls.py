# En: apps/core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Creamos un router
router = DefaultRouter()

# Registramos nuestros ViewSets con el router
# El router se encarga de crear las URLs automáticamente
router.register(r'conductores', views.ConductorViewSet)
router.register(r'vehiculos', views.VehiculoViewSet)
router.register(r'rutas', views.RutaViewSet)
router.register(r'clientes', views.ClienteViewSet)
router.register(r'pedidos', views.PedidoViewSet)
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'productos', views.ProductoViewSet)
router.register(r'detalles-pedido', views.DetallePedidoViewSet)

# Las URLs de la API ahora son generadas automáticamente por el router
urlpatterns = [
    # Incluye todas las URLs del router (como /api/conductores/)
    path('api/', include(router.urls)),
    
    # --- ¡AÑADE ESTA LÍNEA PARA TU VISTA PERSONALIZADA! ---
    path('api/logistica/asignar-ruta/', views.asignar_ruta, name='asignar_ruta'),
]

urlpatterns = [
    # URLs del router (api/conductores/, api/pedidos/, etc.)
    path('api/', include(router.urls)),
    
    # URL de logística (la que ya tenías)
    path('api/logistica/asignar-ruta/', views.asignar_ruta, name='asignar_ruta'),
    
    # --- ¡NUEVA URL DE LOGIN! ---
    path('api/login/', views.login_view, name='login'),
]