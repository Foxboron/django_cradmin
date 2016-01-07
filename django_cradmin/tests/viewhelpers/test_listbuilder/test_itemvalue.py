from django import test
from django.core.files.base import ContentFile
from django_cradmin.apps.cradmin_imagearchive.tests.helpers import create_image
import htmls
from model_mommy import mommy

from django_cradmin.viewhelpers import listbuilder
from django_cradmin.python2_compatibility import mock


class TestTitleDescription(test.TestCase):
    def test_title(self):
        rendered = listbuilder.itemvalue.TitleDescription(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'testvalue',
            selector.one('.django-cradmin-listbuilder-itemvalue-titledescription-title').alltext_normalized)

    def test_without_description(self):
        rendered = listbuilder.itemvalue.TitleDescription(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertFalse(
            selector.exists('.django-cradmin-listbuilder-itemvalue-titledescription-description'))

    def test_with_description(self):
        class MyEditDelete(listbuilder.itemvalue.TitleDescription):
            def get_description(self):
                return 'The description'
        rendered = MyEditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'The description',
            selector.one('.django-cradmin-listbuilder-itemvalue-titledescription-description').alltext_normalized)


class TestEditDelete(test.TestCase):
    def test_title(self):
        rendered = listbuilder.itemvalue.EditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'testvalue',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-title').alltext_normalized)

    def test_without_description(self):
        rendered = listbuilder.itemvalue.EditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertFalse(
            selector.exists('.django-cradmin-listbuilder-itemvalue-editdelete-description'))

    def test_with_description(self):
        class MyEditDelete(listbuilder.itemvalue.EditDelete):
            def get_description(self):
                return 'The description'
        rendered = MyEditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'The description',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-description').alltext_normalized)

    def test_edit_label(self):
        rendered = listbuilder.itemvalue.EditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'Edit',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-editbutton').alltext_normalized)

    def test_edit_aria_label(self):
        rendered = listbuilder.itemvalue.EditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'Edit "testvalue"',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-editbutton')['aria-label'])

    def test_delete_label(self):
        rendered = listbuilder.itemvalue.EditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'Delete',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-deletebutton').alltext_normalized)

    def test_delete_aria_label(self):
        rendered = listbuilder.itemvalue.EditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertEqual(
            'Delete "testvalue"',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-deletebutton')['aria-label'])

    def test_viewbutton_not_rendered(self):
        rendered = listbuilder.itemvalue.EditDelete(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertFalse(
            selector.exists('.django-cradmin-listbuilder-itemvalue-editdelete-viewbutton'))


class TestEditDeleteWithPreview(test.TestCase):
    def test_preview_label(self):
        mockrequest = mock.MagicMock()
        mockrequest.cradmin_app.reverse_appurl.return_value = '/preview'
        rendered = listbuilder.itemvalue.EditDeleteWithPreview(value='testvalue')\
            .render(request=mockrequest)
        selector = htmls.S(rendered)
        self.assertEqual(
            'View',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-previewbutton').alltext_normalized)

    def test_preview_aria_label(self):
        mockrequest = mock.MagicMock()
        mockrequest.cradmin_app.reverse_appurl.return_value = '/preview'
        rendered = listbuilder.itemvalue.EditDeleteWithPreview(value='testvalue')\
            .render(request=mockrequest)
        selector = htmls.S(rendered)
        self.assertEqual(
            'View "testvalue"',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-previewbutton')['aria-label'])


class TestEditDeleteWithArchiveImage(test.TestCase):
    def test_without_archiveimage(self):
        class MyEditDeleteWithArchiveImage(listbuilder.itemvalue.EditDeleteWithArchiveImage):
            def get_archiveimage(self):
                return None
        rendered = MyEditDeleteWithArchiveImage(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertFalse(
            selector.exists('.django-cradmin-listbuilder-itemvalue-editdelete-imagewrapper'))

    def test_with_archiveimage(self):
        class MyEditDeleteWithArchiveImage(listbuilder.itemvalue.EditDeleteWithArchiveImage):
            def get_archiveimage(self):
                archiveimage = mommy.make('cradmin_imagearchive.ArchiveImage')
                archiveimage.image.save('testimage.png', ContentFile(create_image(200, 100)))
                return archiveimage

        mockrequest = mock.MagicMock()
        mockrequest.build_absolute_uri.return_value = 'test'
        rendered = MyEditDeleteWithArchiveImage(value='testvalue')\
            .render(request=mockrequest)
        selector = htmls.S(rendered)
        self.assertTrue(
            selector.exists('.django-cradmin-listbuilder-itemvalue-editdelete-imagewrapper'))


class TestEditDeleteWithArchiveImageAndView(test.TestCase):
    def test_preview_label(self):
        class MyEditDeleteWithArchiveImageAndView(listbuilder.itemvalue.EditDeleteWithArchiveImageAndPreview):
            def get_archiveimage(self):
                return None
        mockrequest = mock.MagicMock()
        mockrequest.cradmin_app.reverse_appurl.return_value = '/preview'
        rendered = MyEditDeleteWithArchiveImageAndView(value='testvalue')\
            .render(request=mockrequest)
        selector = htmls.S(rendered)
        self.assertEqual(
            'View',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-previewbutton').alltext_normalized)

    def test_preview_aria_label(self):
        class MyEditDeleteWithArchiveImageAndView(listbuilder.itemvalue.EditDeleteWithArchiveImageAndPreview):
            def get_archiveimage(self):
                return None
        mockrequest = mock.MagicMock()
        mockrequest.cradmin_app.reverse_appurl.return_value = '/preview'
        rendered = MyEditDeleteWithArchiveImageAndView(value='testvalue')\
            .render(request=mockrequest)
        selector = htmls.S(rendered)
        self.assertEqual(
            'View "testvalue"',
            selector.one('.django-cradmin-listbuilder-itemvalue-editdelete-previewbutton')['aria-label'])

    def test_without_archiveimage(self):
        class MyEditDeleteWithArchiveImageAndView(listbuilder.itemvalue.EditDeleteWithArchiveImageAndPreview):
            def get_archiveimage(self):
                return None
        rendered = MyEditDeleteWithArchiveImageAndView(value='testvalue')\
            .render(request=mock.MagicMock())
        selector = htmls.S(rendered)
        self.assertFalse(
            selector.exists('.django-cradmin-listbuilder-itemvalue-editdelete-imagewrapper'))

    def test_with_archiveimage(self):
        class MyEditDeleteWithArchiveImageAndView(listbuilder.itemvalue.EditDeleteWithArchiveImageAndPreview):
            def get_archiveimage(self):
                archiveimage = mommy.make('cradmin_imagearchive.ArchiveImage')
                archiveimage.image.save('testimage.png', ContentFile(create_image(200, 100)))
                return archiveimage

        mockrequest = mock.MagicMock()
        mockrequest.build_absolute_uri.return_value = 'test'
        rendered = MyEditDeleteWithArchiveImageAndView(value='testvalue')\
            .render(request=mockrequest)
        selector = htmls.S(rendered)
        self.assertTrue(
            selector.exists('.django-cradmin-listbuilder-itemvalue-editdelete-imagewrapper'))
