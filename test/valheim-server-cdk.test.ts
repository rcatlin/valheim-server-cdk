import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import { InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as ValheimServerCdk from '../lib/valheim-server-cdk-stack';

test('EC2 Instance Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ValheimServerCdk.ValheimServerCdkStack(app, 'MyTestStack', {
    keyPairName: 'foo-key-pair-name',
    instanceSize: InstanceSize.LARGE,
    instanceClass: InstanceClass.T2,
    backupS3BucketName: 'foo-backup-bucket-name'
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::EC2::Instance"));
});
