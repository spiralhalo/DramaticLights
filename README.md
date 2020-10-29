# Dramatic Lights
A lighting effect shader for [Canvas](https://github.com/grondag/canvas) renderer (a fabric minecraft mod).

## Features
1. Dawn and dusk "twilight" efect.
2. Directional sunlight on blocks (and entities with experimental pipeline enabled).
3. Ambient light - light blue during the day and dark blue during the night.
4. Hazy effect on block-lit indoor objects.

## `settings.glsl`
Enable or disable fog by changing the value of `AMBIENT_FOG_ENABLED`.

Changing settings requires render reload, typically triggered by resource reloading. There is no GUI for changing settings at the moment.

Current version is made to work with Canvas 1.0.1027.

For testing only, but you can play normally with it if you know what you're doing.
