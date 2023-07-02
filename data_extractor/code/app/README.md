docker build --progress plain --rm -f app/dockerfile -t heshiming/data_extraction_app --build-arg VITE_ENDPOINT_BASE=/api app/
docker push heshiming/data_extraction_app

# https://docs.openshift.com/container-platform/4.12/openshift_images/image-streams-manage.html
~/oc tag docker.io/heshiming/data_extraction_app:latest aicos-osc-demo/data-extraction-app:latest
~/oc tag docker.io/heshiming/rule_based_pipeline:latest aicos-osc-demo/project-showcase-rule-based-pipeline:latest
