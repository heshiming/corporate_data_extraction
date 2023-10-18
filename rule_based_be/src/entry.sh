#!/bin/bash

service nginx start
sanic de.app --host=0.0.0.0 --port=1300
