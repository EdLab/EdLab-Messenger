"""
Utility functions
"""

import boto3


SQS = boto3.resource('sqs')

def update_statuses():
    response = SQS.receive_message(
        QueueUrl='***REMOVED***/***REMOVED***',
        MaxNumberOfMessages=10
    )
