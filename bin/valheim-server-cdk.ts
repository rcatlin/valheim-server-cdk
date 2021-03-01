#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import { ValheimServerCdkStack } from '../lib/valheim-server-cdk-stack';
import { InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';

const userConfig: iUserConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../user-config.json'), 'utf8'));

const app = new cdk.App();
new ValheimServerCdkStack(app, `${userConfig.worldName}ValheimServerCdkStack`, {
    keyPairName: userConfig.keyPairName,
    instanceClass: userConfig.instanceClass,
    instanceSize: userConfig.instanceSize,
    backupS3BucketName: userConfig.backupS3BucketName,
    worldName: userConfig.worldName,
    existingBucket: userConfig.existingBucket
});

interface iUserConfig {
    keyPairName: string;
    instanceClass: InstanceClass;
    instanceSize: InstanceSize;
    worldName: string;
    backupS3BucketName: string;
    existingBucket?: boolean;
}
