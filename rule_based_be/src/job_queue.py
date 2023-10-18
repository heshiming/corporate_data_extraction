import os
import shutil
import datetime
import fasteners
import xmlrpc.client

from sanic.log import logger


MAX_RUNNING_PROCS = os.environ.get('MAX_RUNNING_PROCS', 2)
LOCK = fasteners.InterProcessLock(os.path.join(os.environ['FILE_PATH'], 'queue.lock'))
QUEUE_FILE = os.path.join(os.environ['FILE_PATH'], 'job_queue.txt')
ACTIVE_FILE = os.path.join(os.environ['FILE_PATH'], 'job_active.txt')
RPCSERVER_URL = "http://{}/RBS".format(os.environ['RBP_URL'])


def _load_queue():
    queue = []
    try:
        with open(QUEUE_FILE) as f:
            queue = f.readlines()
    except FileNotFoundError:
        pass
    queue = [x.strip() for x in queue if x.strip()]
    return queue


def _save_queue(queue):
    with open(QUEUE_FILE, 'w') as f:
        f.write('\n'.join(queue) + '\n')


def _load_active():
    queue = []
    try:
        with open(ACTIVE_FILE) as f:
            queue = f.readlines()
    except FileNotFoundError:
        pass
    queue = [x.strip() for x in queue if x.strip()]
    return queue


def _save_active(queue):
    with open(ACTIVE_FILE, 'w') as f:
        f.write('\n'.join(queue) + '\n')


def add(session):
    now = datetime.datetime.now(tz=datetime.timezone.utc).replace(microsecond=0)
    session_path = os.path.join(os.environ['FILE_PATH'], session, 'upload')
    job_name = 'job_{}'.format(now.strftime('%Y-%m-%d-%H-%M-%S'))
    job_path = os.path.join(os.environ['FILE_PATH'], session, job_name, 'input')
    with LOCK:
        os.makedirs(job_path, exist_ok=True)
        for e in os.scandir(session_path):
            if not e.is_file():
                continue
            os.rename(e.path, os.path.join(job_path, e.name))
        queue = _load_queue()
        queue.append('{}|{}'.format(session, job_name))
        _save_queue(queue)
        logger.info('job {} {} added'.format(session, job_name))
    return job_name


def delete(session, job_name):
    job_path = os.path.join(os.environ['FILE_PATH'], session, job_name)
    shutil.rmtree(job_path, ignore_errors=True)
    logger.info('job {} {} deleted'.format(session, job_name))


def cancel(session, job_name):
    with LOCK:
        queue = _load_queue()
        line_to_delete = '{}|{}'.format(session, job_name)
        try:
            queue.remove(line_to_delete)
        except ValueError:
            pass
        _save_queue(queue)
    delete(session, job_name)
    logger.info('job {} {} canceled'.format(session, job_name))


def check():
    next_poll = 10
    # find slots
    with xmlrpc.client.ServerProxy("http://{}/RBS".format(os.environ['RBP_URL'])) as proxy:
        running_procs = proxy.get_running_processes()
    with LOCK:
        # mark actives as finished
        active = _load_active()
        lines_to_delete = []
        for line in active:
            session, job_name = line.split('|')
            with xmlrpc.client.ServerProxy("http://{}/RBS".format(os.environ['RBP_URL'])) as proxy:
                if proxy.is_process_complete('{}/{}'.format(session, job_name)):
                    logger.info('process {} {} is complete'.format(session, job_name))
                    lines_to_delete.append(line)
                else:
                    next_poll = 10
        for line in lines_to_delete:
            active.remove(line)
        _save_active(active)
        slots_left = MAX_RUNNING_PROCS - len(active)
    # start queue
    for i in range(0, slots_left):
        with LOCK:
            queue = _load_queue()
            active = _load_active()
            lines_to_add = []
            lines_to_delete = []
            for line in queue:
                session, job_name = line.split('|')
                with xmlrpc.client.ServerProxy("http://{}/RBS".format(os.environ['RBP_URL'])) as proxy:
                    try:
                        proxy.process_folder('{}/{}'.format(session, job_name))
                        logger.info('process {} {} is started'.format(session, job_name))
                    except xmlrpc.client.Fault:
                        pass
                next_poll = 30
                lines_to_add.append(line)
                lines_to_delete.append(line)
                # process 1 entry in queue at a time
                break
            for line in lines_to_delete:
                queue.remove(line)
            active += lines_to_add
            _save_queue(queue)
            _save_active(active)
            if (lines_to_delete or
                lines_to_add):
                logger.info('current queue: {}'.format(queue))
                logger.info('current active: {}'.format(active))
    return next_poll


def list_all(session):
    session_path = os.path.join(os.environ['FILE_PATH'], session)
    jobs = []
    for e in os.scandir(session_path):
        if not e.is_dir():
            continue
        if not e.name.startswith('job_'):
            continue
        job = get_one(session, e.name)
        jobs.append(job)
    jobs.sort(key=lambda x: x['id'], reverse=True)
    return jobs


def get_one(session, job_name):
    job_path = os.path.join(os.environ['FILE_PATH'], session, job_name)
    elems = job_name[4:].split('-')
    created_at = datetime.datetime(int(elems[0]), int(elems[1]), int(elems[2]), int(elems[3]), int(elems[4]), int(elems[5]), tzinfo=datetime.timezone.utc)
    job = {
        'id': job_name,
        'files': [],
        'created_at': created_at.isoformat(),
        'updated_at': created_at.isoformat(),
        'status': 'finished'
    }
    input_path = os.path.join(job_path, 'input')
    output_path = os.path.join(job_path, 'output')
    for ie in os.scandir(input_path):
        if not ie.is_file():
            continue
        if ie.name.startswith('.'):
            continue
        job['files'].append(ie.name)
    try:
        for ie in os.scandir(output_path):
            if not ie.name.startswith('.'):
                job['has_results'] = True
                break
    except FileNotFoundError:
        pass
    job_line = '{}|{}'.format(session, job_name)
    with LOCK:
        queue = _load_queue()
        active = _load_active()
    if job_line in queue:
        job['status'] = 'queued'
    elif job_line in active:
        job['status'] = 'in progress'
        with xmlrpc.client.ServerProxy("http://{}/RBS".format(os.environ['RBP_URL'])) as proxy:
            fields = proxy.get_process_field('{}/{}'.format(session, job_name))
            if 'created_at' in fields:
                job['launched'] = fields['created_at']
    return job


def get_logs(session, job_name):
    job_path = os.path.join(os.environ['FILE_PATH'], session, job_name)
    log_stdout = os.path.join(job_path, 'stdout.txt')
    log_stderr = os.path.join(job_path, 'stderr.txt')
    log = ''
    with open(log_stdout) as f:
        log += f.read()
    with open(log_stderr) as f:
        log += f.read()
    return log


def make_result_archive(session, job_name):
    job_path = os.path.join(os.environ['FILE_PATH'], session, job_name)
    output_path = os.path.join(job_path, 'output')
    shutil.make_archive(os.path.join(os.environ['FILE_PATH'], session, job_name), 'zip', output_path)
    return os.path.join(os.environ['FILE_PATH'], session, '{}.zip'.format(job_name))

