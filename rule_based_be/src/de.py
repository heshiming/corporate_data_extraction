import os
import shutil
import asyncio
import urllib.request, urllib.parse

from sanic import Sanic, exceptions, response
from sanic.log import logger
from sanic_ext import Extend

import job_queue


app = Sanic("osc-de")
app.config.CORS_ORIGINS = 'http://localhost,http://127.0.0.1'
Extend(app)


def sanitize_filename(filename):
    return filename.replace(':', '_').replace('/', '_').replace('\\', '_').strip('.')


async def job_queue_monitor():
    while True:
        next_poll = job_queue.check()
        await asyncio.sleep(next_poll)


@app.post('/upload/<session>')
async def upload(request, session):
    if not session:
        raise exceptions.BadRequest()
    if not request.files:
        raise exceptions.BadRequest()
    if len(request.files) == 0:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    session_path = os.path.join(os.environ['FILE_PATH'], session, 'upload')
    os.makedirs(session_path, exist_ok=True)
    for k, v in request.files.items():
        filename = sanitize_filename(v[0].name)
        file_fullpath = os.path.join(session_path, filename)
        with open(file_fullpath, 'wb') as f:
            f.write(v[0].body)
            logger.info('wrote {}\n'.format(file_fullpath))
    return response.json({
        'status': 'ok'
    })


def _list_uploaded(session):
    session = sanitize_filename(session)
    session_path = os.path.join(os.environ['FILE_PATH'], session, 'upload')
    ret = []
    try:
        for filename in os.listdir(session_path):
            if not filename.lower().endswith('.pdf'):
                continue
            ret.append(filename)
    except FileNotFoundError:
        pass
    return ret


@app.get('/uploaded/<session>')
async def list_uploaded(request, session):
    if not session:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    files = _list_uploaded(session)
    return response.json({
        'status': 'ok',
        'data': files
    })


@app.post('/delete_uploaded/<session>')
async def delete_uploaded(request, session):
    if not session:
        raise exceptions.BadRequest()
    if not request.json:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    filenames = request.json.get('filenames', [])
    session_path = os.path.join(os.environ['FILE_PATH'], session, 'upload')
    for filename in filenames:
        try:
            filename_path = os.path.join(session_path, sanitize_filename(filename))
            os.remove(filename_path)
        except:
            pass
    return response.json({ 'status': 'ok' })


@app.post('/queue_job/<session>')
async def queue_job(request, session):
    if not session:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    files = _list_uploaded(session)
    if not files:
        return response.json({ 'status': 'fail' })
    job_queue.add(session)
    return response.json({ 'status': 'ok' })


@app.get('/jobs/<session>')
async def list_jobs(request, session):
    if not session:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    return response.json({'status': 'ok', 'data': job_queue.list_all(session)})


@app.get('/job/<session>/<job_name>')
async def get_job(request, session, job_name):
    if not session:
        raise exceptions.BadRequest()
    if not job_name:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    job_name = sanitize_filename(job_name)
    job = job_queue.get_one(session, job_name)
    return response.json({'status': 'ok', 'data': job})


@app.get('/job_logs/<session>/<job_name>')
async def get_job_logs(request, session, job_name):
    if not session:
        raise exceptions.BadRequest()
    if not job_name:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    job_name = sanitize_filename(job_name)
    job = job_queue.get_logs(session, job_name)
    return response.json({'status': 'ok', 'data': job})


@app.post('/cancel_job/<session>/<job_name>')
async def cancel_job(request, session, job_name):
    if not session:
        raise exceptions.BadRequest()
    if not job_name:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    job_name = sanitize_filename(job_name)
    job_queue.cancel(session, job_name)
    return response.json({'status': 'ok'})


@app.get('/download_job/<session>/<job_name>')
async def download_job(request, session, job_name):
    if not session:
        raise exceptions.BadRequest()
    if not job_name:
        raise exceptions.BadRequest()
    session = sanitize_filename(session)
    job_name = sanitize_filename(job_name)
    filename = job_queue.make_result_archive(session, job_name)
    return await response.file(filename)


@app.get('/ping')
async def ping(request):
    return response.text('ping back')


@app.before_server_start
async def start_queue_monitor(app):
    app.add_task(job_queue_monitor)


if __name__ == '__main__':
    app.run()
