import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import { SecurityGroup, } from 'aws-cdk-lib/aws-ec2';
import * as ec2 from 'aws-cdk-lib/aws-ec2'

export class RdsPostgresStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props,);


    // using an existing VPC
    const vpc = ec2.Vpc.fromLookup(this, 'services', {
      vpcId: 'vpc-0ffd61df91b619a2a',
  });

  // Create a security group for the RDS instance on port 5432

  const securityGroup = new SecurityGroup(this, 'RDS-SG', {
    securityGroupName: 'rds-sg',
    vpc,
    allowAllOutbound: true,
});

securityGroup.addIngressRule(ec2.Peer.ipv4("10.0.0.0/16"),ec2.Port.tcp(5432), 'Allow Postgres access from 10.0.0.0/16 subnet');

new rds.DatabaseInstance(this, 'Instance', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15_5,
  }),
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
  vpc,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PUBLIC,
  },
  multiAz: false,
  allocatedStorage: 20, // Minimum storage size in GB
  maxAllocatedStorage: 50, // Enables storage autoscaling up to a maximum of 50 GB
  deleteAutomatedBackups: true,
  backupRetention: cdk.Duration.days(0), // Disables automated backups;
  securityGroups: [securityGroup], // Attach above security group to the RDS instance
  databaseName: 'rdspostgres',
  credentials: rds.Credentials.fromGeneratedSecret("postgres", {
    secretName: 'rds-secret',
    }),

  publiclyAccessible: false,
  enablePerformanceInsights: true,
  storageEncrypted: true,
  storageType: rds.StorageType.GP3
});

  }
  }






