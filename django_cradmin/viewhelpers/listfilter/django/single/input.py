from django.db import models

from django.utils.translation import ugettext_lazy

from django_cradmin.viewhelpers.listfilter.basefilters.single import abstractinput

from django_cradmin.viewhelpers.listfilter.django.base import DjangoOrmFilterMixin


class Search(abstractinput.AbstractSearch, DjangoOrmFilterMixin):
    def __init__(self, *args, **kwargs):
        """
        Parameters are the same as for
        :class:`django_cradmin.viewhelpers.listfilter.base.abstractfilter.AbstractFilter`,
        but you can specify one extra parameter:

            - modelfields: List of model fields to search on.
        """
        self.modelfields = kwargs.pop('modelfields', None)
        super(Search, self).__init__(*args, **kwargs)

    def get_modelfields(self):
        """
        Returns a list of the model fields you want to search on.

        Defaults to the ``modelfields`` parameter for :class:`.Search`.
        """
        if self.modelfields:
            return self.modelfields
        else:
            raise NotImplementedError('You must override get_modelfields() or use the modelfields parameter.')

    def build_query(self, modelfields, cleaned_value):
        full_query = None
        for modelfield in modelfields:
            kwargs = {'{}__icontains'.format(modelfield): cleaned_value}
            query = models.Q(**kwargs)
            if full_query:
                full_query |= query
            else:
                full_query = query
        return full_query

    def filter(self, queryobject):
        modelfields = self.get_modelfields()
        cleaned_value = self.get_cleaned_value()
        if cleaned_value:
            queryobject = queryobject.filter(self.build_query(
                modelfields=modelfields, cleaned_value=cleaned_value))
        return queryobject