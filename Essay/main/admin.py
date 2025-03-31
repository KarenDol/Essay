from django.contrib import admin
from .models import *

# Register your models
admin.site.register(Student)
admin.site.register(Task)
admin.site.register(Submission)
admin.site.register(Teacher)