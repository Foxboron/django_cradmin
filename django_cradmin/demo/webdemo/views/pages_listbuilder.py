from __future__ import unicode_literals
from collections import OrderedDict

from django_cradmin.demo.webdemo.views.pages import PagesQuerySetForRoleMixin, PageCreateView, PageUpdateView, \
    PageDeleteView, PreviewPageView, OrderPagesFilter
from django_cradmin.viewhelpers import listbuilderview
from django_cradmin.viewhelpers import listfilter
from django_cradmin.viewhelpers import listbuilder
from django_cradmin import crapp
from django_cradmin.demo.webdemo.models import Page


class PageListItemValue(listbuilder.itemvalue.FocusBox):
    template_name = 'webdemo/pages_listbuilder/pagelist-itemvalue.django.html'
    valuealias = 'page'


class PagesListBuilderView(PagesQuerySetForRoleMixin, listbuilderview.FilterListMixin, listbuilderview.View):
    """
    Shows how to use listbuilderview with listfilter.
    """
    model = Page
    enable_previews = True
    # listbuilder_class = listbuilder.list.FloatGridList
    value_renderer_class = PageListItemValue
    filterlist_class = listfilter.lists.Horizontal

    # def get_filterlist_position(self):
    #     return 'left'

    def get_filterlist_url(self, filters_string):
        return self.request.cradmin_app.reverse_appurl(
            'filter', kwargs={'filters_string': filters_string})

    def get_post_include_template(self):
        return 'webdemo/pages_listbuilder/pagelist-post-include.django.html'

    def add_filterlist_items(self, filterlist):
        filterlist.append(listfilter.django.single.textinput.Search(
            slug='search',
            label='Search',
            label_is_screenreader_only=True,
            modelfields=['title']))
        filterlist.append(OrderPagesFilter(
            slug='orderby', label='Order by'))
        filterlist.append(listfilter.django.single.select.IsNotNull(
            slug='image', label='Has image?'))
        filterlist.append(listfilter.django.single.select.DateTime(
            slug='publishing_time', label='Publishing time'))

    def get_queryset_for_role(self, site):
        queryset = super(PagesListBuilderView, self).get_queryset_for_role(site=site)
        queryset = self.get_filterlist().filter(queryset)  # Filter by the filter list
        return queryset


class App(crapp.App):
    appurls = [
        crapp.Url(
            r'^$',
            PagesListBuilderView.as_view(),
            name=crapp.INDEXVIEW_NAME),
        crapp.Url(
            r'^filter/(?P<filters_string>.+)?$',
            PagesListBuilderView.as_view(),
            name='filter'),
        crapp.Url(
            r'^create$',
            PageCreateView.as_view(),
            name="create"),
        crapp.Url(
            r'^edit/(?P<pk>\d+)$',
            PageUpdateView.as_view(),
            name="edit"),
        crapp.Url(
            r'^preview/(?P<pk>\d+)?$',
            PreviewPageView.as_view(),
            name="preview"),
        crapp.Url(
            r'^delete/(?P<pk>\d+)$',
            PageDeleteView.as_view(),
            name="delete"),
    ]
