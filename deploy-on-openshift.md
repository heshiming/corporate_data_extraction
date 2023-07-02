# Deploying on Red Hat OpenShift Platform

## Prerequisites

This guide is written for Red Hat OpenShift Platform version 4.13. To set up and run the projects on Red Hat OpenShift Platform, you need:

1. An account at a Red Hat OpenShift cluster with sufficient privilege to create Applications, Pods, DeploymentConfigs, PersistentVolumeClaims.
2. An account at <a href="https://hub.docker.com" target="_blank">Docker Hub</a> for uploading Docker images to the `docker.io` public registry.
3. <a href="https://www.docker.com/products/docker-desktop" target="_blank">Docker Desktop</a> software.
4. oc - OpenShift Command Line Interface (CLI), <a href="https://developers.redhat.com/openshift/command-line-tools" target="_blank">available through your particular instance of cluster, after login.</a>

## Procedures

### Overview

The deployment steps are:

1. Clone the "corporate_data_extraction" locally.
2. Build corresponding container Docker images locally, using Docker Desktop.
3. Push (publish) the Docker images to the `docker.io` public registry.
4. In OpenShift, add an application via container images at `docker.io`.
5. Configure the application.
6. Add "PersistentVolumeClaims" for sharing data between containers.
7. Use "DeploymentConfig" to add storage to containers that need to share data.

When "DeploymentConfig" is chosen as the resource type (instead of "Deployment"), OpenShift is capable of updating the application automatically if you tell the "ImageStream" that the upstream (`docker.io`) image has been updated. To upgrade:

1. Push the updated Docker images to the `docker.io` public registry.
2. Using the `oc` cli tool, signal an update to the "ImageStream", e.g.: `$ oc tag docker.io/heshiming/data_extraction_app:latest aicos-osc-demo/data-extraction-app:latest`

OpenShift will follow the "DeploymentConfig" to recreate the Pods, keeping the original configuration.

### Building the images for the containers

If you would like to skip building Docker images and use readily available ones, replace `docker.io/username` below with `docker.io/heshiming`.

First enter the `code` subdir:

    $ cd data_extractor/code

For the rule-based pipeline, and model pipeline containers:

    $ docker build --rm -f model_pipeline/Dockerfile -t model_pipeline .
    $ docker build --rm -f rule_based_pipeline/Dockerfile -t rule_based_pipeline .

For the "app" container, which provides the frontend access to the above container functionalities, you need to specify a `VITE_ENDPOINT_BASE` argument to replace the development frontend endpoints to the production setup:

    $ docker build --progress plain --rm -f app/dockerfile -t data_extraction_app --build-arg VITE_ENDPOINT_BASE=/api app/

To push the images to the Docker registry, you need to retag the built images with your own username. Also, make sure you logged in on Docker Desktop:

    $ docker tag model_pipeline username/model_pipeline
    $ docker tag rule_based_pipeline username/rule_based_pipeline
    $ docker tag data_extraction_app username/data_extraction_app

And push them:

    $ docker push model_pipeline username/model_pipeline
    $ docker push rule_based_pipeline username/rule_based_pipeline
    $ docker push data_extraction_app username/data_extraction_app

Repeat these steps to update the images upon code changes.

### Running on OpenShift

For the frontend app `data_extraction_app` to talk to `model_pipeline` and `rule_based_pipeline` via TCP/IP, they should live in the same "Application Group" under the same "OpenShift Project".

To start the `rule_based_pipeline` container, click "+Add" in a "Project" and choose "Container Images" as source. Enter the registry image name: `docker.io/username/rule_based_pipeline`. Pay attention to "Application" section, to create or choose an appropriate group, which must be used for the other containers. Enter a name. Choose "DeploymentConfig" as "Resources". Enter `8000` as "Target Port", as the container exposes this port. Uncheck "Create a route to the Application" because this container is only accessed through the `data_extraction_app`, and should not be exposed to the public.

