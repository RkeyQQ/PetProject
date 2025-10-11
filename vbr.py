import requests
import json
import configparser

with open("secrets.json") as f:
    cfg = json.load(f)


BASE = cfg["BASE"]
USER = cfg["USER"]
PASS = cfg["PASS"]
VERIFY = cfg["VERIFY"]
API_VER = cfg["API_VER"]
LIMIT = cfg.get("LIMIT", 200)

class VBR:
    def __init__(self):
        self.s = requests.Session()
        self.s.verify = VERIFY
        self.token = None

    def auth(self):
        """Authenticate to Veeam REST API and store access token."""
        url = f"{BASE}/api/oauth2/token"
        data = {
            "grant_type": "password",
            "username": USER,
            "password": PASS
        }
        try:
            r = self.s.post(url, data=data, timeout=10)
            r.raise_for_status()
            self.token = r.json()["access_token"]
            print(f"✅ Authorized, token={self.token}")
        except Exception as e:
            print("🚫 Failed to authorize. Check address, port and certificate.")

    def _auth_headers(self):
        """Return authorization and API version headers for REST requests."""
        return {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/json",
            "x-api-version": API_VER,
        }

    def _get(self, path, params=None, label=None):
        url = f"{BASE}{path}"
        try:
            r = self.s.get(url, headers=self._auth_headers(), params=params or {}, timeout=10)
            r.raise_for_status()
            data = r.json()
            if label:
                count = len(data) if isinstance(data, list) else 'n/a'
                print(f"✅ Got {label}: {count}")
            return data
        except requests.HTTPError as e:
            VBR._print_http_error(e)
            return None

    def get_repositories(self, limit=LIMIT):
        return self._get("/api/v1/backupInfrastructure/repositories",
                         {"limit": limit}, "repositories")

    def get_jobs(self, limit=LIMIT):
        return self._get("/api/v1/jobs",
                         {"limit": limit}, "jobs")

    @staticmethod
    def _print_http_error(e):
        resp = e.response
        if resp is not None and resp.headers.get("Content-Type", "").startswith("application/json"):
            err = resp.json()
            msg = (
                f"{err.get('title', 'Error')}: "
                f"{err.get('message', '')} "
                f"(code {err.get('status', resp.status_code)})"
            )
        else:
            status = resp.status_code if resp else "no status"
            text = resp.text if resp else "no response body"
            msg = f"Unexpected response ({status}): {text}"
        print(f"🚫 {msg}")