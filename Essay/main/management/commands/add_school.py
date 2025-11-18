from django.core.management.base import BaseCommand, CommandError
from main.models import *

class Command(BaseCommand):
    help = 'Make a custom migration'

    def handle(self, *args, **kwargs):
        #Create new school model
        school_name = input("Name of the new_school: ")
        new_school = School.objects.create(name=school_name)
        print("New school was added to the DB")
        
        #Create tasks for new school
        ranks = ['iron', 'bronze', 'silver']
        for i in range(3):
            for j in range(5):
                new_task = Task.objects.create(rank=ranks[i],school=new_school, text="{\"ops\":[{\"insert\":\"Add your text here1\\n\"}]}")
                new_task.save()
        print("Created empty tasks for the school")
       