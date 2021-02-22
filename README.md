# Valhdiem Server with CDK

An "easy" way to setup the infrastructure and a running valheim server (with manual backup capabilities) on AWS!

# DISCLAIMER

**This work is in NO WAY affiliated with Amazon or IronGate.**

**Use this code at your discretion.**

Launching EC2 instances in AWS **cost real money** and I am in no way responsible for costs accrued.


# tl;dr

* have aws account
* have/add iam role and keypair in aws account
* have aws cli installed and configured locally
* checkout code
* modify `user-config.json`
* run "`npm install && npm run bootstrap && npm run deploy`"
* wait then connect and play

Note: iam role is for using aws cli; keypair is for cdk deployment

# Recommended Setup

I **highly** recommend using AWS CloudShell as an environment to run the deployment/installation process.

The [AWS CloudShell environment](https://aws.amazon.com/cloudshell/) is already setup with the tools to run all of these commands. If you don't want to go through the process of installing NodeJs, Git, etc on your computer then you're in luck.

You will not need to install any tools using CloudShell. :D

**Within your AWS console launch AWS CloudShell and do the following**
* `aws configure`
  * have an AWS KeyPair info saved and ready to enter
  * you'll also need to enter a recommended region in the world to deploy. Pick one nearest you!
* `git clone https://github.com/rcatlin/valheim-server-cdk.git`
* `cd valheim-server-cdk`
* `npm install`
* `npm run templates && npm run assets`
* `npm bootstrap`
* `npm run deploy`
* Enter `y` when asked and hit enter
* Wait for successful creation and setup of the server
* Check that the EC2 instance and valheimserver is running (`sudo systemctl status valheimserver` on EC@ instance)
* Connect and play!

# General Setup

## Assumptions

* You have an AWS account.
* You can execute via command-line: (UNLESS YOU USE AWS CloudShell)
  * `git`
  * `node`
  * `npm`
  * `aws` (AWS CLI) - [Documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chapinstall.html)
* You have configured your local AWS credentials
  * You can run `aws configure` ([Quick Configure wiki](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html))

## Setup

* In AWS, create an IAM role
* In AWS, create a KeyPair (remember the name)
  * You will need the key/pair when you setting up your local aws settings via `aws configure`
* Configured local `aws` CLI by running `aws configure`
* Clone this repository
* Edit `user-config.json` to your preferences
  * Change to your liking
  * keyPairName is the name of the KeyPair created above

## User Config

The `user-config.json` has your setup preferences.

* `worldName` - Name of your world saved on disk. Changing this creates a NEW world file and results in a different world loading.
* `displayName` - Name that appears in Valheim server list
* `password` - MUST BE AT LEAST 5 CHARACTERS. Password used to enter your server
* `instanceClass` - AWS EC2 instance class
* `instanceSize` - AWS EC2 instance size
* `backupS3BucketName` - GLOBALLY UNIQUE S3 bucket name where your worlds can be backed-up by running the `stop_backup_start.sh` script

**Checkout the [AWS Instance Types](https://aws.amazon.com/ec2/instance-types) to see a full-list of types and sizes.** For example, `t2.medium` has an instance class of `t2` and size of `medium`.

If you run into performance/CPU bottle necks try upping the instance class (`t3`, `m4`, etc) and keep in mind they're most costly.

**Example:**
```
{
    "worldName": "GoVikingGo",
    "displayName": "Go Viking Go!",
    "password": "iceiceviking",
    "keyPairName": "your-keypair-name-here",
    "instanceClass": "m4",
    "instanceSize": "xlarge",
    "backupS3BucketName": "your-backup-bucket-name"
}
```

## General Deployment/Installation

Note: `cdk bootstrap` **must** be ran once on the AWS Account so assets can be properly deployed using the CDK toolkit stack.

* `npm install`
* `npm run templates && npm run assets`
* `npm run bootstrap` - only need to run once
* Edit `user-config.json` with your preferences!
* `npm run deploy` - run as many times as you want per code changes
* Hit the `y` key to accept the changes
* Wait for a successful CloudFormation stack creation...
* Connect and play!
* `npm run destroy` - Only if you want to **destroy** (aka delete) everything (except s3 buckets and elastic ips) with an iron hammer! 

Notes: 
* s3 assets must be manually deleted)
* bootstrapping creates tools necessary for s3/assets during deploy process

## Checking for a successful world

One easy way to check whether your world has properly been created is using "EC2 Instance Connect" within the AWS Console.
Within the console type: 
```
sudo systemctl status valheimserver
```

You should see `Active: active (running) ...`. 

There will also be a number of text output where you see `DungeonDB Start XXX` where `XXX` is a 3 digit number. This indicates the world is up and running.

## Updating User Config

Say you want to change the password...

* Edit `user-config.json` and change the password
* Remember, changing the `worldName` creates a **NEW** world file on the server. Your building(s) will **NOT** be in the new world.
* Run `npm run deploy` - this will rerender templates, tarball assets, and deploy any changes to your stack.


# Backing Up World Files

As of this writing, the world files on Linux are located on the EC2 instance at `~/.config/unity3d/IronGate/Valheim/world/`

You will need to manually save them if you want to have a backup given the CloudFormation stack is deleted.

There is a script provided in the home directory of the `ec2-user` that is called `stop_backup_start.sh`. 

Running this script will STOP the valheimserver, sync the world files into your backup S3 bucket defined in the user config, then starts the valheimserver again.

THE VALHEIMSERVER **MUST** BE STOPPED TO BACKUP THE WORLD FILES.

FAILING TO STOP THE SERVER CAN RESULT IN CORRUPTED WORLD FILES IN BACKUP.

The S3 bucket is automatically setup to be "versioned" meaning previous saves can be fetched from the S3 bucket. 

There is no current script to restore old world files. This must be done manually.

# Destroy

You can destroy the stack and most resources by running `npm run destroy`.

This command will not result in the deletion of the S3 bucket (backup folder) or the Elastic IP (public ip).

### Running Multiple Servers

Server stacks running a single EC2 instance are identified by the unique `worldName` defined in `user-config.json`.

Different world names will cause unique stack to be created.

I would recommend recloning this repository with a newly modified user config to launch additional servers on the same AWS account+region.

# Possible Future Improvements (if odin wills)

* More commands for maintenance, control, admin/ban lists, etc
* Optional NICE DCV setup
