: This script requres that 7zip (7z.exe) is on the path (accessible from command line).
set x=optimizegoogle
xcopy src build /i /e

: xcopy build\content build\chrome\content /i /e
: xcopy build\locale build\chrome\locale /i /e
: xcopy build\skin build\chrome\skin /i /e
: rmdir /s /q build\content
: rmdir /s /q build\locale
: rmdir /s /q build\skin

cd build\chrome
7z a -tzip "%x%.jar" * -r -mx=0
cd ..\..

rmdir /s /q build\chrome\content
rmdir /s /q build\chrome\locale
rmdir /s /q build\chrome\skin

: replace chrome.manifest build

cd build
7z a -tzip "%x%.xpi" * -r -mx=9
cd ..

move build\%x%.xpi %x%.xpi

rmdir /s /q build
