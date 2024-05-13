import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {Cluster, ContainerImage, CpuArchitecture} from 'aws-cdk-lib/aws-ecs';
import {Subnet, Vpc} from 'aws-cdk-lib/aws-ec2';
import {ApplicationLoadBalancer, ApplicationProtocol, ListenerAction} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {StandardApplicationFargateService} from 'truemark-cdk-lib/aws-ecs';
import {DockerImageAsset, Platform} from 'aws-cdk-lib/aws-ecr-assets';
import * as path from 'node:path';

export interface EcsFargateStackProps extends ExtendedStackProps {
  readonly vpcId: string;
  readonly publicSubnetIds: string[];
  readonly privateSubnetIds: string[];
}

export class EcsFargateStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: EcsFargateStackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'Vpc', {
      vpcId: props.vpcId,
    });
    const publicSubnets = props.publicSubnetIds.map(subnetId => Subnet.fromSubnetId(this, `Subnet-${subnetId}`, subnetId));
    const privateSubnets = props.privateSubnetIds.map(subnetId => Subnet.fromSubnetId(this, `Subnet-${subnetId}`, subnetId));

    // Normally you would lookup an existing cluster instead of create one
    const cluster = new Cluster(this, 'Cluster', {
      vpc
    });

    // Normally you would lookup an existing application load balancer instead of create one
    const loadBalancer = new ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc,
      vpcSubnets: {
        subnets: publicSubnets,
      }
    });
    const listener = loadBalancer.addListener('Listener', {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'OK',
      }),
    });

    const imageAsset = new DockerImageAsset(this, 'Image', {
      directory: path.join(__dirname, '..'),
      file: 'Dockerfile',
      exclude: ['cdk'],
      platform: Platform.LINUX_ARM64,
    });

    const service = new StandardApplicationFargateService(this, 'Service', {
      cluster,
      port: 8080,
      healthCheckPath: '/health',
      memoryLimitMiB: 1024,
      cpu: 512,
      minCapacity: 1,
      maxCapacity: 2,
      vpcSubnets: {
        subnets: privateSubnets,
      },
      image: ContainerImage.fromDockerImageAsset(imageAsset),
      loadBalancer,
      listener,
      cpuArchitecture: CpuArchitecture.ARM64,
      allowAllIpv6Outbound: true,
    });

    imageAsset.repository.grantPull(service.service.taskDefinition.obtainExecutionRole());
  }
}
