"""
API controllers for the ***REMOVED*** app
"""

import boto3
from rest_framework.viewsets import ModelViewSet, GenericViewSet, ReadOnlyModelViewSet
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.serializers import HyperlinkedModelSerializer, PrimaryKeyRelatedField
from rest_framework.status import HTTP_201_CREATED
from rest_framework.response import Response

from .models import Template, Email, Message, StatusLog

SES = boto3.client('ses')
AWS_TIME_FORMAT = '%a, %d %b %Y %H:%M:%S %Z'


class TemplateSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Template Model REST Interface
    """

    class Meta:
        model = Template
        fields = ('id', 'name', 'description', 'subject', 'template_html',
                  'template_fields', 'default_from')


class TemplateViewSet(ModelViewSet):
    """
    ViewSet class for Template Model REST Interface
    """

    queryset = Template.objects.all()
    serializer_class = TemplateSerializer


class EmailSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Email Model REST Interface
    """

    class Meta:
        model = Email
        fields = ('id', 'subject', 'html', 'to_emails', 'status',
                  'scheduled_at', 'from_email')
        read_only_fields = ('sent_at',)


class EmailViewSet(CreateModelMixin,
                   RetrieveModelMixin,
                   ListModelMixin,
                   GenericViewSet):
    """
    ViewSet class for Email Model REST Interface
    """

    queryset = Email.objects.all()
    serializer_class = EmailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        scheduled_at = serializer.data.get('scheduled_at')
        serializer.data['status'] = Email.SCHEDULED if scheduled_at is not None else Email.TO_SEND
        serializer.is_valid(raise_exception=True)

        headers = self.get_success_headers(serializer.data)
        self.perform_create(serializer)

        return Response(serializer.data, status=HTTP_201_CREATED, headers=headers)


class StatusLogSerializer(HyperlinkedModelSerializer):
    """
    Serializer class to support nesting in Message serializer
    """

    class Meta:
        model = StatusLog
        fields = ('status', 'status_at', 'comment')


class MessageSerializer(HyperlinkedModelSerializer):
    """
    Serializer class for Message Model REST Interface
    """

    email_id = PrimaryKeyRelatedField(queryset=Email.objects.all())
    status_logs = StatusLogSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'ses_id', 'to_email', 'email_id', 'status_logs')


class MessageViewSet(ReadOnlyModelViewSet):
    """
    ViewSet class for Message Model REST Interface
    """

    queryset = Email.objects.all().prefetch_related('status_logs')
    serializer_class = MessageSerializer
