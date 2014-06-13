from setuptools import setup, find_packages

setup(
    name='django_cradmin',
    description='Django cradmin.',
    version='0.9',
    url='https://github.com/appressoas/django_cradmin',
    author='Espen Angell Kristiansen, Vegard Angell',
    license='BSD',
    packages=find_packages(exclude=['ez_setup']),
    zip_safe=False,
    include_package_data=True,
    install_requires=[
        'setuptools',
        'django-crispy-forms',
        'Django'
    ],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved',
        'Operating System :: OS Independent',
        'Programming Language :: Python'
    ]
)
