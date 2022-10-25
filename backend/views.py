import json
import random
import re
import string

from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse

from .models import User

sys_random = random.SystemRandom()


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"].lower()
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if not User.objects.filter(username=username).exists():
            return render(request, "backend/login.html", {
                "user_error": True,
                "yesno_args": "Username not found.,"
            })

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "backend/login.html", {
                "username": username,
                "password_error": True,
                "yesno_args": "Invalid password.,"
            })

    else:
        return render(request, "backend/login.html", {
            "yesno_args": ","
        })


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"].lower()
        email = request.POST["email"].lower()
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        if re.match(r'/^[a-zA-Z0-9_]+$/', username):
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "user_error": True,
                "yesno_args": "Username must only contain letters, numbers and underscores.,"
            })

        if len(username) < 3:
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "user_error": True,
                "yesno_args": "Username must contain at least 3 characters.,"
            })

        if len(username) > 20:
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "user_error": True,
                "yesno_args": "Username must be under 20 characters long.,"
            })

        if re.match(r'/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/', email):
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "email_error": True,
                "yesno_args": "Invalid email address.,"
            })

        if User.objects.filter(email=email).exists():
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "email_error": True,
                "yesno_args": "Email is already registered.,"
            })

        # Ensure password is long enough
        if len(password) < 8:
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "password_error": True,
                "yesno_args": "Password must be at least 8 characters long.,"
            })

        # Ensure password matches confirmation
        if password != confirmation:
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "confirmation_error": True,
                "yesno_args": "Passwords must match.,"
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "backend/register.html", {
                "username": username,
                "email": email,
                "user_error": True,
                "yesno_args": "Username already taken.,"
            })

        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "backend/register.html", {
            "yesno_args": ","
        })


def check_user_existence(request, username):
    return JsonResponse({'exists': User.objects.filter(username=username.lower()).exists()}, safe=False)


def check_email_existence(request, email):
    return JsonResponse({'exists': User.objects.filter(email=email).exists()})


def get_random_username(request):
    usernames = [user.username for user in User.objects.all()]
    random_username = ''
    while random_username in usernames or not random_username:
        random_username = ''.join(sys_random.choices(string.ascii_lowercase + string.digits + '_', k=8))
    return JsonResponse({'username': random_username})
