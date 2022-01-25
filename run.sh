#!/bin/bash
reset
clear
./build.sh
dbus-run-session -- gnome-shell --nested --wayland
reset