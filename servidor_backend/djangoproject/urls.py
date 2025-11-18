# En: djangoproject/urls.py

from django.contrib import admin
from django.urls import path, include  # <-- Asegúrate de importar 'include'

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Esta línea le dice a Django:
    # "Cualquier URL que empiece con 'core/', 
    # envíala al archivo 'apps.core.urls'".
    path('core/', include('apps.core.urls')), 
]