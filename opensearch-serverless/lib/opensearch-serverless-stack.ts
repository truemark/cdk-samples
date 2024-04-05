import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as aoss from "aws-cdk-lib/aws-opensearchserverless";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
export class OpensearchServerlessStack extends cdk.Stack {
  collectionUid: string;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Unique name for the collection
    this.collectionUid = "logs-collection";

    // Create OpenSearch Serverless Collection
    const collection = new aoss.CfnCollection(this, "OpensearchCollection", {
      name: this.collectionUid,
      type: "SEARCH",
    });

    // Define and apply an encryption policy
    const encryptionPolicy = {
      Rules: [
        {
          ResourceType: "collection",
          Resource: [`collection/${collection.name}`],
        },
      ],
      AWSOwnedKey: true,
    };

    const encryptionPolicyCfn = new aoss.CfnSecurityPolicy(
      this,
      "OpensearchEncryptionPolicy",
      {
        name: `EncryptPolicy${this.collectionUid}`.toLowerCase(),
        policy: JSON.stringify(encryptionPolicy),
        type: "encryption",
      }
    );

    // Define and apply a network policy
    const networkPolicy = [
      {
        Rules: [
          {
            ResourceType: "collection",
            Resource: [`collection/${collection.name}`],
          },
          {
            ResourceType: "dashboard",
            Resource: [`collection/${collection.name}`],
          },
        ],
        AllowFromPublic: true,
      },
    ];

    const networkPolicyCfn = new aoss.CfnSecurityPolicy(
      this,
      "OpensearchNetworkPolicy",
      {
        name: `NetworkPolicy${this.collectionUid}`.toLowerCase(),
        policy: JSON.stringify(networkPolicy),
        type: "network",
      }
    );

    collection.addDependency(encryptionPolicyCfn);
    collection.addDependency(networkPolicyCfn);
  }
  public grantCollectionAccess(
    construct: Construct & { role?: cdk.aws_iam.IRole }
  ) {
    const policy = [
      {
        Description: "Access",
        Rules: [
          {
            ResourceType: "index",
            // Resource: ["index/*/*"],
            Resource: [`index/${this.collectionUid}/*`],
            Permission: [
              // "aoss:*",
              "aoss:ReadDocument",
              "aoss:WriteDocument",
              "aoss:CreateIndex",
              "aoss:DeleteIndex",
              "aoss:UpdateIndex",
              "aoss:DescribeIndex",
            ],
          },
          {
            ResourceType: "collection",
            Resource: [`collection/${this.collectionUid}`],
            Permission: [
              // "aoss:*",
              "aoss:CreateCollectionItems",
              "aoss:DeleteCollectionItems",
              "aoss:UpdateCollectionItems",
              "aoss:DescribeCollectionItems",
            ],
          },
        ],
        Principal: [construct.role?.roleArn],
      },
    ];

    const accessPolicy = new aoss.CfnAccessPolicy(construct, "Policy", {
      name:
        "acc" +
        cdk.Names.uniqueResourceName(construct, { maxLength: 8 }).toLowerCase(),
      type: "data",
      policy: JSON.stringify(policy),
    });

    construct.role?.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: ["aoss:*"],
      })
    );
    return accessPolicy;
  }

  private _grantCollectionAccess(principalsForAOSS: (string | undefined)[]) {
    const policy = [
      {
        Description: "Access",
        Rules: [
          {
            ResourceType: "index",
            Resource: [`index/${this.collectionUid}/*`],
            Permission: ["aoss:*"],
          },
          {
            ResourceType: "collection",
            Resource: [`collection/${this.collectionUid}`],
            Permission: ["aoss:*"],
          },
        ],
        Principal: principalsForAOSS,
      },
    ];

    const accessPolicy = new aoss.CfnAccessPolicy(this, "Policy", {
      name:
        "acc" +
        cdk.Names.uniqueResourceName(this, { maxLength: 8 }).toLowerCase(),
      type: "data",
      policy: JSON.stringify(policy),
    });
    return accessPolicy;
  }
}
