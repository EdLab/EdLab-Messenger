"""
API controllers for the ***REMOVED*** app
"""

import json

import boto3
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import HyperlinkedModelSerializer, PrimaryKeyRelatedField
from rest_framework.decorators import api_view
from rest_framework.response import Response

import django.template

from .models import Template, Application, Email

SES = boto3.client('ses')
AWS_TIME_FORMAT = '%a, %d %b %Y %H:%M:%S %Z'


class ApplicationSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Application Model REST Interface
    """

    class Meta:
        model = Application
        fields = ('id', 'name', 'from_email')


class ApplicationViewSet(ModelViewSet):
    """
    ViewSet class for Application Model REST Interface
    """

    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer


class TemplateSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Template Model REST Interface
    """

    application = PrimaryKeyRelatedField(queryset=Application.objects.all())

    class Meta:
        model = Template
        fields = ('application', 'name', 'description', 'subject',
                  'template_html', 'template_fields')


class TemplateViewSet(ModelViewSet):
    """
    ViewSet class for Template Model REST Interface
    """

    queryset = Template.objects.all()
    serializer_class = TemplateSerializer


class EmailSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Template Model REST Interface
    """

    application = PrimaryKeyRelatedField(queryset=Application.objects.all())

    class Meta:
        model = Email
        fields = ('id', 'application', 'subject', 'html', 'to_emails',
                  'status', 'scheduled_at', 'sent_at')


class EmailViewSet(ModelViewSet):
    """
    ViewSet class for Template Model REST Interface
    """

    queryset = Email.objects.all()
    serializer_class = EmailSerializer


@api_view(['POST'])
def send_email(request):
    """
    Controller for individual email
    """

    application_id = request.data['application_id']
    to_emails = request.data['to_emails']
    subject = request.data['subject']
    html = request.data['html']

    application = Application.objects.get(pk=application_id)

    email = Email(
        subject=subject,
        html=html,
        to_emails=to_emails,
        status=Email.TO_SEND,
        application=application
    )
    email.save()

    return Response(status=200, data={})


@api_view(['POST'])
def schedule_emails(request):
    """
    Controller to schedule emails in bulk
    :param request:
    :return:
    """

    to_emails = request.data['to_emails']
    scheduled_at = json.loads(request.data['scheduled_at'])

    template_id = request.data.get('template_id', None)
    if template_id is not None:
        field_values = json.loads(request.data['field_values'])
        field_keys = list(field_values.keys())
        template = Template.objects.get(pk=template_id)
        template_fields = template.template_fields.split(',')
        application = template.application

        if set(template_fields).issubset(set(field_keys)) is False or \
                set(field_keys).issubset(set(template_fields)) is False:
            return Response({'message': 'Fields do not match required fields'}, status=400)

        t_subject = django.template.Template(template.subject)
        t_html = django.template.Template(template.template_html)
        context = django.template.Context(field_values)
        subject = t_subject.render(context)
        html = t_html.render(context)

    else:
        subject = request.data['subject']
        html = request.data['html']
        application_id = request.data['application_id']
        application = Application.objects.get(pk=application_id)

    email = Email(
        subject=subject,
        html=html,
        to_emails=to_emails,
        status=Email.SCHEDULED,
        scheduled_at=scheduled_at,
        application=application
    )
    email.save()

    return Response(status=200, data={})
