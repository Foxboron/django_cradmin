from django.conf.urls import include, url


urlpatterns = [
    url(r'^cradmin_authenticate/', include('django_cradmin.apps.cradmin_authenticate.urls')),
    url(r'^cradmin_resetpassword/', include('django_cradmin.apps.cradmin_resetpassword.urls')),
    url(r'^cradmin_activate_account/', include('django_cradmin.apps.cradmin_activate_account.urls')),
    url(r'^cradmin_register_account/', include('django_cradmin.apps.cradmin_register_account.urls')),
]
