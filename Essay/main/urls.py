"""LMS URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, re_path
from . import views

urlpatterns = [
    #Authorisation
    path('login/', views.login_user, name='login'),
    path('forgot/', views.forgot, name='forgot'),
    path('logout/', views.logout_user, name='logout'),
    path('sign-up/', views.signup, name='signup'),
    path('user_settings/', views.user_settings, name='user_settings'),

    #Submission related
    path('submit/<int:id>', views.submit, name='submit'),
    path('tasks/', views.tasks, name='tasks'),
    path('check/<int:id>', views.check, name='check'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('submission/<int:id>', views.submission, name='submission'),
    path('api/user-info/', views.get_user_info, name='get_user_info'),
    path('404/<error_code>', views.error, name='error'),
    re_path(r'^api/serve_static/(?P<filename>.+)$', views.serve_static, name='serve_static'),
    path('', views.home, name='home'),

    #WhatsApp end-points
    path("wa_exists/<phone>/", views.wa_exists, name='wa_exists'),
    path('wa_PIN/', views.wa_PIN, name='wa_PIN'),
]