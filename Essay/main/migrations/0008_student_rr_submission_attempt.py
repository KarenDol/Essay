# Generated by Django 5.1.6 on 2025-03-13 08:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0007_teacher"),
    ]

    operations = [
        migrations.AddField(
            model_name="student", name="rr", field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="submission",
            name="attempt",
            field=models.IntegerField(default=1),
        ),
    ]
