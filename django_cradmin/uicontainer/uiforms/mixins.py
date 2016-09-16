class FieldWrapperRenderableChildMixin(object):
    """
    Mixin class for renderables that are children of :class:`.FieldWrapperRenderable`.
    """
    @property
    def field_wrapper_renderable(self):
        return self.properties['field_wrapper_renderable']


class FormRenderableChildMixin(object):
    @property
    def formrenderable(self):
        return self.properties['formrenderable']
