import glob
import os
def get_files(path):


    files = glob.glob(path + "/**/*", recursive=True)


    print(files)



    files.sort()



    return files


def get_content(files):




    all = open("all.txt", "w")
    all.write("")
    all.close()


    all = open("all.txt", "a")




    for file in files:

        if os.path.isdir(file):
            continue


        f = open(file, "r")


        content = f.read()


        all.write('content of file: ' + file + '\n\n```\n' + content + '\n```\n')


        f.close()


    all.close()

if __name__ == "__main__":


    # files = get_files("src/app/admin/panel/user-managment")

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/auth/reset-password")

    # C:/AM/Github/DigitalMenu/src/app/admin/panel/user-profile

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/admin/panel/restaurant-profile")

    # C:\AM\Github\DigitalMenu\src\app\admin\panel\user-profile
    # files = get_files("C:/AM/Github/DigitalMenu/src/app/admin/panel/user-profile")

    # please take pull again C:\AM\Github\DigitalMenu\src\app\admin\panel\unverify-account\verify-account

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/admin/panel/unverify-account/verify-account")

    # C:\AM\Github\DigitalMenu\src\app\admin\panel\unverify-account

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/admin/panel/unverify-account")

    # C:\AM\Github\DigitalMenu\src\app\admin\panel\unverify-account\verify-account

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/admin/panel/unverify-account/verify-account")

    # C:\AM\Github\DigitalMenu\src\app\admin\panel\settings\store

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/admin/panel/settings/store")

    # C:\AM\Github\DigitalMenu\src\app\restaurant\component\restaurant-menu\restaurant-cart

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/restaurant/component/restaurant-menu/restaurant-cart")

    # C:\AM\Github\DigitalMenu\src\app\restaurant\component\restaurant-menu\address\add-address-map

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/restaurant/component/restaurant-menu/address/add-address-map")

    # C:\AM\Github\DigitalMenu\src\app\restaurant\component\restaurant-menu\address\address-selection

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/restaurant/component/restaurant-menu/address/address-selection")

    # C:\AM\Github\DigitalMenu\src\app\restaurant\component\restaurant-menu\address

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/restaurant/component/restaurant-menu/address")

    # C:\AM\Github\DigitalMenu\src\app\restaurant\component\restaurant-menu\address\add-address-map\add-complete-address

    # files = get_files("C:/AM/Github/DigitalMenu/src/app/restaurant/component/restaurant-menu/address/add-address-map/add-complete-address")

    # C:\AM\Github\DigitalMenuBackend\models

    files = get_files("/workspaces/qrsayBackend/models")

    # C:\AM\Github\DigitalMenuBackend\controllers

    # files = get_files("C:/AM/Github/DigitalMenuBackend/controllers")

    get_content(files)
