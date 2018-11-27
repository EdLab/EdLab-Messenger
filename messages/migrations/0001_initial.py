# Generated by Django 2.1.3 on 2018-11-27 21:59

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63, unique=True)),
                ('token', models.UUIDField(default=uuid.uuid4)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('from_email', models.CharField(max_length=63)),
            ],
            options={
                'verbose_name_plural': 'Applications',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.UUIDField(primary_key=True, serialize=False)),
                ('ses_id', models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ('field_values', models.CharField(max_length=2047)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('to_email', models.CharField(max_length=255)),
                ('is_cc', models.BooleanField(default=False)),
                ('is_bcc', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name_plural': 'Messages',
            },
        ),
        migrations.CreateModel(
            name='StatusLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=63)),
                ('status_at', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('comment', models.TextField(blank=True, null=True)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_logs', to='messages.Message')),
            ],
            options={
                'verbose_name_plural': 'StatusLogs',
            },
        ),
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63, unique=True)),
                ('description', models.CharField(blank=True, max_length=255, null=True)),
                ('subject', models.CharField(blank=True, max_length=1023, null=True)),
                ('template_text', models.TextField()),
                ('template_html', models.TextField()),
                ('template_fields', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='templates', to='messages.Application')),
            ],
            options={
                'verbose_name_plural': 'Templates',
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='message',
            name='template',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='messages.Template'),
        ),
    ]
