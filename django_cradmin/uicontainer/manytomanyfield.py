from django.utils.translation import pgettext_lazy

from . import field


class Dropdown(field.BaseFieldRenderable):
    template_name = 'django_cradmin/uicontainer/manytomanyfield/dropdown.django.html'

    def __init__(self, api_url=None, no_items_selected_message=None, **kwargs):
        self._overridden_api_url = api_url
        self._overridden_no_items_selected_message = no_items_selected_message
        super(Dropdown, self).__init__(**kwargs)

    def should_render_as_child_of_label(self):
        return False

    def get_default_api_url(self):
        return None

    def get_default_placeholder(self):
        return pgettext_lazy('django_cradmin foreignkey Dropdown placeholder',
                             'Search to find and select items ...')

    @property
    def api_url(self):
        api_url = self._overridden_api_url or self.get_default_api_url()
        if not api_url:
            raise ValueError('api_url is required. Provide it as a kwargs, or '
                             'override get_default_api_url().')
        return api_url

    def get_default_no_items_selected_message(self):
        return None

    @property
    def no_items_selected_message(self):
        return self._overridden_no_items_selected_message \
               or self.get_default_no_items_selected_message()