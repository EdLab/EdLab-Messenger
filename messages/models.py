"""
Models for the ***REMOVED*** app
"""


import uuid
from datetime import datetime

from html2text import html2text
import boto3

from django.db import models
from django.utils.timezone import make_aware

SES = boto3.client('ses')
AWS_TIME_FORMAT = '%a, %d %b %Y %H:%M:%S %Z'


class Application(models.Model):
    """
    Model to contain information on applications
    using this service
    """

    name = models.CharField(max_length=63, null=False, blank=False, unique=True)
    token = models.UUIDField(default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    from_email = models.CharField(max_length=63, null=False, blank=False)

    def __str__(self):
        return self.name

    class Meta:
        """
        Meta options for Application model
        """

        verbose_name_plural = 'Applications'
        ordering = ['name']


class Template(models.Model):
    """
    Model to contain email templates of all
    the applications
    """

    name = models.CharField(max_length=63, null=False, blank=False, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    subject = models.CharField(max_length=1023, null=True, blank=True)
    template_html = models.TextField(null=False, blank=False)
    template_fields = models.CharField(max_length=255, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)

    application = models.ForeignKey(
        to=Application,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name='templates'
    )

    def __str__(self):
        return F'{self.application.__str__()} - {self.name}'

    class Meta:
        """
        Meta options for Template model
        """

        verbose_name_plural = 'Templates'
        ordering = ['name']


class Message(models.Model):
    """
    Model to hold details of each of the messages
    being sent out through this service
    """

    SCHEDULED = 'scheduled'
    SENT = 'sent'
    FAILED = 'failed'

    STATUS_CHOICES = (
        (SCHEDULED, 'Scheduled'),
        (SENT, 'Sent'),
        (FAILED, 'Failed')
    )

    ses_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    subject = models.CharField(max_length=1023, null=False, blank=False)
    message_html = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    to_email = models.CharField(max_length=255, null=False, blank=False)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, null=False, blank=False)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    application = models.ForeignKey(
        to=Application,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    def __str__(self):
        return F'{self.application.__str__()} - {self.created_at}'

    class Meta:
        """
        Meta options for Message model
        """

        verbose_name_plural = 'Messages'

    def send(self):
        response = SES.send_email(
            Source=self.application.from_email,
            Destination={'ToAddresses': [self.to_email]},
            Message={
                'Subject': {'Data': self.subject},
                'Body': {
                    'Text': {'Data': html2text(self.message_html)},
                    'Html': {'Data': self.message_html},
                }
            },
            ConfigurationSetName='***REMOVED***'
        )
        sent_at = response['ResponseMetadata']['HTTPHeaders']['date']
        self.sent_at = make_aware(datetime.strptime(sent_at, AWS_TIME_FORMAT))
        self.ses_id = response['MessageId']
        self.status = Message.SENT
        self.save()

    def save(self, *args, **kwargs):
        if self.ses_id is None:
            self.send()
        super().save(*args, **kwargs)


class StatusLog(models.Model):
    """
    Model to save message status logs
    """

    status = models.CharField(max_length=63, null=False, blank=False)
    status_at = models.DateTimeField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    comment = models.TextField(null=True, blank=True)

    message = models.ForeignKey(
        to=Message,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name='status_logs'
    )

    def __str__(self):
        return F'{self.message.__str__()} - {self.status}'

    class Meta:
        """
        Meta options for StatusLog model
        """

        verbose_name_plural = 'StatusLogs'
