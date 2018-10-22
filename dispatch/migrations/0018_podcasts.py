# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-08-21 18:59
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('dispatch', '0017_subsections'),
    ]

    operations = [
        migrations.CreateModel(
            name='Podcast',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('slug', models.SlugField(unique=True)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('author', models.CharField(max_length=255)),
                ('owner_name', models.CharField(max_length=255)),
                ('owner_email', models.EmailField(max_length=255)),
                ('category', models.CharField(max_length=255)),
                ('image', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dispatch.Image')),
            ],
        ),
        migrations.CreateModel(
            name='PodcastEpisode',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('author', models.CharField(max_length=255)),
                ('duration', models.PositiveIntegerField(null=True)),
                ('published_at', models.DateTimeField()),
                ('explicit', models.CharField(choices=[(b'no', b'No'), (b'yes', b'Yes'), (b'clean', b'Clean')], default=b'no', max_length=5)),
                ('file', models.FileField(upload_to=b'podcasts/')),
                ('type', models.CharField(default='audio/mp3', max_length=255)),
                ('image', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dispatch.Image')),
                ('podcast', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dispatch.Podcast')),
            ],
        ),
    ]