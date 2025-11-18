from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class School(models.Model):
    name = models.CharField(max_length=40) #Most likely smth in kyrillic

class Student(models.Model):
    #lid student attributes
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    last_name = models.CharField(max_length=40)
    first_name = models.CharField(max_length=30)
    phone = models.CharField(max_length=20)
    iin = models.CharField(max_length=12)
    picture = models.CharField(max_length=40)
    school = models.ForeignKey('School', on_delete=models.CASCADE, null=True) #Null true because of existing stuff
    grade = models.IntegerField()
    lang = models.CharField(max_length=10, choices = [
        ('ru', 'русский'),
        ('kz', 'казахский')
    ])
    rank = models.CharField(max_length=10, choices = [
        ('iron', 'Железо'),
        ('bronze', 'Бронза'),
        ('silver', 'Серебро'),
        ('gold', 'Золото'),
    ])
    rr = models.IntegerField(default=0) #RR for total ranking

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    last_name = models.CharField(max_length=40)
    first_name = models.CharField(max_length=30)
    phone = models.CharField(max_length=15)
    school = models.ForeignKey('School', on_delete=models.CASCADE, null=True) #Null true because of existing stuff

class Task(models.Model):
    rank = models.CharField(max_length=10, choices = [
        ('iron', 'Железо'),
        ('bronze', 'Бронза'),
        ('silver', 'Серебро'),
    ]) #For which rank task was designed
    text = models.JSONField()  #To store Delta object as JSON
    school = models.ForeignKey('School', on_delete=models.CASCADE, null=True) #Null true because of existing stuff

class Submission(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    school = models.ForeignKey('School', on_delete=models.CASCADE, null=True) #Null true because of existing stuff
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices = [
        ('new', 'To be completed'),
        ('rev', 'Review'),
        ('che', 'Checked')
    ])
    attempt = models.IntegerField(default=1) #Order of attempt 

    #Dates
    deadline = models.DateTimeField() #Deadline for submission
    subm_date = models.DateTimeField(null=True) #When task was submitted

    #Submitted essay attributes
    title = models.CharField(max_length=200, null=True)
    type = models.CharField(max_length=10, choices = [
        ('file', 'File'),
        ('text', 'Text'),
    ], null=True)
    text = models.JSONField(null=True)

    #Checked essay attributes
    result = models.IntegerField(null=True)
    feedback = models.JSONField(null=True)