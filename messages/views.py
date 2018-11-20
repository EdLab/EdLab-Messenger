"""
API controllers for the ***REMOVED*** app
"""

import json

import boto3
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Template

SES = boto3.client('ses')


class TemplateSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Template Model REST Interface
    """

    class Meta:
        model = Template
        fields = ('name', 'description', 'subject', 'template_text', 'template_html', 'template_fields')


class TemplateViewSet(ModelViewSet):
    """
    ViewSet class for Template Model REST Interface
    """

    queryset = Template.objects.all()
    serializer_class = TemplateSerializer


@api_view(['POST'])
def send_email(request):
    """
    Controller for single emails
    """

    to_emails = request.data['to_emails']
    cc_emails = request.data['cc_emails']
    bcc_emails = request.data['bcc_emails']
    template_id = request.data['template_id']
    field_values = json.loads(request.data['field_values'])

    field_keys = field_values.keys()

    template = Template.objects.get(pk=template_id).prefetch_related('application')
    template_fields = template.template_fields.split(',')

    if set(template_fields).issubset(set(field_keys)) is False or \
            set(field_keys).issubset(set(template_fields)) is False:
        return Response('Required field not provided', status=400)

    response = SES.send_bulk_templated_email(
        Source=template.application.from_email,
        ConfigurationSetName='***REMOVED***',
        Template=template.name,
        Destination={
            'ToAddresses': to_emails,
            'CcAddresses': cc_emails,
            'BccAddresses': bcc_emails,
        },
        TemplateData=json.dumps(field_values)
    )

    return Response(response.dict(), status=200)


@api_view(['POST'])
def send_emails(request):
    """
    Controller for bulk emails
    """

    to_emails = request.data['to_emails']
    cc_emails = request.data['cc_emails']
    bcc_emails = request.data['bcc_emails']
    template_id = request.data['template_id']
    field_values = json.loads(request.data['field_values'])

    field_keys = field_values.keys()

    template = Template.objects.get(pk=template_id).prefetch_related('application')
    template_fields = template.template_fields.split(',')

    if set(template_fields).issubset(set(field_keys)) is False or \
            set(field_keys).issubset(set(template_fields)) is False:
        return Response('Required field not provided', status=400)

    response = SES.send_bulk_templated_email(
        Source=template.application.from_email,
        ConfigurationSetName='***REMOVED***',
        Template=template.name,
        # DefaultTags=tags,
        Destinations=[
            {
                'Destination': {
                    'ToAddresses': to_emails,
                    'CcAddresses': cc_emails,
                    'BccAddresses': bcc_emails,
                }
            }
        ]
    )

    return Response(response.dict(), status=200)
