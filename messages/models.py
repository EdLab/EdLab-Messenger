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
        ordering = ['name']

    def save(self, *args, **kwargs):
        template = {
            'TemplateName': self.name,
            'SubjectPart': self.subject,
            'TextPart': self.template_text,
            'HtmlPart': self.template_html
        }
        if self.pk is None:
            SES.create_template(Template=template)
        else:
            SES.update_template(Template=template)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        SES.delete_template(TemplateName=self.name)
        super().delete(*args, **kwargs)


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
    field_values = models.TextField(null=True, blank=True)
    message_text = models.TextField(null=True, blank=True)
    message_html = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    to_email = models.CharField(max_length=255, null=False, blank=False)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, null=False, blank=False)
    send_at = models.DateTimeField(null=False, blank=False)

    template = models.ForeignKey(
        to=Template,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    application = models.ForeignKey(
        to=Application,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    def __str__(self):
        return F'{self.template.__str__() if self.template else self.application.__str__()} - {self.created_at}'

    class Meta:
        """
        Meta options for Message model
        """

        verbose_name_plural = 'Messages'


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
