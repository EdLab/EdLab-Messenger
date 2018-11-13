"""
API controllers for the ***REMOVED*** app
"""

import json

import boto3
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Template

SES = boto3.resource('ses')


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

    template = Template.objects.get(pk=template_id)
    template_fields = template.template_fields.split(',')

    if set(template_fields).issubset(set(field_keys)) is False or \
            set(field_keys).issubset(set(template_fields)) is False:
        return Response('Required field not provided', status=400)

    tags = [{'Name': k, 'Value': field_values[k]} for k in field_keys]

    response = SES.send_bulk_templated_email(
        Source=template.application.from_email,
        ConfigurationSetName='***REMOVED***',
        Template=template.name,
        DefaultTags=tags,
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
