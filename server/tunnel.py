# server/tunnel.py
# Cloudflare Quick Tunnel(cloudflared) 자동 준비·실행 및 공개 URL 추출
# Zero-Configuration: bin/ 없으면 자동 다운로드. 프로세스 종료 시 터널 자동 파기.

import atexit
import os
import platform
import re
import shutil
import subprocess
import sys
import threading
import urllib.request
from pathlib import Path

# 프로젝트 루트(server의 상위) 기준 bin 경로
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BIN_DIR = PROJECT_ROOT / "bin"
TUNNEL_URL_PATTERN = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

_tunnel_process: subprocess.Popen | None = None
_tunnel_url: str | None = None
_tunnel_ready = threading.Event()


def _get_platform_suffix() -> str:
    """OS·아키텍처에 맞는 cloudflared 파일명 접미사 반환."""
    system = sys.platform
    machine = platform.machine().lower()
    if system == "win32":
        return "cloudflared-windows-amd64.exe"
    if system == "darwin":
        return "cloudflared-darwin-arm64" if "arm" in machine or machine == "aarch64" else "cloudflared-darwin-amd64"
    if system == "linux":
        return "cloudflared-linux-arm64" if "arm" in machine or machine == "aarch64" else "cloudflared-linux-amd64"
    raise RuntimeError(f"Unsupported platform: {system} {machine}")


def _download_cloudflared() -> Path:
    """bin/에 cloudflared가 없으면 GitHub 최신 릴리스에서 다운로드."""
    BIN_DIR.mkdir(parents=True, exist_ok=True)
    suffix = _get_platform_suffix()
    exe_name = "cloudflared.exe" if suffix.endswith(".exe") else "cloudflared"
    local_path = BIN_DIR / exe_name

    if local_path.exists():
        return local_path

    url = f"https://github.com/cloudflare/cloudflared/releases/latest/download/{suffix}"
    print(f"[tunnel] Downloading cloudflared from {url} ...")
    try:
        with urllib.request.urlopen(url, timeout=60) as resp:
            data = resp.read()
    except Exception as e:
        raise RuntimeError(f"Failed to download cloudflared: {e}") from e

    local_path.write_bytes(data)
    if sys.platform != "win32":
        os.chmod(local_path, 0o755)
    print(f"[tunnel] Saved to {local_path}")
    return local_path


def _read_tunnel_url(process: subprocess.Popen, timeout_sec: float = 30.0) -> str | None:
    """프로세스 stdout에서 trycloudflare.com URL을 한 번 찾을 때까지 읽기."""
    import time
    deadline = time.monotonic() + timeout_sec
    while process.poll() is None and time.monotonic() < deadline:
        line = process.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        decoded = line.decode("utf-8", errors="ignore")
        m = TUNNEL_URL_PATTERN.search(decoded)
        if m:
            return m.group(0)
    return None


def start_tunnel(local_url: str = "http://localhost:3000") -> str | None:
    """
    cloudflared 퀵 터널을 백그라운드로 실행하고 공개 URL을 반환.
    이미 실행 중이면 기존 URL 반환. 실패 시 None.
    """
    global _tunnel_process, _tunnel_url, _tunnel_ready

    if _tunnel_url:
        return _tunnel_url

    try:
        exe = _download_cloudflared()
    except Exception as e:
        print(f"[tunnel] Skip tunnel: {e}", file=sys.stderr)
        return None

    cmd = [str(exe), "tunnel", "--url", local_url]
    try:
        _tunnel_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=str(PROJECT_ROOT),
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
    except Exception as e:
        print(f"[tunnel] Failed to start cloudflared: {e}", file=sys.stderr)
        return None

    def run():
        global _tunnel_url
        url = _read_tunnel_url(_tunnel_process)
        if url:
            _tunnel_url = url
            print(f"[tunnel] Ready: {url}")
        _tunnel_ready.set()

    t = threading.Thread(target=run, daemon=True)
    t.start()
    _tunnel_ready.wait(timeout=35.0)
    atexit.register(_stop_tunnel)
    return _tunnel_url


def get_tunnel_url() -> str | None:
    """현재 활성 터널 URL. 터널이 없거나 아직 준비 전이면 None."""
    return _tunnel_url


def _stop_tunnel():
    """cloudflared 프로세스 종료 (atexit에서 호출)."""
    global _tunnel_process, _tunnel_url
    if _tunnel_process is not None:
        try:
            _tunnel_process.terminate()
            _tunnel_process.wait(timeout=5)
        except Exception:
            try:
                _tunnel_process.kill()
            except Exception:
                pass
        _tunnel_process = None
    _tunnel_url = None
