"""
Models for the ***REMOVED*** app
"""


import json
import uuid

import boto3
from django.db import models

SES = boto3.resource('ses')


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
        db_table = 'application'


class Template(models.Model):
    """
    Model to contain email templates of all
    the applications
    """

    name = models.CharField(max_length=63, null=False, blank=False, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    subject = models.CharField(max_length=1023, null=True, blank=True)
    template_text = models.TextField(null=False, blank=False)
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
        db_table = 'template'

    def create_ses_template(self):
        response = SES.create_template(
            Template={
                'TemplateName': self.name,
                'SubjectPart': self.subject,
                'TextPart': self.template_text,
                'HtmlPart': self.template_html
            }
        )
        return response

    def delete_ses_template(self):
        response = SES.delete_template(TemplateName=self.name)
        return response


class Message(models.Model):
    """
    Model to hold details of each of the messages
    being sent out through this service
    """

    field_values = models.CharField(max_length=2047, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    to_emails = models.CharField(max_length=4095, null=False, blank=False)
    cc_emails = models.CharField(max_length=4095, null=True, blank=True)
    bcc_emails = models.CharField(max_length=4095, null=True, blank=True)

    template = models.ForeignKey(
        to=Template,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    def __str__(self):
        return F'{self.template.__str__()} - {self.created_at}'

    class Meta:
        """
        Meta options for Message model
        """

        verbose_name_plural = 'Messages'
        db_table = 'message'

    def send_message(self, source=None):
        response = SES.send_templated_email(
            Source=source if source else self.template.application.from_email,
            Destination={
                'ToAddresses': self.to_emails,
                'CcAddresses': self.cc_emails,
                'BccAddresses': self.bcc_emails,
            },
            ConfigurationSetName='***REMOVED***',   # TODO: constant
            Template=self.template.name,
            TemplateData=json.loads(self.field_values)
        )
        return response


class StatusLog(models.Model):
    """
        Model to save message status logs
    """

    STATUS_CHOICES = (
        ('pending', 'Pending'),
    )

    status = models.CharField(max_length=63, null=False, blank=False, choices=STATUS_CHOICES)
    status_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)

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
        db_table = 'status_log'
