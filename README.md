# Valhdiem Server with CDK (ALPHA)

## tl;dr

* have aws account
* have/add iam role and keypair in aws account
* have aws cli
* checkout code
* modify `user-config.json`
* run "`npm install && cdk bootstrap && npm run getsteamcmd && npm run deploy`"
* wait then connect and play

Note: iam role is for using aws cli; keypair is for cdk deployment

## Assumptions

* You have an AWS account.
* You can execute via command-line:
  * `git`
  * `node`
  * `npm`
  * `aws` (AWS CLI) - [Documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chapinstall.html)
  * `cdk` (AWS CDK CLI)
    * `npm install -g aws-cdk`
* You have configured your local AWS credentials
  * You can run `aws configure`

## Setup

* In AWS, create an IAM role
* In AWS, create a KeyPair (remember the name)
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

**Checkout the [AWS Instance Types](https://aws.amazon.com/ec2/instance-types) to see a full-list of types and sizes.** For example, `m4.xlarge` has an instance class of `m4` and size of `xlarge`.

**Example:**
```
{
    "worldName": "GoVikingGo",
    "displayName": "Go Viking Go!",
    "password": "iceiceviking",
    "keyPairName": "your-keypair-name-here",
    "instanceClass": "m4",
    "instanceSize": "xlarge"
}
```

## Deployment

Note: `cdk bootstrap` **must** be ran once on the AWS Account so assets can be properly deployed using the CDK toolkit stack.

* `npm install`
* `npm run bootstrap` - run once
* `npm run getsteamcmd` - download SteamCMD into assets dir
* Edit `user-config.json` with your preferences!
* `npm run deploy` - run as many times as you want per code changes
* Wait for a successful CloudFormation stack creation...
* Connect and play!
* `npm run destroy` - Only if you want to **destroy** everything (except s3 assets) with an iron hammer! 

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


## Backup World Files

Currently, you will need to manually backup your world files.

As of this writing, the world files on Linux are located on the EC2 instance at `~/.config/unity3d/IronGate/Valheim/world/`

You will need to manually save them if you want to have a backup given the CloudFormation stack is deleted.


# Possible Future Improvements (if odin wills)
* Auto versioned backup of world files to S3