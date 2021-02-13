#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ValheimServerCdkStack } from '../lib/valheim-server-cdk-stack';

const app = new cdk.App();
new ValheimServerCdkStack(app, 'ValheimServerCdkStack');
