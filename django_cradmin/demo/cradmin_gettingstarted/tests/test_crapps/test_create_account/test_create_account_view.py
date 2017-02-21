from django.conf import settings
from django.test import TestCase
from model_mommy import mommy

from django_cradmin import cradmin_testhelpers
from django_cradmin.demo.cradmin_gettingstarted.crapps.create_account import create_account_view
from django_cradmin.demo.cradmin_gettingstarted.models import Account


class TestCreateAccountView(TestCase, cradmin_testhelpers.TestCaseMixin):
    viewclass = create_account_view.CreateAccountView

    def __get_cradmin_role(self):
        return mommy.make(settings.AUTH_USER_MODEL)

    def test_get_render_form(self):
        mockresponse = self.mock_http200_getrequest_htmls(
            cradmin_role=self.__get_cradmin_role()
        )
        mockresponse.selector.prettyprint()

    def test_post_form(self):
        self.mock_http302_postrequest(
            requestkwargs={
                'data': {
                    'account_name': 'Flaming Youth'
                }
            }
        )
        account_in_db = Account.objects.all()
        self.assertEqual(1, account_in_db.count())