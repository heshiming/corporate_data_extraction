# The "Corporate Data Extraction" Project Collection 🌱

A collaborative effort aimed at extracting select Green House Gas emission datapoints from sustainability reports in PDF format. The collection currently contains two important projects:

1. The **"Rule-Based Pipeline"** developed by Dr. Ismail Demir (IDS GmbH) and contributors, implementing a PDF text-conversion and graphical table border detection mechanism, with NLP techniques to search for datapoints while associating them with a nearby timestamp.
2. The **"Model Pipeline"** developed by Dr. David Besslich (IDS GmbH) and contributors, implementing a Huggingface Transformer based machine-learning approach for mapping PDF document texts directly to the datapoints.

A web-app demo of these projects is hosted at https://data-extraction-app-aicos-osc-demo.apps.odh-cl2.apps.os-climate.org.

The `dockerfile`s and their setup may contain mechanisms to allow deployment on Red Hat OpenShift Platform. Refer to <a href="deploy-on-openshift.md" target="_blank">Deploying on OpenShift Platform</a> for the respective instructions and how they resulted in a different container setup.
