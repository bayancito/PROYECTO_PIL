# En: djangoproject/urls.py

from django.contrib import admin
from django.urls import path, include  # <-- Asegúrate de importar 'include'
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Esta línea le dice a Django:
    # "Cualquier URL que empiece con 'core/', 
    # envíala al archivo 'apps.core.urls'".
    path('core/', include('apps.core.urls')), 
]
# --- AÑADE ESTO AL FINAL ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)