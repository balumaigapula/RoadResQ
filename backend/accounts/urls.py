from django.urls import path

from accounts import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('verify-email/<str:token>/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', views.ResendOTPView.as_view(), name='resend-otp'),

    path('login/', views.LoginView.as_view(), name='login'),
    path('refresh/', views.RefreshTokenView.as_view(), name='refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.MeView.as_view(), name='me'),

    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/image/', views.ProfileImageView.as_view(), name='profile-image'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-password-otp/', views.VerifyPasswordOTPView.as_view(), name='verify-password-otp'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
]
