from django.test import TestCase
from model_mommy import mommy

from django_cradmin import cradmin_testhelpers
from django_cradmin.demo.cradmin_listbuilder_guide.crapps.album_app import album_dashboard


class TestAblumDashboardView(TestCase, cradmin_testhelpers.TestCaseMixin):
    viewclass = album_dashboard.AlbumDashboardView

    def test_render_page_sanity(self):
        artist = mommy.make('cradmin_listbuilder_guide.Artist', name='Iron Maiden')
        mockresponse = self.mock_http200_getrequest_htmls(
            cradmin_role=artist
        )
        self.assertTrue(mockresponse.selector.one('.test-primary-h1'))
        expected_h1 = 'Album Dashboard for {}'.format(artist.name)
        actual_h1 = mockresponse.selector.one('.test-primary-h1').text_normalized
        self.assertEqual(expected_h1, actual_h1)