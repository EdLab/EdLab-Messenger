"""
Utility functions
"""

import json
import boto3

from .models import Message, StatusLog


SQS = boto3.client('sqs')


def update_statuses():
    def process_messages():
        response = SQS.receive_message(
            QueueUrl='***REMOVED***/***REMOVED***',
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
                QueueUrl='***REMOVED***/***REMOVED***',
                Entries=batch
            )
            process_messages()
        else:
            return
    process_messages()
