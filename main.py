import os
import json
from storage import init_db, save_raw, cleanup_retention
from vbr import VBR
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)  #to remove SSL warning as I am using false


with open("secrets.json") as f:
    cfg = json.load(f)


DB_PATH = cfg["DB_PATH"]
RETENTION_DAYS = cfg["RETENTION_DAYS"]
LIMIT = cfg["LIMIT"]


def main():
    print("START")

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    init_db(DB_PATH)

    vbr = VBR()
    vbr.auth()
    # vbr.get_repositories()
    # vbr.get_jobs()

    data = vbr.get_repositories(LIMIT)
    if data:
        save_raw(DB_PATH, vbr.host, "repositories", data)

    data = vbr.get_jobs(LIMIT)
    if data:
        save_raw(DB_PATH, vbr.host, "jobs", data)

    cleanup_retention(DB_PATH, RETENTION_DAYS)
    print("END")

if __name__ == "__main__":
    main()

