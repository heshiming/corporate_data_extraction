# a subprocess mananger

import os
import datetime
import threading
import subprocess


def stream_reader(stdout, log_file):
    # perform log file write every 0.2 second
    last_write = datetime.datetime.now()
    lines = []
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line.decode('utf-8'), end='')
        lines.append(line)
        if (datetime.datetime.now() - last_write).total_seconds() > 0.2:
            with open(log_file, 'ab') as f:
                f.write(b''.join(lines))
                f.flush()
                lines = []
                last_write = datetime.datetime.now()
    with open(log_file, 'ab') as f:
        f.write(b''.join(lines))
        f.flush()
        lines = []
    with open(log_file, 'ab') as f:
        f.write(b"\n---------------END_OF_PROCESSING---------------\n")
        f.flush()


def run(cmd_args, log_dir):
    proc = subprocess.Popen(cmd_args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, close_fds=True)
    log_file = os.path.join(log_dir, 'log.txt')
    with open(log_file, 'wb') as f:
        f.truncate()
    t = threading.Thread(target=stream_reader, args=(proc.stdout, log_file))
    t.start()
