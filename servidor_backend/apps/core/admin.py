from django.contrib import admin
# Asegúrate de importar los nuevos modelos
from .models import Conductor, Vehiculo, Ruta, Cliente, Pedido, Categoria, Producto, DetallePedido

# (Tus registros existentes están aquí)
admin.site.register(Conductor)
admin.site.register(Vehiculo)
admin.site.register(Ruta)
admin.site.register(Cliente)
admin.site.register(Pedido)

# --- AÑADE ESTOS ---
admin.site.register(Categoria)
admin.site.register(Producto)
admin.site.register(DetallePedido)