from django.apps import AppConfig
from django.utils.translation import ugettext_lazy


class CradminAppConfig(AppConfig):
    name = 'django_cradmin'
    verbose_name = ugettext_lazy("Django CRadmin")

    def ready(self):
        from django_cradmin.apps.cradmin_kss_styleguide import styleguide_registry
        styleguide = styleguide_registry.IevvBuildstaticStyleGuide(
            unique_id='django_cradmin_theme_default',
            label='Django CRadmin default theme',
            appname='django_cradmin',
            sourcefolder='styles/cradmin_theme_default',
            sourcefile='styleguide.scss',
        )
        styleguide_registry.Registry.get_instance().add(styleguide)