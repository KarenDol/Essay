# Generated by Django 5.1.6 on 2025-03-13 08:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0010_rename_assign_date_submission_dedaline_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="submission", old_name="dedaline", new_name="deadline",
        ),
    ]
