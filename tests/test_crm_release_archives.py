"""Regression: release packaging must preserve Git bytes, not Windows text pipes."""

import hashlib
import importlib.util
from pathlib import Path
import tarfile
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parent.parent / 'scripts' / 'build-crm-release-archives.py'
spec = importlib.util.spec_from_file_location('crm_release_archives', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
COMMIT = module.git('rev-parse', 'HEAD').decode().strip()
SOURCE = 'backend/server.js'


class ReleaseArchiveTests(unittest.TestCase):
    def test_archives_reproduce_exact_git_blob(self):
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / 'one.tar.gz'
            second = Path(directory) / 'two.tar.gz'
            one = module.stream_archive(COMMIT, 'api', (SOURCE,), first)
            two = module.stream_archive(COMMIT, 'api', (SOURCE,), second)
            blob = module.git('cat-file', 'blob', COMMIT + ':' + SOURCE)
            self.assertEqual(one, two)
            self.assertEqual(first.read_bytes(), second.read_bytes())
            files = module.verify_files(COMMIT, first, 'api', (SOURCE,))
            self.assertEqual(files[SOURCE], hashlib.sha256(blob).hexdigest())

    def test_converted_line_endings_are_rejected_even_if_content_looks_equal(self):
        blob = module.git('cat-file', 'blob', COMMIT + ':' + SOURCE)
        self.assertIn(b'\n', blob)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'converted.tar.gz'
            with tarfile.open(path, 'w:gz') as tar:
                import io
                data = blob.replace(b'\n', b'\r\n')
                header = tarfile.TarInfo('api/' + SOURCE)
                header.size = len(data)
                tar.addfile(header, io.BytesIO(data))
            with self.assertRaisesRegex(RuntimeError, 'byte-for-byte'):
                module.verify_files(COMMIT, path, 'api', (SOURCE,))

    def test_archive_rejects_secret_paths_and_symlinks(self):
        import io
        for name, symlink in [('api/backend/.env', False),
                              ('api/backend/../../.env', False),
                              ('api/backend/server.js', True)]:
            with self.subTest(name=name, symlink=symlink), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / 'unsafe.tar.gz'
                with tarfile.open(path, 'w:gz') as tar:
                    header = tarfile.TarInfo(name)
                    if symlink:
                        header.type = tarfile.SYMTYPE
                        header.linkname = '.env'
                        tar.addfile(header)
                    else:
                        header.size = 1
                        tar.addfile(header, io.BytesIO(b'x'))
                with self.assertRaisesRegex(RuntimeError, 'Unsafe|Non-regular'):
                    module.verify_files(COMMIT, path, 'api', (SOURCE,))


if __name__ == '__main__':
    unittest.main()
