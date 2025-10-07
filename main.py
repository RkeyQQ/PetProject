import requests
BASE = "https://vbr.example:9419"
USER = "admin"
PASS = "password"
VERIFY = False  # or path, example: VERIFY="C:/ca/vbr.pem"

class VBR:
    def __init__(self):
        self.s = requests.Session()
        self.s.verify = VERIFY
        self.token = None

    def auth(self):
        try:
            r = self.s.post(f"{BASE}/api/sessionMngr/?v=latest",
                            json={"UserName": USER, "Password": PASS},
                            timeout=10)
            r.raise_for_status()
            self.token = r.json().get("SessionId")
            if self.token:
                print("✅ Authorized")
                return True
        except requests.exceptions.RequestException:
            pass
        print("🚫 Failed to authorize. Check address, port and certificate.")
        return False


def main():
    vbr = VBR()
    vbr.auth()


if __name__ == "__main__":
    main()

