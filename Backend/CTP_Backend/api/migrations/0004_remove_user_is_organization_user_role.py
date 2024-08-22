# Generated by Django 4.2.7 on 2024-08-22 03:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_user_is_staff'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='is_organization',
        ),
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.PositiveSmallIntegerField(choices=[(0, ' event_organization'), (1, 'tourist')], null=True, verbose_name='Role'),
        ),
    ]