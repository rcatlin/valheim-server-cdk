import * as fs from 'fs';
import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import {
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  CfnEIP,
  CfnEIPAssociation,
  CloudFormationInit,
  InitCommand,
  InitConfig,
  InitPackage,
  InitService,
  InitServiceRestartHandle,
  InitSource,
  InitUser,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc
} from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

const USER_VIKING_WORLDS_FOLDER_PATH = '/home/viking/.config/unity3d/IronGate/Valheim/worlds/';

export class ValheimServerCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: iValheimServerCdkStackProps) {
    super(scope, id, props);

    /* VPC  */
    const vpc = new Vpc(this, 'VPC', {
      maxAzs: 1
    });

    /* Security Group */
    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow Steam connections to VPC',
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.udpRange(2456, 2458),
      'allow valheim udp'
    );
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcpRange(2456, 2458),
      'allow valheim tcp'
    );
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.udp(27015),
      'allow steam udp'
    );
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(27015),
      'allow steam tcp'
    );
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      'allow ssh from anywhere'
    );

    /* Machine Image */
    const machineImage = new AmazonLinuxImage({ generation: AmazonLinuxGeneration.AMAZON_LINUX_2 });

    // Create service restart handle to trigger Valheim restarts
    // when certain commands/changes are performed.
    const valheimHandle = new InitServiceRestartHandle();

    /* CloudFormation Initialization */
    let restoreFromS3Command;
    if (props.existingBucket) {
      const src = 's3://' + path.join(props.backupS3BucketName, '/'),
        dest = path.join(USER_VIKING_WORLDS_FOLDER_PATH, '/');
      restoreFromS3Command = InitCommand.argvCommand([
        'aws',
        's3',
        'cp',
        src,
        dest,
        '--include',
        `"${props.worldName}.*"`,
        '--exclude',
        '"*.old"',
        '--recursive'
      ]);
    } else {
      restoreFromS3Command = InitCommand.argvCommand(['echo', '"World file restoration skipped: new bucket."']);
    }

    const init = CloudFormationInit.fromConfigSets({
      configSets: {
        default: ['yumPreinstall', 'config']
      },
      configs: {
        yumPreinstall: new InitConfig([
          InitPackage.yum('glibc.i686'),
          InitPackage.yum('libstdc++.i686')
        ]),
        config: new InitConfig([
          // Create User+Group
          InitUser.fromName('viking'),

          // Setup directories for SteamCMD and Valheim Server
          InitCommand.argvCommand([
            'mkdir',
            '-p',
            '/home/viking/Steam',
            '/home/viking/valheimserver',
            '/home/viking/assets'
          ]),

          // Extract assets tarball into assets dir
          InitSource.fromAsset(
            '/home/viking/assets/',
            path.join(__dirname, '../build/assets.tar.gz') // assets must be a tar or zip
          ),

          // Download lastest SteamCMD
          InitSource.fromUrl('/home/viking/Steam/', 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz'),

          // Install Valheim Server using SteamCMD
          InitCommand.argvCommand([
            '/home/viking/Steam/steamcmd.sh',
            '+login',
            'anonymous',
            '+force_install_dir',
            '/home/viking/valheimserver',
            '+app_update',
            '896660',
            'validate',
            '+exit'
          ]),

          // Copy server start script from assets
          InitCommand.argvCommand(['cp', '/home/viking/assets/custom_start_valheim.sh', '/home/viking/valheimserver/']),

          // Copy backup script for ec2-user (must be changed if default user is not "ec2-user")
          InitCommand.argvCommand(['cp', '/home/viking/assets/stop_backup_start.sh', '/home/ec2-user/']),

          // Allow ec2-user to run backup script
          InitCommand.argvCommand(['chown', '-h', 'ec2-user:ec2-user', '/home/ec2-user/stop_backup_start.sh']),

          // Copy check log script from assets
          InitCommand.argvCommand(['cp', '/home/viking/assets/check_log.sh', '/home/viking/valheimserver/']),

          // Conditionally restore world from S3 Bucket 
          restoreFromS3Command,

          // Copy systemd service configuration
          InitCommand.argvCommand(['cp', '/home/viking/assets/valheimserver.service', '/etc/systemd/system/']),

          // Make our User the owner all their home contents
          InitCommand.argvCommand(['chown', '-Rh', 'viking:viking', '/home/viking/']),

          // Reload daemons
          InitCommand.argvCommand(['systemctl', 'daemon-reload'], { serviceRestartHandles: [ valheimHandle ]}),

          // Start Valheim and ensure it starts on boot
          InitService.enable('valheimserver', { serviceRestartHandle: valheimHandle })
        ])
      }
    });
    const initOptions = {
      configSets: ['default'],
      timeout: cdk.Duration.minutes(30)
    };

    /* EC2 Instance */
    const instance = new Instance(this, 'EC2Instance', {
      init,
      initOptions,
      vpc,
      machineImage,
      securityGroup,
      instanceType: InstanceType.of(props.instanceClass, props.instanceSize),
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      keyName: props.keyPairName
    });
    instance.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMFullAccess'));

    /* Elastic IP Address */
    const eip = new CfnEIP(this ,'Server IP');
    new CfnEIPAssociation(this, 'Elastic IP Association', {
      eip: eip.ref,
      instanceId: instance.instanceId
    });

    /* S3 for World backup (requires manually running script) */
    let backupS3;
    if (props.existingBucket) {
      backupS3 = s3.Bucket.fromBucketName(this, 'Backup Bucket', props.backupS3BucketName);
    } else {
      backupS3 = new s3.Bucket(this, 'Backup Bucket', {
        bucketName: props.backupS3BucketName,
        versioned: true
      });
    }
    backupS3.grantReadWrite(instance);
  }
}

interface iValheimServerCdkStackProps extends cdk.StackProps {
  keyPairName: string;
  instanceClass: InstanceClass;
  instanceSize: InstanceSize;
  backupS3BucketName: string;
  worldName: string;
  existingBucket?: boolean;
}
