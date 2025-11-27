from django.db import models
from django.contrib.auth.models import User

class Conductor(models.Model):
    # Vinculamos al conductor con un usuario de login
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    
    nombre = models.CharField(max_length=255)
    licencia = models.CharField(max_length=50, unique=True)
    
    # --- NUEVOS CAMPOS SOLICITADOS ---
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name="Celular")
    placa_vehiculo = models.CharField(max_length=20, blank=True, null=True, verbose_name="Placa del Vehículo")
    # ---------------------------------
    
    estado = models.CharField(max_length=50, default='disponible')

    def __str__(self):
        return f"{self.nombre} ({self.placa_vehiculo})"

# --- (El resto de tus modelos se mantienen igual, cópialos aquí abajo) ---
class Vehiculo(models.Model):
    placa = models.CharField(max_length=10, primary_key=True)
    tipo = models.CharField(max_length=50)
    capacidad = models.IntegerField()
    ruta_asignada = models.ForeignKey('Ruta', on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self): return self.placa

class Ruta(models.Model):
    conductor = models.ForeignKey(Conductor, on_delete=models.CASCADE, null=True, blank=True)
    puntos_de_entrega = models.TextField()
    distancia = models.DecimalField(max_digits=10, decimal_places=2)
    tiempo_estimado = models.IntegerField()
    def __str__(self): return f"Ruta {self.id}"

class Cliente(models.Model):
    nombre_cliente = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(max_length=254, blank=True)
    direccion = models.CharField(max_length=500)
    latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    def __str__(self): return self.nombre_cliente

class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    direccion = models.CharField(max_length=500)
    latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    estado = models.CharField(max_length=50, default='pendiente')
    hora_entrega = models.DateTimeField(null=True, blank=True)
    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self): return f"Pedido {self.id}"

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    def __str__(self): return self.nombre

class Producto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    def __str__(self): return self.nombre

class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self): return f"Detalle {self.id}"

class Incidencia(models.Model):
    conductor = models.ForeignKey(Conductor, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50)
    descripcion = models.TextField()
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"Incidencia {self.id}"