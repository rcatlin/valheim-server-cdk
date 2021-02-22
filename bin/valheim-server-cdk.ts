#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import { ValheimServerCdkStack } from '../lib/valheim-server-cdk-stack';

const {
    keyPairName,
    instanceClass,
    instanceSize,
    backupS3BucketName
  } = JSON.parse(fs.readFileSync(path.join(__dirname, '../user-config.json'), 'utf8'));

const app = new cdk.App();
new ValheimServerCdkStack(app, 'ValheimServerCdkStack', {
    keyPairName,
    instanceClass,
    instanceSize,
    backupS3BucketName
});
