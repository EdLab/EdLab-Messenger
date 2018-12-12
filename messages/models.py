"""
Models for the ***REMOVED*** app
"""


import json
from datetime import datetime
# import threading
from multiprocessing import Process

from html2text import html2text
import boto3

from django.db import models
from django.utils.timezone import make_aware, now

SQS = boto3.client('sqs', region_name='us-east-1')
SES = boto3.client('ses', region_name='us-east-1')
AWS_TIME_FORMAT = '%a, %d %b %Y %H:%M:%S %Z'
QUEUE = '***REMOVED***/***REMOVED***'
CONFIGURATION_SET = '***REMOVED***'


class Template(models.Model):
    """
    Model to contain email templates of all
    the applications
    """

    name = models.CharField(max_length=63, null=False, blank=False, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    subject = models.CharField(max_length=1023, null=True, blank=True)
    template_html = models.TextField(null=False, blank=False)
    template_fields = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    updated_at = models.DateTimeField(auto_now=True, null=False, blank=False)
    default_from = models.CharField(max_length=63, null=True, blank=True)

    def __str__(self):
        return self.name

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
    from_email = models.CharField(max_length=63, null=False, blank=False)

    def __str__(self):
        return F'{self.subject} - {self.created_at}'

    def send(self):
        if self.status == Email.SENT:
            return
        emails = self.to_emails.split(',')
        for email in emails:
            print('Sending message associated with email: %s' % email)
            message = Message(to_email=email, email=self)
            # thread = threading.Thread(target=message.send)
            # thread.start()
            p = Process(target=message.send)
            p.start()
        self.status = Email.SENT
        self.sent_at = now()
        self.save()
        print('Email saved to db: %s' % self.id)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.status == Email.TO_SEND:
            self.send()

    @classmethod
    def send_scheduled_emails(cls):
        emails = cls.objects.filter(status=cls.SCHEDULED, scheduled_at__gte=now())
        for email in emails:
            email.send()


class Message(models.Model):
    """
    Model to hold details of each of the messages
    being sent out through this service
    """

    USER_FIELDS = ['first_name', 'last_name', 'user_name', 'email']

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
            Source=self.email.from_email,
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
        print('Sent message: %s' % self.to_email)
        print(response)
        self.ses_id = response['MessageId']
        self.save()
        print('Message saved to db: %s' % self.id)
        sent_at = response['ResponseMetadata']['HTTPHeaders']['date']
        StatusLog.objects.create(
            message=self,
            status=Email.SENT,
            status_at=make_aware(datetime.strptime(sent_at, AWS_TIME_FORMAT))
        )

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

    @staticmethod
    def update_statuses():
        def process_messages():
            response = SQS.receive_message(
                QueueUrl=QUEUE,
                MaxNumberOfMessages=10
            )
            messages = response.get('Messages', None)
            if messages is not None:
                batch = [{'Id': m['MessageId'], 'ReceiptHandle': m['ReceiptHandle']} for m in messages]
                logs = [json.loads(m['Body']) for m in messages]

                status_logs = []
                for log in logs:
                    message = Message.objects.get(ses_id=log['mail']['messageId'])
                    status_logs.append(StatusLog(
                        message=message,
                        status=log['eventType'],
                        comment=json.dumps(log['mail']),
                        status_at=log['mail']['timestamp']
                    ))
                StatusLog.objects.bulk_create(status_logs)
                SQS.delete_message_batch(
                    QueueUrl=QUEUE,
                    Entries=batch
                )
                process_messages()
            else:
                return
        process_messages()
