"""
Models for the ***REMOVED*** app
"""


import uuid

import boto3
from django.db import models

SES = boto3.client('ses')


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
        ordering = ['name']


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
        ordering = ['name']

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

    ses_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    field_values = models.CharField(max_length=2047, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    to_email = models.CharField(max_length=255, null=False, blank=False)
    is_cc = models.BooleanField(null=False, blank=False, default=False)
    is_bcc = models.BooleanField(null=False, blank=False, default=False)

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


class StatusLog(models.Model):
    """
    Model to save message status logs
    """

    status = models.CharField(max_length=63, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    comment = models.CharField(max_length=1023, null=True, blank=True)

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
