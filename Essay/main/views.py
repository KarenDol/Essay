from django.shortcuts import render, redirect
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.forms.models import model_to_dict
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from .consts import *
from .models import *
import re
import json
import requests
import os
import json
import random
import math
from datetime import datetime, timedelta
from django.utils.timezone import now

# Create your views here.

# The logic for authentication:
# 1) If page is available only for student/teacher => request.session.get('user_type')
# 2) If page is available to both => request.user.is_authenticated

def home(request):
    if request.session.get('user_type') == 'student':
        student = Student.objects.get(user=request.user)
        submissions = list(Submission.objects.filter(student=student)
                            .order_by('deadline')
                            .values('id', 'title', 'result', 'status', 'deadline', 'task'))
        last_subm = submissions[-1]

        if (last_subm['status'] == 'new'):
            subm_json = json.dumps(last_subm, default=str)  # Using default=str for unsupported type
            task_id = last_subm['task']
            task = Task.objects.get(id=task_id)
            task_dict = model_to_dict(task)
            task_json = json.dumps(task_dict)
            submissions = submissions[:-1] #Delete last subm from the attempts list
        else:
            subm_json = json.dumps(None)
            task_json = json.dumps(None)

        submissions_json = json.dumps(submissions, default=str)
        context = {
            'name': student.first_name,
            'rank': rank_dict[student.rank],
            'act_subm': subm_json,
            'act_task': task_json, 
            'submissions': submissions_json,
        }
        return render(request, 'home_student.html', context)
    
    elif request.session.get('user_type') == 'teacher':
        teacher = Teacher.objects.get(user = request.user)
        school = teacher.school
        submissions = list(Submission.objects.filter(school=school)
                            .exclude(status='new')
                            .order_by('deadline')
                            .values('id', 'title', 'result', 'status', 'deadline', 'student__first_name', 'student__last_name', 'task__rank'))
        tasks = list(Task.objects.filter(school=school)
                .values('id', 'rank', 'text'))
        
        submissions_json = json.dumps(submissions, default=str)
        tasks_json = json.dumps(tasks, default=str)
        rank_id_json = json.dumps(rank_id)
        context = {
            'submissions': submissions_json,
            'tasks': tasks_json,
            'rank_id': rank_id_json,
        }
        return render(request, 'home_teacher.html', context)
    else:
        return redirect('login')
    
