# Generated by Django 2.1.4 on 2018-12-11 19:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messages', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='template',
            name='template_fields',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]