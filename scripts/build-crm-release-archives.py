#!/usr/bin/env python3
"""Build reproducible CRM source archives directly from Git blobs, never worktree text.

No production access, .env, node_modules, uploads, credentials or runtime build is
involved. Output must be outside the repository. Requires Python 3.10+ and Git.
"""

import argparse
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parent.parent
WEB_PATHS = (
    'next.config.ts', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
    'postcss.config.js', 'tailwind.config.js', 'tsconfig.json', 'public', 'src',
)
API_PATHS = (
    'backend/adminSessions.js', 'backend/chatCommercialPlaybook.js',
    'backend/crmAuthRoutes.js', 'backend/crmOtp.js', 'backend/crmOtpStore.js',
    'backend/crmSessionProof.js', 'backend/db.js', 'backend/db_pg.js',
    'backend/invoicing/config.js', 'backend/invoicing/invoiceBuilder.js',
    'backend/invoicing/invoiceService.js', 'backend/invoicing/mailer.js',
    'backend/invoicing/ride.js', 'backend/invoicing/signer.js',
    'backend/invoicing/sriClient.js', 'backend/package-lock.json',
    'backend/package.json', 'backend/paymentStateStore.js', 'backend/server.js',
    'backend/sql/20261117_crm_auth_otp.sql', 'backend/supabaseClient.js',
    'backend/transferApproval.js',
)


def git(*args: str) -> bytes:
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def stream_archive(commit: str, prefix: str, paths: tuple[str, ...], dest: Path) -> str:
    proc = subprocess.Popen(
        ['git', '-C', str(ROOT), '-c', 'core.autocrlf=false', '-c', 'core.eol=lf',
         'archive', '--format=tar', '--prefix=' + prefix + '/',
         commit, *paths], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    assert proc.stdout is not None
    # Gzip header mtime=0 and empty filename; Git archive itself is tied to the
    # commit, not to checkout line endings, filesystem timestamps or PowerShell.
    try:
        with dest.open('wb') as output, gzip.GzipFile(fileobj=output, mode='wb', filename='', mtime=0) as compressed:
            for chunk in iter(lambda: proc.stdout.read(1024 * 1024), b''):
                compressed.write(chunk)
        error = proc.stderr.read() if proc.stderr else b''
        if proc.wait() != 0:
            raise RuntimeError('git archive failed: ' + error.decode('utf-8', errors='replace'))
    except BaseException:
        proc.kill()
        proc.wait()
        dest.unlink(missing_ok=True)
        raise
    finally:
        proc.stdout.close()
        if proc.stderr:
            proc.stderr.close()
    return hashlib.sha256(dest.read_bytes()).hexdigest()


def verify_files(commit: str, archive: Path, prefix: str, required: tuple[str, ...]) -> dict:
    files = {}
    with tarfile.open(archive, 'r:gz') as tar:
        for member in tar:
            if member.isdir():
                continue
            if not member.isfile() or not member.name.startswith(prefix + '/'):
                raise RuntimeError('Non-regular or unexpected archive entry')
            source = member.name[len(prefix) + 1:]
            if not source or '..' in source.split('/') or Path(source).name.startswith('.env'):
                raise RuntimeError('Unsafe archive entry')
            data = tar.extractfile(member).read()
            blob = git('cat-file', 'blob', commit + ':' + source)
            if data != blob:
                raise RuntimeError('Git blob differs byte-for-byte from archive: ' + source)
            files[source] = hashlib.sha256(data).hexdigest()
    for path in required:
        if path not in files:
            raise RuntimeError('Required file absent: ' + path)
    return files


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', required=True, help='exact 40-character Git commit')
    parser.add_argument('--output-dir', required=True, type=Path)
    args = parser.parse_args()
    commit = args.ref.lower()
    if len(commit) != 40 or any(c not in '0123456789abcdef' for c in commit):
        parser.error('Pass a full 40-character commit, not a branch or floating ref')
    if git('rev-parse', '--verify', commit + '^{commit}').decode().strip() != commit:
        parser.error('Commit not found')
    output = args.output_dir.resolve()
    if output == ROOT or ROOT in output.parents:
        parser.error('Output must be outside the repository')
    output.mkdir(parents=True, exist_ok=True)
    if any(output.iterdir()):
        parser.error('Output directory must be empty; never overwrite prior evidence')

    summary = {'commit': commit, 'archives': {}}
    for name, paths, required in (
        ('web', WEB_PATHS, ('src/lib/hermes/api.js', 'src/app/admin/crm/administracion/page.jsx',
                            'src/app/admin/crm/inbox/page.jsx', 'public/landing-primary/index.html')),
        ('api', API_PATHS, ('backend/server.js', 'backend/package-lock.json',
                            'backend/crmSessionProof.js', 'backend/sql/20261117_crm_auth_otp.sql')),
    ):
        file = output / f'undercode-{name}-{commit[:12]}-git.tar.gz'
        try:
            sha = stream_archive(commit, name, paths, file)
            files = verify_files(commit, file, name, required)
        except BaseException:
            file.unlink(missing_ok=True)
            raise
        summary['archives'][name] = {'file': file.name, 'sha256': sha, 'bytes': file.stat().st_size,
                                     'verified_git_blobs': len(files),
                                     'server_sha256': files.get('backend/server.js')}
    manifest = output / 'SHA256SUMS.json'
    manifest.write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (OSError, subprocess.CalledProcessError, RuntimeError) as exc:
        print(f'Archive validation failed: {exc}', file=sys.stderr)
        raise SystemExit(1) from exc
