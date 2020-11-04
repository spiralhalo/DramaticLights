/*
    Glossy Goodness Material Shader
    Copyright (C) 2020  spiralhalo

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/******************************************************
  awoo:shaders/lib/skydir.glsl
******************************************************/

#define M_2PI 6.283185307179586476925286766559

// Direction from surface to the sky light source

vec3 gg_sunDir(float worldTime){
    float aRad = worldTime * M_2PI;
    return vec3(cos(aRad), sin(aRad), 0);
}