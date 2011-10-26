#!/usr/bin/env sh
echo "Starting script"
x="optimizegoogle"
echo "Removing old xpi file"
rm $x.xpi

echo "Removing old build directory..."
rm -rf build
echo "Creating new build directory..."
cp -a  src build

echo "Building jar file..."
cd build/chrome
7z a -xr!?svn\* -tzip "$x.jar" * -r -mx=0
cd ../..

echo "Removing content not needed for xpi file..."
rm -rf build/chrome/content
rm -rf build/chrome/locale
rm -rf build/chrome/skin

echo "Building xpi file..."
cd build
7z a -xr!?svn\* -tzip "$x.xpi" * -r -mx=9
cd ..

echo "Creating $x.xpi"
mv build/$x.xpi $x.xpi

rm -rf build
echo "done!";

