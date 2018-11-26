"""
API controllers for the ***REMOVED*** app
"""

import json
from time import sleep

import boto3
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import HyperlinkedModelSerializer, PrimaryKeyRelatedField
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Template, Message, StatusLog, Application

SES = boto3.client('ses')


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
                  'template_text', 'template_html', 'template_fields')


class TemplateViewSet(ModelViewSet):
    """
    ViewSet class for Template Model REST Interface
    """

    queryset = Template.objects.all()
    serializer_class = TemplateSerializer


@api_view(['POST'])
def send_newsletter(request):
    """
    Controller for newsletters
    """

    to_emails = request.data['to_emails']
    template_id = request.data['template_id']
    field_values = json.loads(request.data['field_values'])

    field_keys = field_values.keys()

    template = Template.objects.get(pk=template_id).prefetch_related('application')
    template_fields = template.template_fields.split(',')

    if set(template_fields).issubset(set(field_keys)) is False or \
            set(field_keys).issubset(set(template_fields)) is False:
        return Response('Required field not provided', status=400)

    to_chunks = [to_emails[i:i + 50] for i in range(0, len(to_emails), 50)]

    def _get_message(email, ses_id):
        return Message(
            to_email=email,
            template=template,
            field_values=field_values,
            ses_id=ses_id
        )

    def _get_status_log(status, message):
        return StatusLog(
            message=message,
            status=status['Status'],
            comment=status['Error']
        )

    for chunk in to_chunks:
        length = len(chunk)
        response = SES.send_bulk_templated_email(
            Source=template.application.from_email,
            ConfigurationSetName='***REMOVED***',
            Template=template.name,
            Destinations=[{'Destination': {'ToAddresses': [email]}} for email in chunk],
            DefaultTemplateData=json.dumps(field_values)
        )
        statuses = response.dict()['Status']
        messages = [_get_message(chunk[i], statuses[i]['MessageId']) for i in range(0, length)]
        saved_messages = Message.objects.bulk_create(messages)
        status_logs = [_get_status_log(statuses[i], saved_messages[i]) for i in range(0, length)]
        StatusLog.objects.bulk_create(status_logs)
        sleep(0.5)  # TODO: make wait time dynamic?

    return Response(status=200, data={})
