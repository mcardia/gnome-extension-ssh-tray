#!/bin/bash
gnome-extensions pack --force --extra-source=ssh-symbolic.svg --extra-source=functions.js
#gnome-extensions uninstall --force ssh-tray@mario.cardia.com.br.shell-extension.zip
gnome-extensions install --force ssh-tray@mario.cardia.com.br.shell-extension.zip
gnome-extensions enable ssh-tray@mario.cardia.com.br.shell-extension.zip