Once the pod is created, you need to record its IP address, which is shown as a LAN-local address under "Pod IP" of the Pod page.

Repeat the steps for `model_pipeline`, using `docker.io/username/model_pipeline` as image and `6000` as port number. Also record its IP address.

Repeat the steps for `data_extraction_app`, using `docker.io/username/data_extraction_app` as image and `8000` as port number. This time, check "Create a route to the Application" because it's a public accessible web-app.

Choose `data_extraction_app`'s "DeploymentConfig" (abbreviated as "DC") and choose "Edit DeploymentConfig" under "Actions" dropdown for some futher configuration. In the "Environment Variables" section, add the following items:

* name: FILE_PATH, value: `/app/data`
* name: RBP_URL, value: `IP_of_rule-based-pipeline-container:8000`
* name: MP_URL, value: `IP_of_model-pipeline-container:6000`

One last step is to create shared storage for these containers. This is called "PersistentVolumeClaims" in OpenShift. You can move over to the "Administrator" page or ask your admin to create one for you. Once this is done, move over again to "DeploymentConfig", and choose "Add storage" from the "Actions" dropdown. Select the "PersistentVolumeClaim" you just created, and enter `/app/data` as mount path. Repeat this for all the "DeploymentConfigs" created for all containers to share this path.

OpenShift will recreate Pods to apply the storage change, which will make the deployments fully-functional.

### Updating OpenShift containers

Updating, or syncing OpenShift images with Docker registry, is a command line operation using the `oc` executable described in the prerequisites section. Before you can update, `oc` has to be logged in. To do this, open the Red Hat OpenShift Platform web-console, and click your user name at top-right corner, select "Copy login command". You will get the syntax with a token for `oc` to log on.

Container update requires the "DeploymentConfig" mechanism on OpenShift, and is automatic. If you followed the previous section to run the containers, they have already been configured to use "DeploymentConfig". By default, the "DeploymentConfig" will trigger a Pod recreation upon "ImageStream" update. But since our actual images live on the Docker registry and not OpenShift, we have to notify ImageStream. To do this (`aicos-osc-demo` is the name of the OpenShift project):

    $ oc tag docker.io/username/data_extraction_app:latest aicos-osc-demo/data-extraction-app:latest
    $ oc tag docker.io/username/rule_based_pipeline:latest aicos-osc-demo/rule_based_pipeline:latest
    $ oc tag docker.io/username/model_pipeline:latest aicos-osc-demo/model_pipeline:latest

To learn more about "ImageStreams", please refer to the documentation: https://docs.openshift.com/container-platform/4.12/openshift_images/image-streams-manage.html.

## Quirkiness

Some of the setups in container `dockerfile`s are to deal with the unprivileged settings in Red Hat OpenShift Platform, our primary target for deployment. <a href="https://cookbook.openshift.org/users-and-role-based-access-control/why-do-my-applications-run-as-a-random-user-id.html" target="_blank">OpenShift enforces the container to run as an unprivileged user under id 1001850000</a>. You can spin up a Pod and obtain this information using the `id` command from the terminal:

    $ id
    uid=1001850000(1001850000) gid=0(root) groups=0(root),1001850000

Also, from `/etc/passwd`:

    $ cat /etc/passwd
    ...
    1001850000:x:1001850000:0:1001850000 user:/:/sbin/nologin

In other words, before OpenShift spins up a Pod, it appends the following commands to the `dockerfile`:

    ...
    RUN useradd --gid 0 -u 1001850000 1001850000
    USER 1001850000

You can add the above commands to your own `dockerfile` to reproduce permission denied errors locally. Such a setting may prevent, for example, the nginx master process to start as a system service. Our setup <a href="data_extractor/code/app/dockerfile" target="_blank">includes `chown` and `useradd` commands</a> in a stock debian image to allow running at lower privilege.
