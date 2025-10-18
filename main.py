import os
import json
from storage import init_db, save_raw, cleanup_retention, init_repo_state_table, load_repo_states, load_job_states
from vbr import VBR
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)  #to remove SSL warning as I am using false


with open("secrets.json") as f:
    cfg = json.load(f)

COLLECT = cfg["COLLECT"]
LIMIT = cfg["LIMIT"]
DB_PATH = cfg["DB_PATH"]
RETENTION_DAYS = cfg["RETENTION_DAYS"]


def main():
    print("START")

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    init_db(DB_PATH)
    init_repo_state_table(DB_PATH)

    vbr = VBR()
    vbr.auth()

    dispatch = {
        "repository_states": ("repositories", vbr.get_repositories_states, load_repo_states),
        "job_states": ("jobs", vbr.get_jobs_states, load_job_states),
    }
    for item in COLLECT:
        if item not in dispatch:
            print(f"🚫 Failed to collect data. Unknown collect type: {item}")
            continue
        object_type, fetch_api_method, load_db_method = dispatch[item]
        data = fetch_api_method(LIMIT)

        if data:
            save_raw(DB_PATH, vbr.host, object_type, data)
            load_db_method(DB_PATH, vbr.host, data)

    cleanup_retention(DB_PATH, RETENTION_DAYS)
    print("END")


if __name__ == "__main__":
    main()

