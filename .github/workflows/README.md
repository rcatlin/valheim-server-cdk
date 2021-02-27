# Github Action Documentation

Create a personal access token if triggering from POST request:
https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

Action event workflow_dispatch documentation:
https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_dispatch

Create a workflow_dispatch event documentation:
https://docs.github.com/en/rest/reference/actions#create-a-workflow-dispatch-event

Adding secrets to the repository:
https://docs.github.com/en/actions/reference/encrypted-secrets

## Inputs for valheim-server-cdk repo:

### `AWS_REGION`

**Required** A valid AWS region.

### `AWS_ACCESS_KEY_ID`

**Required** AWS Access key ID.

### `AWS_SECRET_ACCESS_KEY`

**Required** AWS Secret Access key.

### `INSTANCE_ID`

**Required** A single instance id or a list of ids seperated with new lines.

## TODO
You could have additional backup/update YAML workflow files per server, and slightly tweak the secret names in each to manage different servers.
