"""
API controllers for the ***REMOVED*** app
"""

import json
from datetime import datetime
import threading

import boto3
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import HyperlinkedModelSerializer, PrimaryKeyRelatedField
from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.utils.timezone import make_aware
from django.template import Template as T, Context as C

from .models import Template, Message, Application

SES = boto3.client('ses')
AWS_TIME_FORMAT = '%a, %d %b %Y %H:%M:%S %Z'


class ApplicationSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Application Model REST Interface
    """

    class Meta:
        model = Application
        fields = ('name', 'from_email')


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

    def save_message(to_email):
        message = Message(
            to_email=to_email,
            subject=subject,
            message_html=html,
            application=application
        )
        message.save()

    for email in to_emails:
        thread = threading.Thread(target=save_message, args=(email,))
        thread.start()

    return Response(status=200, data={})


@api_view(['POST'])
def schedule_emails(request):
    """
    Controller to schedule emails in bulk
    :param request:
    :return:
    """

    to_emails = request.data['to_emails']
    template_id = request.data['template_id']
    field_values = json.loads(request.data['field_values'])
    scheduled_at = json.loads(request.data['scheduled_at'])

    field_keys = list(field_values.keys())

    template = Template.objects.get(pk=template_id)
    template_fields = template.template_fields.split(',')
    application = template.application

    if set(template_fields).issubset(set(field_keys)) is False or \
            set(field_keys).issubset(set(template_fields)) is False:
        return Response({'message': 'Fields do not match required fields'}, status=400)

    for key in field_keys:
        if isinstance(field_values[key], list) and len(to_emails) != len(field_values[key]):
            return Response(
                {'message': F'Number of destinations for {key} not equal to number of email IDs'},
                status=400
            )

    messages = []
    for i in range(0, len(to_emails)):
        replacements = {}
        for key in field_keys:
            if isinstance(field_values[key], list):
                replacements[key] = field_values[key][i]
            else:
                replacements[key] = field_values[key]
        t_subject = T(template.subject)
        t_message = T(template.template_html)
        c = C(replacements)
        subject = t_subject.render(c)
        html = t_message.render(c)
        messages.append(Message(
            to_email=to_emails[i],
            subject=subject,
            message_html=html,
            scheduled_at=make_aware(datetime.strptime(scheduled_at, AWS_TIME_FORMAT)),
            status=Message.SCHEDULED,
            application=application
        ))
    Message.objects.bulk_create(messages)
    return Response(status=200, data={})