#Authorisation
def login_user(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == "POST":
            username = request.POST['iin']
            password = request.POST['passwd']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                #Check if it's the student
                try:
                    Student.objects.get(user=user)
                    request.session['user_type'] = 'student'
                    return redirect('home')
                except Student.DoesNotExist:
                    try:
                        Teacher.objects.get(user=user)
                        request.session['user_type'] = 'teacher'
                        return redirect('home')
                    except Teacher.DoesNotExist:
                        messages.error(request, 'Сіздің акаунтыңызбен мәселе туылды')
                        return redirect('logout')
            else:
                messages.error(request, "Login failed. Please check your username and password.")
                return redirect('login')
        else:
            return render(request, 'login.html')
        
#Forgot password handler
def forgot(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == "POST":
            iin = request.POST['iin'].replace(' ', '')
            phone = request.POST['phone']
            try:
                student = Student.objects.get(iin=iin)
                print(student.phone, phone)
                if (student.phone == phone):
                    user = student.user
                    user.set_password('AIS@2025')
                    user.save()

                    text = "Your account password has been set to the default password: AIS@2025. Please remember to change it upon logging in."
                    wa(phone, text)

                    messages.success(request, "The new credentials were sent to your WhatsApp")
                    return redirect('login')
                else:
                    messages.error(request, "The IIN and phone number did not match")
                    return redirect('forgot')
            except Student.DoesNotExist:
                messages.error(request, "The student with that IIN does not exist")
                return redirect('forgot')
        else:
            return render(request, 'forgot.html')
        
        
def logout_user(request):
    logout(request)
    messages.info(request, "You have been logged out!")
    return redirect('login')

def signup(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == "POST":
            iin = request.POST['iin'].replace(' ', '')
            try:
                student = Student.objects.get(iin=iin)
                messages.error(request, 'Student with this IIN already exists')
                return redirect('login')
            except Student.DoesNotExist:
                last_name = request.POST['lastname']
                first_name = request.POST['firstname']
                phone = request.POST['phone']
                school = request.POST['school']
                school_obj = School.objects.get(name = school)
                grade = request.POST['grade']
                lang = request.POST['lang']
                print(lang)

                # Create the user with IIN as username and default password
                user = User.objects.create_user(username=iin, password='AIS@2025')
                user.first_name = first_name
                user.last_name = last_name
                user.save()

                # Create and save the student linked to the user
                student = Student.objects.create(
                    user=user,
                    last_name=last_name,
                    first_name=first_name,
                    iin=iin,
                    picture = 'Avatar.png',
                    phone=phone,
                    school=school_obj,
                    grade=grade,
                    lang=lang,
                    rank='iron',
                )
                student.save()

                #Assign the task for the new student, first attempt
                assign_task(student, 1)

                #Welcome msg with credentials
                wa(phone, 'Welcome to Essay GradeScope! Use your IIN as login and AIS@2025 as password')

                return redirect('login')
        else:
            schools = list(School.objects.values_list("name", flat=True))
            context = {
                "Schools": schools,
            }
            return render(request, 'signup.html', context)
        
def user_settings(request):
    if not (request.user.is_authenticated):
        return redirect('login')
    if request.session['user_type'] == 'student':
        student = Student.objects.get(user=request.user)
    else:
        #Think about teacher logic as well, maybe disable for them
        cur_user = Teacher.objects.get(user=request.user)
    user = request.user
    if request.method == "POST":
        new_username = request.POST['username']
        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                messages.error(request,'Данное имя пользователя уже занято')
                return redirect('user_settings')
            else:
                user.username = new_username
                user.save()
        
        oldPassword = request.POST['oldPassword']
        newPassword = request.POST['newPassword']
        if oldPassword:
            user = authenticate(username = request.user.username, password = oldPassword)
            if user is not None:
                user.set_password(newPassword)
                user.save()
            else:
                messages.error(request,'Вы ввели неверный старый пароль')
                return redirect('user_settings')
        
        new_phone = request.POST['phone']
        if new_phone and new_phone != student.phone:
            if wa_exists(new_phone):
                student.phone = new_phone
            else:
                messages.success(request, 'По указанному номеру телефона нет WhatsApp')
                return redirect('user_settings')

        if 'avatar' in request.FILES:
            new_avatar = request.FILES['avatar']
            folder_path = os.path.join(settings.STATIC_ROOT, 'avatars')

            # Extract file extension
            file_extension = os.path.splitext(new_avatar.name)[1]  # Get file extension (e.g., .jpg, .png)
            file_name = f"{student.iin}{file_extension}"  # Append extension to file name
            file_path = os.path.join(folder_path, file_name)

            # Delete the file if it exists (only 1 image per user)
            if os.path.isfile(file_path):
                os.remove(file_path)

            fs = FileSystemStorage(folder_path)
            fs.save(file_name, new_avatar)

            student.picture = (file_name)

        user.save()
        student.save()

        messages.success(request, 'Данные пользоватателя были успешны изменены')
        return redirect('user_settings')
    else:
        user_dict = model_to_dict(student, fields=['name', 'phone', 'picture'])
        user_dict['username'] = user.username
        user_dict['picture'] = 'avatars/' + user_dict['picture']
        user_dict['full_name'] = f"{student.last_name} {student.first_name}"
        user_dict['rank_info'] = f"{rank_dict[student.rank]} Лига | {student.rr}"
        context = {
            'user_dict': user_dict,
        }
        return render(request, 'user_settings.html', context)

#Fetch the name and the picture of the user for the index.html
def get_user_info(request):
    if request.session.get('user_type') == 'student':
        user = Student.objects.get(user=request.user)
        user_info = {
            'name': f"{user.last_name} {user.first_name}",
            'picture':  f"avatars/{user.picture}", 
            'rank_pic': f"ranks/{user.rank}.png",
        }
        return JsonResponse(user_info)
    else:
        user = request.user
        user_info = {
            'name': f"{user.last_name} {user.first_name}",  
            'picture': "Avatar.png",
        }
        return JsonResponse(user_info)

#GET the static file
def serve_static(request, filename):
    file_path = os.path.join(settings.STATIC_ROOT, filename)
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    else:
        raise Http404("Avatar not found")
    
def submit(request, id):
    if not request.session.get('user_type') == 'student':
        messages.error(request, 'This page is available only for students')
        return redirect('home')
    student = Student.objects.get(user=request.user)
    try:
        subm = Submission.objects.get(id=id)
        if (student != subm.student) or (student.school != subm.school):
            return redirect('error', 'Looks like you can not submit this essay')
        if subm.status=='new':
            if request.method=="POST":
                title = request.POST['title']
                checkbox = request.POST.get('checkbox')
                if (checkbox):
                    type = 'file'

                    #Save essay file
                    folder_path = os.path.join(settings.STATIC_ROOT, 'essays')
                    os.makedirs(folder_path, exist_ok=True)
                    file = request.FILES['file']
                    fs = FileSystemStorage(location=folder_path)
                    fs.save(f"submission_{id}.pdf", file)

                else:
                    type = 'text'
                    text = request.POST['text']

                    #Update Submission
                    subm.text = text
                
                subm.title = title
                subm.type = type
                subm.status = 'rev'
                subm.subm_date = now()
                subm.save()

                messages.success(request, 'The essay was successfully submitted')
                return redirect('home')
            else:
                context={
                    "id": id,
                }
                return render(request, 'submit.html', context)
        else:
            messages.error(request, 'Данная работа уже сдана и находится на проверке')
            return redirect('home')
    except Submission.DoesNotExist:
        return redirect('error', 'Кажется вы забрели не туда')
        
@csrf_exempt
def tasks(request):
    if not request.session.get('user_type') == 'teacher':
        return JsonResponse({'status': 'error', 'message': "Only teacher can POST to this page"}, status=400)

    if request.method == 'POST':
        teacher = Teacher.objects.get(user = request.user)
        try:
            data = json.loads(request.body)
            task1 = data.get('task1')
            task2 = data.get('task2')
            task3 = data.get('task3')
            task4 = data.get('task4')
            task5 = data.get('task5')

            task_ids = data.get('task_ids')
            print(task_ids)
            tasks = [task1, task2, task3, task4, task5]
            print(tasks)

            for i in range(5):
                task = Task.objects.get(id=task_ids[i], school=teacher.school)
                task.text = tasks[i]
                task.save()
            return JsonResponse({'status': 'ok'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


def check(request, id):
    if not request.session.get('user_type') == 'teacher':
        messages.error(request, 'This page is available only for teachers')
        return redirect('home')
    try:
        subm = Submission.objects.get(id=id)
        if subm.status != 'rev':
            return redirect('error', "Submission is either checked or not completed yet")
        
        teacher = Teacher.objects.get(user=request.user)
        if teacher.school != subm.school:
            return redirect('error', "Кажется вы забрели не туда")

        if request.method == "POST":
            result = int(request.POST['result'])
            feedback = request.POST['feedback']

            subm.result = result
            subm.feedback = feedback
            subm.status = 'che'
            subm.save()

            #Rank-up logic
            student = subm.student
            attempt = subm.attempt

            if result > 6:
                #Rank-up
                next_rank = rank_up[student.rank]
                student.rank = next_rank
                student.save()

                #Increase RR
                #(Result - 70% + Time - 30%) * Attempt number percentage
                subm_date = subm.subm_date
                deadline = subm.deadline

                diff = deadline - subm_date
                total_diff = diff.total_seconds() 

                seconds_in_week = 7 * 24 * 3600  # 604800 seconds
                # Ratio of diff to a week
                time_ratio = total_diff / seconds_in_week

                result_ratio = result / 10

                subm_rr = 1000 * (0.7 * result_ratio + 0.3 * time_ratio) * ((6 - attempt) / 5)
                subm_rr = math.ceil(subm_rr) # Round up the result
                student.rr += subm_rr
                student.save()

                #Assign New Task, diamonds don't get new assignments
                if student.rank != 'diamond':
                    assign_task(student, 1) 
            else:
                #Assign New Task, second or more attempt
                assign_task(student, attempt+1)

            messages.success(request, 'The essay feedback was successfully submitted')
            return redirect('home')
        else:
            subm_dict = model_to_dict(subm)
            subm_json = json.dumps(subm_dict, default=str)
            task_dict = model_to_dict(subm.task)
            task_json = json.dumps(task_dict, default=str)
            student = subm.student
            
            context = {
                'subm': subm_json,
                'task': task_json,
                'student_name': f"{student.last_name} {student.first_name}",
                'rank': f"ranks/{subm.task.rank}.png",
                'id': id,
            }
            return render(request, 'check.html', context)
    except Submission.DoesNotExist:
        return redirect('error', error_code='The submission with this id does not exist')
    
def submission(request, id):
    if not request.user.is_authenticated:
        return redirect('login')
    try:
        submission = Submission.objects.get(id=id)
        #Redirect is the submission is not checked
        if submission.status != 'che':
            return redirect('check', id=id)
        submission_dict = model_to_dict(submission)
        submission_json = json.dumps(submission_dict, default=str)
        student = submission.student
        task = submission.task
        task_dict = model_to_dict(task)
        task_json = json.dumps(task_dict, default=str)  
        if request.session['user_type'] == 'student':
            student = Student.objects.get(user=request.user)
            #Student can see only his submissions
            if (submission.student == student):
                context = {
                    'subm': submission_json,
                    'task': task_json,
                }
                return render(request, 'submission.html', context)
            else:
                messages.error(request, 'Looks like you can not see this submission')
                return redirect('home')
        else:
            context = {
                'subm': submission_json,
                'task': task_json,
                'student_name': f"{student.last_name} {student.first_name}",
                'rank': f"ranks/{task.rank}.png",
            }
            return render(request, 'submission.html', context)
    except Submission.DoesNotExist:
        return redirect('error', error_code = 'Submission with this id does not exist')


def assign_task(student, attempt):
    #Get the base id
    rank = student.rank
    school = student.school 

    #Populate available tasks
    tasks = Task.objects.filter(school=school, rank=rank)

    #Second or more attempt logic
    if (attempt!=1):
        #Check for prev_subm and get the ids of the attempts in the same league
        submissions = Submission.objects.filter(student=student)

        #Remove attempted tasks
        for submission in submissions:
            task = submission.task
            tasks.remove(task)

    #Choose random task
    task = random.choice(tasks)
    deadline = now() + timedelta(weeks=1)

    #Create new submission
    submission = Submission.objects.create(student=student, task=task, school=school, status='new', deadline=deadline, attempt=attempt)

def error(request, error_code):
    return render(request, '404.html', {'error_code': error_code})

def wa_exists(request, phone):
    try:
        # Remove +, parentheses, and dashes from the phone number
        phone = re.sub(r'[^\d]', '', phone)  # Keeps only digits
        print(phone)

        url = "https://7103.api.greenapi.com/waInstance7103163711/checkWhatsapp/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

        payload = { 
            "phoneNumber": phone  
        }
        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)

        return JsonResponse(response.json(), status = 200)
    
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

def wa(phone, text):
    url = "	https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

    # Remove +, parentheses, and dashes from the phone number
    phone = re.sub(r'[^\d]', '', phone)  # Keeps only digits

    payload = {
                "chatId": f"{phone}@c.us",
                "message": text,
            }
    
    headers = {
                'Content-Type': 'application/json'
            }
    
    requests.post(url, json=payload, headers=headers)

def wa_PIN(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # Load JSON data from request body
            phone = data.get('phone')

            if not phone:
                return JsonResponse({"status": "error", "message": "Phone number is required"}, status=400)

            # Remove +, parentheses, and dashes from the phone number
            phone = re.sub(r'[^\d]', '', phone)  # Keeps only digits

            PIN = random.randint(100, 999)
            text = f"Сіздің WhatsApp нөміріңізді растау үшін PIN коды: *{PIN}*"

            url = "https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"
            payload = {
                "chatId": f"{phone}@c.us",
                "message": text,
            }

            headers = {
                'Content-Type': 'application/json'
            }

            response = requests.post(url, json=payload, headers=headers)

            if response.status_code == 200:
                return JsonResponse({"status": "success", "pin": PIN})
            else:
                return JsonResponse({"status": "error", "message": "Failed to send message"}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    return JsonResponse({"status": "error", "message": "Only POST method is allowed"}, status=405)

def leaderboard(request):
    try:
        student = Student.objects.get(user=request.user)
        rank = Student.objects.filter(rr__gt=student.rr).count() + 1
        student_dict = model_to_dict(student)
        student_json = json.dumps(student_dict)
        students = list(Student.objects.all()
                                            .order_by('-rr')
                                            .values('rank', 'rr', 'first_name', 'last_name', 'picture')[:10])
        students_json = json.dumps(students, default=str)
        context = {
            'students': students_json,
            'student': student_json,
            'rank': rank
        }
        return render(request, 'leaderboard.html', context)
    
    except Student.DoesNotExist:
        messages.error(request, "Only students can see that page")
        return redirect("home")
    