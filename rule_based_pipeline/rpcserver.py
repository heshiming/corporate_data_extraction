import os
import datetime
import subprocess

from xmlrpc.server import SimpleXMLRPCServer
from xmlrpc.server import SimpleXMLRPCRequestHandler


PROCESSES = {}


# Restrict to a particular path.
class RequestHandler(SimpleXMLRPCRequestHandler):
    rpc_paths = ('/RBS',)


def process_folder(folder_name):
    global PROCESS_ID
    global PROCESSES
    base_path = os.path.join('/app/data', folder_name)
    log_stdout = os.path.join(base_path, 'stdout.txt')
    log_stderr = os.path.join(base_path, 'stderr.txt')
    stdout_fh = open(log_stdout, 'w', buffering=1)
    stderr_fh = open(log_stderr, 'w', buffering=1)
    args = ['python3', '/app/rule_based_pipeline/main.py', '--raw_pdf_folder', os.path.join(base_path, 'input'), '--working_folder', os.path.join(base_path, 'tmp'), '--output_folder', os.path.join(base_path, 'output')]
    p = subprocess.Popen(args, stdout=stdout_fh, stderr=stderr_fh, encoding='utf-8')
    PROCESSES[folder_name] = {
        'process': p,
        'created_at': datetime.datetime.now(tz=datetime.timezone.utc).replace(microsecond=0).isoformat(),
    }
    return True


def is_process_exist(folder_name):
    global PROCESSES
    return folder_name in PROCESSES


def is_process_complete(folder_name):
    global PROCESSES
    entry = PROCESSES.get(folder_name)
    if entry is None:
        return True
    if entry['process'].poll() is None:
        return False
    now = datetime.datetime.now(tz=datetime.timezone.utc).replace(microsecond=0)
    if 'finished_at' in entry:
        if (now - datetime.datetime.fromisoformat(entry['finished_at'])).seconds > 36000:
            del PROCESSES[folder_name]
    else:
        entry['finished_at'] = now.isoformat()
    return True


def get_process_output(folder_name):
    global PROCESSES
    entry = PROCESSES.get(folder_name)
    if entry is None:
        return ''
    base_path = os.path.join('/app/data', folder_name)
    log_stdout = os.path.join(base_path, 'stdout.txt')
    log_stderr = os.path.join(base_path, 'stderr.txt')
    log = ''
    with open(log_stdout) as f:
        log += f.read()
    with open(log_stderr) as f:
        log += f.read()
    return log


def get_process_field(folder_name):
    global PROCESSES
    entry = PROCESSES.get(folder_name)
    if entry is None:
        return {}
    ret = {}
    for k, v in entry.items():
        if k in ['process']:
            continue
        ret[k] = v
    return ret


def get_running_processes():
    global PROCESSES
    running = []
    for folder_name in PROCESSES.keys():
        if is_process_complete(folder_name):
            continue
        running.append(folder_name)
    return running


# Create server
port = os.environ.get('RPC_PORT', 33101)
with SimpleXMLRPCServer(('0.0.0.0', port),
                        requestHandler=RequestHandler) as server:
    server.register_introspection_functions()
    server.register_function(process_folder, 'process_folder')
    server.register_function(is_process_exist, 'is_process_exist')
    server.register_function(is_process_complete, 'is_process_complete')
    server.register_function(get_process_output, 'get_process_output')
    server.register_function(get_process_field, 'get_process_field')
    server.register_function(get_running_processes, 'get_running_processes')
    # Run the server's main loop
    print('XMLRPCServer started on port {}'.format(port), flush=True)
    server.serve_forever()
