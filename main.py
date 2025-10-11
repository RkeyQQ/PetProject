
import urllib3
from vbr import VBR

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)  #to remove SSL warning as I am using false


def main():
    print("START")
    vbr = VBR()
    vbr.auth()
    vbr.get_repositories()
    vbr.get_jobs()
    print("END")

if __name__ == "__main__":
    main()

