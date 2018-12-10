"""
Models for the ***REMOVED*** app
"""


import uuid
from datetime import datetime
import threading

from html2text import html2text
import boto3

from django.db import models
from django.utils.timezone import make_aware, now

SES = boto3.client('ses')
AWS_TIME_FORMAT = '%a, %d %b %Y %H:%M:%S %Z'
CONFIGURATION_SET = '***REMOVED***'


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


class Email(models.Model):
    """
    Model to hold details of each Email sent or scheduled
    before turning it into an set of SES messages
    """
    TO_SEND = 'to_send'
    SCHEDULED = 'scheduled'
    SENT = 'sent'
    FAILED = 'failed'

    STATUS_CHOICES = (
        (TO_SEND, 'ToSend'),
        (SCHEDULED, 'Scheduled'),
        (SENT, 'Sent'),
        (FAILED, 'Failed')
    )

    subject = models.CharField(max_length=1023, null=False, blank=False)
    html = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    to_emails = models.TextField(null=False, blank=False)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    application = models.ForeignKey(
        to=Application,
        on_delete=models.PROTECT,
        related_name='messages'
    )

    def __str__(self):
        return F'{self.application.__str__()} - {self.subject} - {self.created_at}'

    def send(self):
        emails = self.to_emails.split(',')
        for email in emails:
            message = Message(to_email=email, email=self)
            thread = threading.Thread(target=message.send)
            thread.start()
        self.status = Email.SENT
        self.sent_at = now()
        self.save()

    def save(self, *args, **kwargs):
        if self.status == Email.TO_SEND:
            self.send()
        super().save(*args, **kwargs)


class Message(models.Model):
    """
    Model to hold details of each of the messages
    being sent out through this service
    """

    ses_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    to_email = models.CharField(max_length=255, null=False, blank=False)

    email = models.ForeignKey(
        to=Email,
        on_delete=models.PROTECT,
        related_name='messages'
    )

    def __str__(self):
        return F'{self.email.__str__()} - {self.created_at} - {self.to_email}'

    class Meta:
        """
        Meta options for Message model
        """

        verbose_name_plural = 'Messages'

    def send(self):
        html = self.email.html
        response = SES.send_email(
            Source=self.email.application.from_email,
            Destination={'ToAddresses': [self.to_email]},
            Message={
                'Subject': {'Data': self.email.subject},
                'Body': {
                    'Text': {'Data': html2text(html)},
                    'Html': {'Data': html},
                }
            },
            ConfigurationSetName=CONFIGURATION_SET
        )
        sent_at = response['ResponseMetadata']['HTTPHeaders']['date']
        self.sent_at = make_aware(datetime.strptime(sent_at, AWS_TIME_FORMAT))
        self.ses_id = response['MessageId']
        self.status = Email.SENT
        self.save()


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
