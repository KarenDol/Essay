# Generated by Django 5.1.6 on 2025-03-13 08:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0008_student_rr_submission_attempt"),
    ]

    operations = [
        migrations.RenameField(
            model_name="submission", old_name="deadline", new_name="assign_date",
        ),
        migrations.AddField(
            model_name="submission",
            name="subm_time",
            field=models.DateTimeField(null=True),
        ),
    ]
