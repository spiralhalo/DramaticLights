# Dramatic Lights
A lighting effect shader for [Canvas](https://github.com/grondag/canvas) renderer (a fabric minecraft mod).

Development has been discontinued in favor of [Lumi Lights](https://github.com/spiralhalo/LumiLights).

## Features
1. Dawn and dusk "twilight" efect.
2. Directional sunlight on blocks (and entities with experimental pipeline enabled).
3. Ambient light - light blue during the day and dark blue during the night.
4. Hazy effect on block-lit indoor objects.

## `settings.glsl`
~Enable or disable fog by changing the value of `AMBIENT_FOG_ENABLED`.~

Custom fog is removed for now because it looks inconsistent with vanilla sky.

Changing settings requires render reload, typically triggered by resource reloading. There is no GUI for changing settings at the moment.

Current version is made to work with Canvas version 1.0.1027 to 1.0.1095-snapshot.

For testing only, but you can play normally with it if you know what you're doing.
